import { Link, useParams } from 'react-router-dom';
import { useProjects } from '../api/queries';
import { SkeletonList } from '../components/SkeletonList';

export function ProjectsPage() {
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const { data, isPending, error, refetch, isFetching } =
    useProjects(workspaceId);

  return (
    <section>
      <Link to="/" className="back">
        &lsaquo; Workspaces
      </Link>

      <div className="page-head page-head-row">
        <div>
          <h1>Projets</h1>
          <p className="subtitle">
            {data ? `${data.length} projet(s) dans cet espace` : ' '}
          </p>
        </div>
        <Link to={`/workspaces/${workspaceId}/members`} className="secondary">
          Membres
        </Link>
      </div>

      {isPending && <SkeletonList />}

      {error && (
        <div className="state state-error" role="alert">
          <p>{error.message}</p>
          <button
            type="button"
            className="retry"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            {isFetching ? 'Nouvelle tentative...' : 'Reessayer'}
          </button>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="empty">
          <p>Aucun projet dans ce workspace.</p>
          <p className="meta">Les projets crees apparaitront ici.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="card-list">
          {data.map((project) => (
            <li key={project.id}>
              <Link
                to={`/projects/${project.id}/tasks`}
                className="card card-link"
              >
                <div className="card-body">
                  <span className="card-title">{project.name}</span>
                  <span className="meta">
                    {project.taskCount ?? 0} tache(s)
                  </span>
                </div>
                <div className="card-side">
                  <span
                    className={
                      project.status === 'Archived'
                        ? 'pill pill-todo'
                        : 'pill pill-done'
                    }
                  >
                    {project.status === 'Archived' ? 'Archive' : 'Actif'}
                  </span>
                  <span className="chevron" aria-hidden="true">
                    &rsaquo;
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
