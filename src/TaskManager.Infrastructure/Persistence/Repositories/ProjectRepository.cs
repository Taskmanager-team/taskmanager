using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Persistence.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly ApplicationDbContext _context;

        public ProjectRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default)
        {
            return await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id, ct);
        }

        public async Task<IReadOnlyList<Project>> GetByWorkspaceIdAsync(Guid workspaceId, CancellationToken ct = default)
        {
            return await _context.Projects
                .AsNoTracking()
                .Where(p => p.WorkspaceId == workspaceId)
                .ToListAsync(ct);
        }

        public async Task AddAsync(Project project, CancellationToken ct = default)
        {
            await _context.Projects.AddAsync(project, ct);
        }

        public void Update(Project project)
        {
            _context.Projects.Update(project);
        }

        public void Remove(Project project)
        {
            _context.Projects.Remove(project);
        }
    }
}