using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Persistence.Repositories
{
    public class WorkspaceRepository : IWorkspaceRepository
    {
        private readonly ApplicationDbContext _context;

        public WorkspaceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Workspace?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Workspaces
                .FirstOrDefaultAsync(w => w.Id == id, ct);
        }

        public async Task<Workspace?> GetByIdWithMembersAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Workspaces
                .Include(w => w.Members)
                .FirstOrDefaultAsync(w => w.Id == id, ct);
        }

        public async Task<IReadOnlyList<Workspace>> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct = default)
        {
            return await _context.Workspaces
                .AsNoTracking()
                .Where(w => w.OwnerId == ownerId)
                .ToListAsync(ct);
        }

        public async Task AddAsync(Workspace workspace, CancellationToken ct = default)
        {
            await _context.Workspaces.AddAsync(workspace, ct);
        }

        public void Update(Workspace workspace)
        {
            _context.Workspaces.Update(workspace);
        }

        public void Remove(Workspace workspace)
        {
            _context.Workspaces.Remove(workspace);
        }
    }
}