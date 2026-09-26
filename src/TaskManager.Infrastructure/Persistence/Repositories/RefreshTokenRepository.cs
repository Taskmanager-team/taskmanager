using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Persistence.Repositories
{
    public class RefreshTokenRepository : IRefreshTokenRepository
    {
        private readonly ApplicationDbContext _context ;
        public RefreshTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<RefreshToken?> GetByTokenHashAsync(string tokenHash,CancellationToken ct = default)
        {
            return await _context.RefreshTokens.FirstOrDefaultAsync(t=>t.TokenHash == tokenHash, ct);
        }
        public async Task AddAsync(RefreshToken token , CancellationToken ct = default)
        {
            await _context.RefreshTokens.AddAsync(token, ct);
        }
        public void Update(RefreshToken token)
        {
            _context.RefreshTokens.Update(token);
        }
        public async Task RevokeFamilyAsync(Guid familyId, CancellationToken ct = default)
        {
            var activeToken = await _context.RefreshTokens.Where(t=>t.FamilyId == familyId && t.RevokedAt == null).ToListAsync(ct);
            foreach(var token in activeToken){
                token.Revoke();
            }
        }
    }
}