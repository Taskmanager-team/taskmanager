import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { isAuthError, NO_ERRORS } from '../auth/authErrors';
import type { FormErrors } from '../auth/authErrors';
import { useAuth } from '../auth/useAuth';
import { validateLogin } from '../auth/validation';
import { FieldErrors } from '../components/FieldErrors';

function redirectTarget(state: unknown): string {
  if (typeof state === 'object' && state !== null && 'from' in state) {
    const { from } = state as { from: unknown };
    if (typeof from === 'string' && from.startsWith('/')) return from;
  }
  return '/';
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  const target = redirectTarget(location.state);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const byField = validateLogin({ email, password });
    if (Object.keys(byField).length > 0) {
      setErrors({ global: [], byField });
      return;
    }

    setErrors(NO_ERRORS);
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(target, { replace: true });
    } catch (error) {
      setErrors(
        isAuthError(error)
          ? error.formErrors
          : { global: ['Connexion impossible.'], byField: {} },
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthenticated) return <Navigate to={target} replace />;

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="page-head">
          <h1>Connexion</h1>
          <p className="subtitle">Accede a tes workspaces.</p>
        </div>

        {errors.global.length > 0 && (
          <ul className="form-errors" role="alert">
            {errors.global.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.byField.email)}
              aria-describedby={
                errors.byField.email ? 'login-email-errors' : undefined
              }
            />
            <FieldErrors
              id="login-email-errors"
              messages={errors.byField.email}
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.byField.password)}
              aria-describedby={
                errors.byField.password ? 'login-password-errors' : undefined
              }
            />
            <FieldErrors
              id="login-password-errors"
              messages={errors.byField.password}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ? <Link to="/register">Creer un compte</Link>
        </p>
      </section>
    </div>
  );
}
