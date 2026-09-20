import { Link, useParams } from 'react-router-dom';
import { useProjects } from '../api/queries';

export function ProjectsPage() {
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const { data, isPending, error } = useProjects(workspaceId);

  if (isPending) return <p className="state">Chargement des projets...</p>;
  if (error) return <p className="state state-error">{error.message}</p>;

  return (
    <section>
      <Link to="/" className="back">
        Retour aux workspaces
      </Link>
      <h1>Projets</h1>
      <ul className="card-list">
        {data?.map((project) => (
          <li key={project.id} className="card">
            <Link to={`/projects/${project.id}/tasks`}>{project.name}</Link>
            <span className="meta">{project.taskCount} tache(s)</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
