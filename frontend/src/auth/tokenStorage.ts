const REFRESH_TOKEN_KEY = 'taskmanager.refreshToken';

let accessToken: string | null = null;
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): void {
  accessToken = tokens.accessToken;
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  } catch {
    // Stockage indisponible.
  }
  notify();
}

export function clearTokens(): void {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Stockage indisponible.
  }
  notify();
}
