using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Identity;
using System.Linq;
using DomainUser = TaskManager.Domain.Entities.User;
using Microsoft.Extensions.Options;
using TaskManager.Infrastructure.Auth;
using DomainRefreshToken = TaskManager.Domain.Entities.RefreshToken;
namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IRefreshTokenService _refreshTokenService;
        private readonly JwtSettings _jwtSettings;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService,
            IUnitOfWork unitOfWork,
            IRefreshTokenService refreshTokenService,
            IOptions<JwtSettings> jwtSettings)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _unitOfWork = unitOfWork;
            _refreshTokenService = refreshTokenService;
            _jwtSettings = jwtSettings.Value;
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request,CancellationToken ct ){
            var existing = await _userManager.FindByEmailAsync(request.Email);
            if(existing is not null){
                return Conflict(new {message="Cet email est deja utilisé"});
            }
            var identityUser = new ApplicationUser
            {   
                UserName = request.Email,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName
            };
            var result = await _userManager.CreateAsync(identityUser,request.Password);
            if(!result.Succeeded){
                var errors = result.Errors.Select(e=>e.Description);
                return BadRequest(new {message="Erreur lors de la création de l'utilisateur",errors});
            }

            var domainUser = DomainUser.Create(identityUser.Id, request.FirstName, request.LastName, request.Email);
            await _unitOfWork.Users.AddAsync(domainUser,ct);
            await _unitOfWork.SaveChangesAsync(ct);

            return Created(string.Empty,new{id=domainUser.Id});
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request,CancellationToken ct){
            var identityUser = await _userManager.FindByEmailAsync(request.Email);
            if(identityUser is null){
                return Unauthorized(new {message="Email ou mot de passe incorrect"});
            }
            var passwordValid = await _userManager.CheckPasswordAsync(identityUser,request.Password);
            if(!passwordValid){
                return Unauthorized(new {message="Email ou mot de passe incorrect"});
            }
            var roles = await _userManager.GetRolesAsync(identityUser);
            var domainUser = await _unitOfWork.Users.GetByIdentityUserIdAsync(identityUser.Id,ct);
            if(domainUser is null){
                return Unauthorized(new {message="Utilisateur non trouvé"});
            }
            var accessToken = await _tokenService.GenerateAccessTokenAsync(
                identityUser.Id, identityUser.Email, domainUser, roles);

            var rawRefreshToken = _refreshTokenService.GenerateRawToken();
            var hash = _refreshTokenService.Hash(rawRefreshToken);
            var refreshTokenEntity = DomainRefreshToken.CreateNew(
                identityUser.Id, hash, DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays));

            await _unitOfWork.RefreshTokens.AddAsync(refreshTokenEntity, ct);
            await _unitOfWork.SaveChangesAsync(ct);

            return Ok(new { accessToken, refreshToken = rawRefreshToken });
        }
    [HttpPost("refresh")]
        public async Task<IActionResult> Refresh(RefreshRequest request, CancellationToken ct)
        {
            var hash = _refreshTokenService.Hash(request.RefreshToken);
            var existingToken = await _unitOfWork.RefreshTokens.GetByTokenHashAsync(hash, ct);

            if (existingToken is null)
                return Unauthorized(new { message = "Refresh token invalide" });

            // Détection de réutilisation : ce token a déjà été consommé (rotation) ou révoqué
            if (existingToken.IsRevoked)
            {
                await _unitOfWork.RefreshTokens.RevokeFamilyAsync(existingToken.FamilyId, ct);
                await _unitOfWork.SaveChangesAsync(ct);
                return Unauthorized(new { message = "Session compromise détectée, veuillez vous reconnecter" });
            }

            if (existingToken.IsExpired)
                return Unauthorized(new { message = "Refresh token expiré" });

            var identityUser = await _userManager.FindByIdAsync(existingToken.IdentityUserId.ToString());
            if (identityUser is null)
                return Unauthorized(new { message = "Utilisateur introuvable" });

            var domainUser = await _unitOfWork.Users.GetByIdentityUserIdAsync(identityUser.Id, ct);
            if (domainUser is null)
                return Unauthorized(new { message = "Utilisateur introuvable" });

            var roles = await _userManager.GetRolesAsync(identityUser);

            // Rotation : nouveau token dans la même famille, ancien marqué comme remplacé
            var newRawToken = _refreshTokenService.GenerateRawToken();
            var newHash = _refreshTokenService.Hash(newRawToken);
            var newTokenEntity = DomainRefreshToken.CreateInFamily(
                existingToken.IdentityUserId,
                newHash,
                existingToken.FamilyId,
                DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays));

            await _unitOfWork.RefreshTokens.AddAsync(newTokenEntity, ct);
            existingToken.MarkReplacedBy(newTokenEntity.Id);
            _unitOfWork.RefreshTokens.Update(existingToken);

            var newAccessToken = await _tokenService.GenerateAccessTokenAsync(
                identityUser.Id, identityUser.Email, domainUser, roles);

            await _unitOfWork.SaveChangesAsync(ct);

            return Ok(new { accessToken = newAccessToken, refreshToken = newRawToken });
        }
    }
    public record RegisterRequest(string Email, string Password, string FirstName, string LastName);
    public record LoginRequest(string Email, string Password);
    public record RefreshRequest(string RefreshToken);
}