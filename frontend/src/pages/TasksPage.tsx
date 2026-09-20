import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { TaskItemDto, TaskItemStatus } from '../api/client';
import { useCreateTask, useTasks } from '../api/queries';
import { SkeletonList } from '../components/SkeletonList';

const STATUS_LABELS: Record<TaskItemStatus, string> = {
  ToDo: 'A faire',
  InProgress: 'En cours',
  InReview: 'En revue',
  Done: 'Terminee',
};

function StatusPill({ status }: { status: TaskItemDto['status'] }) {
  if (!status) return null;
  return (
    <span className={`pill pill-${status.toLowerCase()}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function TasksPage() {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const { data, isPending, error } = useTasks(projectId);
  const createTask = useCreateTask(projectId);
  const [title, setTitle] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    createTask.mutate(trimmed, { onSuccess: () => setTitle('') });
  }

  return (
    <section>
      <Link to="/" className="back">
        &lsaquo; Workspaces
      </Link>

      <div className="page-head">
        <h1>Taches</h1>
        <p className="subtitle">
          {data ? `${data.totalCount ?? 0} tache(s) au total` : ' '}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="new-task">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ajouter une tache..."
          aria-label="Titre de la nouvelle tache"
        />
        <button type="submit" disabled={createTask.isPending}>
          {createTask.isPending ? 'Ajout...' : 'Ajouter'}
        </button>
      </form>

      {createTask.error && (
        <p className="state state-error">{createTask.error.message}</p>
      )}

      {isPending && <SkeletonList />}
      {error && <p className="state state-error">{error.message}</p>}

      {data?.items?.length === 0 && (
        <p className="empty">
          Aucune tache. Ajoute la premiere avec le champ ci-dessus.
        </p>
      )}

      {data?.items && data.items.length > 0 && (
        <ul className="card-list">
          {data.items.map((task) => (
            <li key={task.id} className="card">
              <div className="card-body">
                <span className="card-title">{task.title}</span>
                {task.priority && (
                  <span className={`priority priority-${task.priority}`}>
                    {task.priority}
                  </span>
                )}
              </div>
              <div className="card-side">
                {(task.commentCount ?? 0) > 0 && (
                  <span className="meta">
                    {task.commentCount} commentaire(s)
                  </span>
                )}
                <StatusPill status={task.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
