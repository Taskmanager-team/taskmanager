import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCreateTask, useTasks } from '../api/queries';

export function TasksPage() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { data, isPending, error } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const [title, setTitle] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask.mutate(trimmed, { onSuccess: () => setTitle('') });
  }

  if (isPending) return <p className="state">Chargement des taches...</p>;
  if (error) return <p className="state state-error">{error.message}</p>;

  return (
    <section>
      <Link to="/" className="back">
        Retour aux workspaces
      </Link>
      <h1>Taches</h1>

      <form onSubmit={handleSubmit} className="new-task">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nouvelle tache"
          aria-label="Titre de la nouvelle tache"
        />
        <button type="submit" disabled={createTask.isPending}>
          {createTask.isPending ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>
      {createTask.error && (
        <p className="state state-error">{createTask.error.message}</p>
      )}

      <ul className="card-list">
        {data?.items?.map((task) => (
          <li key={task.id} className="card">
            <span>{task.title}</span>
            <span className="meta">
              {task.status} · {task.priority}
            </span>
          </li>
        ))}
      </ul>
      <p className="meta">{data?.totalCount ?? 0} tache(s) au total</p>
    </section>
  );
}
