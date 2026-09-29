import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { authClient } from '../api/authClient';
import { AuthContext } from './authContext';
import type { AuthUser } from './authContext';
import { AuthError, toFormErrors } from './authErrors';
import { decodeJwt } from './jwt';
import { refreshSession } from './session';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  subscribe,
} from './tokenStorage';
import type { RegisterValues } from './validation';

function currentUser(): AuthUser | null {
  const claims = decodeJwt(getAccessToken());
  if (!claims?.sub) return null;
  return {
    id: claims.domainUserId ?? claims.sub,
    email: claims.email ?? '',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(currentUser);
  const [isRestoring, setIsRestoring] = useState(
    () => !getAccessToken() && Boolean(getRefreshToken()),
  );

  useEffect(
    () =>
      subscribe(() => {
        const next = currentUser();
        setUser(next);
        if (next === null) queryClient.clear();
      }),
    [queryClient],
  );

  useEffect(() => {
    if (getAccessToken() || !getRefreshToken()) return;
    void refreshSession().finally(() => setIsRestoring(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await authClient.POST('/auth/login', {
      body: { email, password },
    });

    if (error || !data?.accessToken || !data.refreshToken) {
      throw new AuthError(toFormErrors(error, 'Connexion impossible.'));
    }

    setTokens({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }, []);

  const register = useCallback(
    async (values: RegisterValues) => {
      const { error } = await authClient.POST('/auth/register', {
        body: values,
      });

      if (error) {
        throw new AuthError(toFormErrors(error, 'Inscription impossible.'));
      }

      await login(values.email, values.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearTokens();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isRestoring,
      login,
      register,
      logout,
    }),
    [user, isRestoring, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
