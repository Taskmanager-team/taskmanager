using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Identity;
using System.Linq;
using DomainUser = TaskManager.Domain.Entities.User;

namespace TaskManager.Api.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IUnitOfWork _unitOfWork;

        public AuthController(
            UserManager<ApplicationUser> userManager,
            ITokenService tokenService,
            IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _unitOfWork = unitOfWork;
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
            var token = await _tokenService.GenerateAccessTokenAsync(
                identityUser.Id,
                identityUser.Email,
                domainUser,
                roles
            );
            return Ok(new {accessToken=token});
        }
    }
    public record RegisterRequest(string Email, string Password, string FirstName, string LastName);
    public record LoginRequest(string Email, string Password);
}