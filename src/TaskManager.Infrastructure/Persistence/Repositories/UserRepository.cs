using Microsoft.EntityFrameworkCore;
using TaskManager.Application.Interfaces;
using TaskManager.Domain.Entities;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Persistence.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;

        public UserRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Members
                .FirstOrDefaultAsync(u => u.Id == id, ct);
        }

        public async Task<User?> GetByIdentityUserIdAsync(Guid identityUserId, CancellationToken ct = default)
        {
            return await _context.Members
                .FirstOrDefaultAsync(u => u.IdentityUserId == identityUserId, ct);
        }

        public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        {
            return await _context.Members
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Email == email, ct);
        }

        public async Task AddAsync(User user, CancellationToken ct = default)
        {
            await _context.Members.AddAsync(user, ct);
        }

        public void Update(User user)
        {
            _context.Members.Update(user);
        }

        public void Remove(User user)
        {
            _context.Members.Remove(user);
        }
    }
}