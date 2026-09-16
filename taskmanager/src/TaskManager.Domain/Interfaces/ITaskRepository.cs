using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using System.Threading.Tasks;
namespace TaskManager.Domain.Interfaces
{
    public interface ITaskRepository
    {
        Task<TaskItem?> GetByIdAsync(Guid id,CancellationToken ct = default);
        Task<IReadOnlyList<TaskItem>> GetByProjectIdAsync(Guid projectId, CancellationToken ct = default );
        Task<IReadOnlyList<TaskItem>> GetByStatusAsync(Guid projectId,TaskStatu Status,CancellationToken ct =default);
        Task<IReadOnlyList<TaskItem>> GetByAssignedUserIdAsync(Guid userId, CancellationToken ct = default);
        Task AddAsync(TaskItem task,CancellationToken ct = default);
        void Update(TaskItem task);
        void Remove(TaskItem task);
    }
}