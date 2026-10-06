import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCreateWorkspace, useWorkspaces } from '../api/queries';
import { FieldErrors } from '../components/FieldErrors';
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

const NAME_MAX_LENGTH = 150;

export function WorkspacesPage() {
  const { data, isPending, error, refetch, isFetching } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();

  const [name, setName] = useState('');
  const [nameErrors, setNameErrors] = useState<string[]>([]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = name.trim();
    if (value.length === 0) {
      setNameErrors(['Le nom est obligatoire.']);
      return;
    }
    if (value.length > NAME_MAX_LENGTH) {
      setNameErrors([
        `Le nom ne doit pas depasser ${NAME_MAX_LENGTH} caracteres.`,
      ]);
      return;
    }

    setNameErrors([]);
    createWorkspace.mutate(value, { onSuccess: () => setName('') });
  }

  return (
    <section>
      <div className="page-head">
        <h1>Mes workspaces</h1>
        <p className="subtitle">
          Choisis un espace pour voir ses projets et ses taches.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="inline-form" noValidate>
        <div className="field">
          <label htmlFor="workspace-name">Nouveau workspace</label>
          <input
            id="workspace-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nom du workspace"
            maxLength={NAME_MAX_LENGTH + 1}
            aria-invalid={nameErrors.length > 0}
            aria-describedby={
              nameErrors.length > 0 ? 'workspace-name-errors' : undefined
            }
          />
          <FieldErrors id="workspace-name-errors" messages={nameErrors} />
        </div>
        <button type="submit" disabled={createWorkspace.isPending}>
          {createWorkspace.isPending ? 'Creation...' : 'Creer'}
        </button>
      </form>

      {createWorkspace.error && (
        <p className="state state-error" role="alert">
          {createWorkspace.error.message}
        </p>
      )}

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
          <p>Aucun workspace pour le moment.</p>
          <p className="meta">
            Cree ton premier espace avec le champ ci-dessus.
          </p>
        </div>
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
