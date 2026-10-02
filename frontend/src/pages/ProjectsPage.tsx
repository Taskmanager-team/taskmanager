import { Link, useParams } from 'react-router-dom';
import { useProjects } from '../api/queries';
import { SkeletonList } from '../components/SkeletonList';

export function ProjectsPage() {
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const { data, isPending, error } = useProjects(workspaceId);

  return (
    <section>
      <Link to="/" className="back">
        &lsaquo; Workspaces
      </Link>

      <div className="page-head">
        <h1>Projets</h1>
        <p className="subtitle">
          {data ? `${data.length} projet(s) dans cet espace` : ' '}
        </p>
      </div>

      {isPending && <SkeletonList />}
      {error && <p className="state state-error">{error.message}</p>}

      {data && data.length === 0 && (
        <p className="empty">Aucun projet dans ce workspace.</p>
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
