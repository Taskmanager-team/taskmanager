const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 100;

export type LoginValues = {
  email: string;
  password: string;
};

export type RegisterValues = LoginValues & {
  firstName: string;
  lastName: string;
};

function emailErrors(value: string): string[] {
  const email = value.trim();
  if (email.length === 0) return ['L email est obligatoire.'];
  if (!EMAIL_PATTERN.test(email)) return ['Format d email invalide.'];
  return [];
}

function nameErrors(value: string, label: string): string[] {
  const name = value.trim();
  if (name.length === 0) return [`${label} est obligatoire.`];
  if (name.length > NAME_MAX_LENGTH) {
    return [`${label} ne doit pas depasser ${NAME_MAX_LENGTH} caracteres.`];
  }
  return [];
}

function passwordStrengthErrors(value: string): string[] {
  const messages: string[] = [];
  if (value.length < 8) messages.push('8 caracteres minimum.');
  if (!/[0-9]/.test(value)) messages.push('Au moins un chiffre.');
  if (!/[a-z]/.test(value)) messages.push('Au moins une minuscule.');
  if (!/[A-Z]/.test(value)) messages.push('Au moins une majuscule.');
  if (!/[^a-zA-Z0-9]/.test(value)) {
    messages.push('Au moins un caractere special.');
  }
  return messages;
}

export function validateLogin(values: LoginValues): Record<string, string[]> {
  const byField: Record<string, string[]> = {};

  const email = emailErrors(values.email);
  if (email.length > 0) byField.email = email;

  if (values.password.length === 0) {
    byField.password = ['Le mot de passe est obligatoire.'];
  }

  return byField;
}

export function validateRegister(
  values: RegisterValues,
): Record<string, string[]> {
  const byField: Record<string, string[]> = {};

  const email = emailErrors(values.email);
  if (email.length > 0) byField.email = email;

  const firstName = nameErrors(values.firstName, 'Le prenom');
  if (firstName.length > 0) byField.firstName = firstName;

  const lastName = nameErrors(values.lastName, 'Le nom');
  if (lastName.length > 0) byField.lastName = lastName;

  const password = passwordStrengthErrors(values.password);
  if (password.length > 0) byField.password = password;

  return byField;
}
