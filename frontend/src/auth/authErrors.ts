export type FormErrors = {
  global: string[];
  byField: Record<string, string[]>;
};

export const NO_ERRORS: FormErrors = { global: [], byField: {} };

function toCamelCase(key: string): string {
  return key.charAt(0).toLowerCase() + key.slice(1);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
  );
}

export function toFormErrors(problem: unknown, fallback: string): FormErrors {
  if (typeof problem !== 'object' || problem === null) {
    return { global: [fallback], byField: {} };
  }

  const body = problem as Record<string, unknown>;
  const byField: Record<string, string[]> = {};
  const global: string[] = [];

  if (
    typeof body.errors === 'object' &&
    body.errors !== null &&
    !Array.isArray(body.errors)
  ) {
    for (const [field, messages] of Object.entries(body.errors)) {
      if (isStringArray(messages)) byField[toCamelCase(field)] = messages;
    }
  }

  if (isStringArray(body.errors)) global.push(...body.errors);

  if (typeof body.message === 'string') global.push(body.message);
  else if (typeof body.title === 'string') global.push(body.title);

  if (global.length === 0 && Object.keys(byField).length === 0) {
    global.push(fallback);
  }

  return { global, byField };
}

export class AuthError extends Error {
  readonly formErrors: FormErrors;

  constructor(formErrors: FormErrors) {
    super(formErrors.global[0] ?? 'Erreur d authentification.');
    this.name = 'AuthError';
    this.formErrors = formErrors;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
