namespace TaskManager.Application.Interfaces
{
    public interface IUnitOfWork
    {
        ITaskRepository Tasks { get; }
        IProjectRepository Projects { get; }
        IWorkspaceRepository Workspaces { get; }
        IUserRepository Users { get; }
        IRefreshTokenRepository RefreshTokens {get;}

        Task<int> SaveChangesAsync(CancellationToken ct = default);
    }
}