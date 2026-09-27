import { authClient } from '../api/authClient';
import { clearTokens, getRefreshToken, setTokens } from './tokenStorage';

let inFlight: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return false;
  }

  try {
    const { data, error } = await authClient.POST('/auth/refresh', {
      body: { refreshToken },
    });

    if (error || !data?.accessToken || !data.refreshToken) {
      clearTokens();
      return false;
    }

    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export function refreshSession(): Promise<boolean> {
  inFlight ??= runRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
