import { Link } from 'react-router-dom';
import { useWorkspaces } from '../api/queries';
import { SkeletonList } from '../components/SkeletonList';

/** Initiales affichees dans la pastille d'un workspace. */
function initials(name: string | undefined) {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function WorkspacesPage() {
  const { data, isPending, error } = useWorkspaces();

  return (
    <section>
      <div className="page-head">
        <h1>Mes workspaces</h1>
        <p className="subtitle">
          Choisis un espace pour voir ses projets et ses taches.
        </p>
      </div>

      {isPending && <SkeletonList />}
      {error && <p className="state state-error">{error.message}</p>}

      {data && data.length === 0 && (
        <p className="empty">Aucun workspace pour le moment.</p>
      )}

      {data && data.length > 0 && (
        <ul className="card-list">
          {data.map((workspace) => (
            <li key={workspace.id}>
              <Link
                to={`/workspaces/${workspace.id}`}
                className="card card-link"
              >
                <div className="card-side">
                  <span className="avatar" aria-hidden="true">
                    {initials(workspace.name)}
                  </span>
                  <div className="card-body">
                    <span className="card-title">{workspace.name}</span>
                    <span className="meta">{workspace.myRole}</span>
                  </div>
                </div>
                <span className="chevron" aria-hidden="true">
                  &rsaquo;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
