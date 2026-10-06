import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useChangeMemberRole,
  useInviteMember,
  useMembers,
  useWorkspaces,
} from '../api/queries';
import { FieldErrors } from '../components/FieldErrors';
import { SkeletonList } from '../components/SkeletonList';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MembersPage() {
  const { workspaceId = '' } = useParams<{ workspaceId: string }>();
  const { data: workspaces } = useWorkspaces();
  const { data, isPending, error, refetch, isFetching } =
    useMembers(workspaceId);
  const invite = useInviteMember(workspaceId);
  const changeRole = useChangeMemberRole(workspaceId);

  const [email, setEmail] = useState('');
  const [emailErrors, setEmailErrors] = useState<string[]>([]);

  const workspace = workspaces?.find((item) => item.id === workspaceId);

  /*
   * Masquage d'interface uniquement : il evite de proposer une action qui
   * finirait en 403, il ne protege rien. L'autorisation reelle est verifiee
   * cote serveur (SCRUM-30), et le backend reste seul juge.
   */
  const isAdmin = workspace?.myRole === 'Admin';

  function handleInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const value = email.trim();
    if (value.length === 0) {
      setEmailErrors(['L email est obligatoire.']);
      return;
    }
    if (!EMAIL_PATTERN.test(value)) {
      setEmailErrors(['Format d email invalide.']);
      return;
    }

    setEmailErrors([]);
    invite.mutate(value, { onSuccess: () => setEmail('') });
  }

  return (
    <section>
      <Link to={`/workspaces/${workspaceId}`} className="back">
        &lsaquo; Projets
      </Link>

      <div className="page-head">
        <h1>Membres</h1>
        <p className="subtitle">
          {workspace ? workspace.name : ' '}
          {workspace && !isAdmin && ' - tu es membre de cet espace'}
        </p>
      </div>

      {isAdmin && (
        <>
          <form onSubmit={handleInvite} className="inline-form" noValidate>
            <div className="field">
              <label htmlFor="invite-email">Inviter un membre</label>
              <input
                id="invite-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="email@exemple.com"
                aria-invalid={emailErrors.length > 0}
                aria-describedby={
                  emailErrors.length > 0 ? 'invite-email-errors' : undefined
                }
              />
              <FieldErrors id="invite-email-errors" messages={emailErrors} />
            </div>
            <button type="submit" disabled={invite.isPending}>
              {invite.isPending ? 'Invitation...' : 'Inviter'}
            </button>
          </form>
          <p className="meta form-hint">
            La personne doit deja avoir un compte TaskManager.
          </p>
        </>
      )}

      {invite.error && (
        <p className="state state-error" role="alert">
          {invite.error.message}
        </p>
      )}
      {changeRole.error && (
        <p className="state state-error" role="alert">
          {changeRole.error.message}
        </p>
      )}

      {isPending && <SkeletonList rows={2} />}

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
        <p className="empty">Aucun membre dans cet espace.</p>
      )}

      {data && data.length > 0 && (
        <ul className="card-list">
          {data.map((member) => (
            <li key={member.userId} className="card">
              <div className="card-body">
                <span className="card-title">{member.fullName}</span>
                <span className="meta">{member.email}</span>
              </div>
              <div className="card-side">
                <span
                  className={
                    member.role === 'Admin'
                      ? 'pill pill-done'
                      : 'pill pill-todo'
                  }
                >
                  {member.role}
                </span>

                {isAdmin && (
                  <button
                    type="button"
                    className="role-toggle"
                    disabled={changeRole.isPending}
                    onClick={() =>
                      changeRole.mutate({
                        userId: member.userId ?? '',
                        role: member.role === 'Admin' ? 'Member' : 'Admin',
                      })
                    }
                  >
                    {member.role === 'Admin'
                      ? 'Retirer Admin'
                      : 'Promouvoir Admin'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
