using TaskManager.Application.Interfaces;
using TaskManager.Infrastructure.Persistence;

namespace TaskManager.Infrastructure.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public ITaskRepository Tasks { get; }
        public IProjectRepository Projects { get; }
        public IWorkspaceRepository Workspaces { get; }
        public IUserRepository Users { get; }
        public IRefreshTokenRepository RefreshTokens{ get; }

        public UnitOfWork(
            ApplicationDbContext context,
            ITaskRepository taskRepository,
            IProjectRepository projectRepository,
            IWorkspaceRepository workspaceRepository,
            IUserRepository userRepository,
            IRefreshTokenRepository refreshTokenRepository
            )
        {
            _context = context;
            Tasks = taskRepository;
            Projects = projectRepository;
            Workspaces = workspaceRepository;
            Users = userRepository;
            RefreshTokens = refreshTokenRepository ;
        }

        public Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            return _context.SaveChangesAsync(ct);
        }
    }
}