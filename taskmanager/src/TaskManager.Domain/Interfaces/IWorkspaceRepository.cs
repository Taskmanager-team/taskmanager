using TaskManager.Domain.Entities;

namespace TaskManager.Domain.Interfaces
{
    public interface IWorkspaceRepository
    {
        Task<Workspace?> GetByIdAsync(Guid id, CancellationToken ct = default);

        // Inclut les Members (nécessaires pour valider les règles métier comme "au moins un Admin")
        Task<Workspace?> GetByIdWithMembersAsync(Guid id, CancellationToken ct = default);

        Task<IReadOnlyList<Workspace>> GetByOwnerIdAsync(Guid ownerId, CancellationToken ct = default);

        Task AddAsync(Workspace workspace, CancellationToken ct = default);

        void Update(Workspace workspace);

        void Remove(Workspace workspace);
    }
}