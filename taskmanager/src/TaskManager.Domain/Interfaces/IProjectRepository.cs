using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces
{
    public interface IProjectRepository
    {
        Task<Project?> GetByIdAsync(Guid id, CancellationToken ct = default);

        Task<IReadOnlyList<Project>> GetByWorkspaceIdAsync(Guid workspaceId, CancellationToken ct = default);

        Task AddAsync(Project project, CancellationToken ct = default);

        void Update(Project project);

        void Remove(Project project);
    }
}