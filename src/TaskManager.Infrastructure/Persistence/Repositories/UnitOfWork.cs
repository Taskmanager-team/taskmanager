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

        public UnitOfWork(
            ApplicationDbContext context,
            ITaskRepository taskRepository,
            IProjectRepository projectRepository,
            IWorkspaceRepository workspaceRepository,
            IUserRepository userRepository
            )
        {
            _context = context;
            Tasks = taskRepository;
            Projects = projectRepository;
            Workspaces = workspaceRepository;
            Users = userRepository;
        }

        public Task<int> SaveChangesAsync(CancellationToken ct = default)
        {
            return _context.SaveChangesAsync(ct);
        }
    }
}