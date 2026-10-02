import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { isAuthError, NO_ERRORS } from '../auth/authErrors';
import type { FormErrors } from '../auth/authErrors';
import { useAuth } from '../auth/useAuth';
import { validateRegister } from '../auth/validation';
import { FieldErrors } from '../components/FieldErrors';

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const values = { firstName, lastName, email, password };
    const byField = validateRegister(values);
    if (Object.keys(byField).length > 0) {
      setErrors({ global: [], byField });
      return;
    }

    setErrors(NO_ERRORS);
    setSubmitting(true);

    try {
      await register(values);
      navigate('/', { replace: true });
    } catch (error) {
      setErrors(
        isAuthError(error)
          ? error.formErrors
          : { global: ['Inscription impossible.'], byField: {} },
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <div className="page-head">
          <h1>Creer un compte</h1>
          <p className="subtitle">
            8 caracteres minimum, avec chiffre, majuscule, minuscule et
            caractere special.
          </p>
        </div>

        {errors.global.length > 0 && (
          <ul className="form-errors" role="alert">
            {errors.global.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field-row">
            <div className="field">
              <label htmlFor="register-first-name">Prenom</label>
              <input
                id="register-first-name"
                autoComplete="given-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                aria-invalid={Boolean(errors.byField.firstName)}
                aria-describedby={
                  errors.byField.firstName
                    ? 'register-first-name-errors'
                    : undefined
                }
              />
              <FieldErrors
                id="register-first-name-errors"
                messages={errors.byField.firstName}
              />
            </div>

            <div className="field">
              <label htmlFor="register-last-name">Nom</label>
              <input
                id="register-last-name"
                autoComplete="family-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                aria-invalid={Boolean(errors.byField.lastName)}
                aria-describedby={
                  errors.byField.lastName
                    ? 'register-last-name-errors'
                    : undefined
                }
              />
              <FieldErrors
                id="register-last-name-errors"
                messages={errors.byField.lastName}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(errors.byField.email)}
              aria-describedby={
                errors.byField.email ? 'register-email-errors' : undefined
              }
            />
            <FieldErrors
              id="register-email-errors"
              messages={errors.byField.email}
            />
          </div>

          <div className="field">
            <label htmlFor="register-password">Mot de passe</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.byField.password)}
              aria-describedby={
                errors.byField.password ? 'register-password-errors' : undefined
              }
            />
            <FieldErrors
              id="register-password-errors"
              messages={errors.byField.password}
            />
          </div>

          <button type="submit" disabled={submitting}>
            {submitting ? 'Creation...' : 'Creer mon compte'}
          </button>
        </form>

        <p className="auth-switch">
          Deja un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </section>
    </div>
  );
}
