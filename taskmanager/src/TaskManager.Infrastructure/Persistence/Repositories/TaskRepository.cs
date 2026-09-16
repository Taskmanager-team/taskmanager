using Microsoft.EntityFrameworkCore;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Persistence.Repositories
{
    public class TaskRepository : ITaskRepository
    {
        private readonly ApplicationDbContext _context;
        public TaskRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        public async Task<TaskItem?> GetByIdAsync(Guid id,CancellationToken ct = default)
        {
            return await _context.TaskItems.FirstOrDefaultAsync(t=>t.Id ==id,ct);
        }
        public async Task<IReadOnlyList<TaskItem>> GetByProjectIdAsync(Guid projectId,CancellationToken ct = default)
        {
            return await _context.TaskItems.AsNoTracking().Where(t => t.ProjectId == projectId).ToListAsync(ct);
        }
        public async Task<IReadOnlyList<TaskItem>> GetByStatusAsync(Guid projectId,TaskStatu status,CancellationToken ct = default)
        {
            return await _context.TaskItems.AsNoTracking().Where(t=> t.ProjectId ==projectId && t.Status == status).ToListAsync(ct);
        }
         public async Task<IReadOnlyList<TaskItem>> GetByAssignedUserIdAsync(Guid userId, CancellationToken ct = default)
        {
            return await _context.TaskItems
                .AsNoTracking()
                .Where(t => t.AssignedUserIds.Contains(userId))
                .ToListAsync(ct);
        }
        public async Task AddAsync(TaskItem task, CancellationToken ct = default)
        {
            await _context.TaskItems.AddAsync(task, ct);
        }
        public void Update(TaskItem task)
        {
            _context.TaskItems.Update(task);
        }
        public void Remove(TaskItem task)
        {
            _context.TaskItems.Remove(task);
        }

    }
}