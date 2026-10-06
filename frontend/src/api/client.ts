import createClient from 'openapi-fetch';
import { refreshSession } from '../auth/session';
import { getAccessToken } from '../auth/tokenStorage';
import { API_BASE_URL } from './config';
import type { components, paths } from './schema';

export const api = createClient<paths>({ baseUrl: API_BASE_URL });

const retryable = new Map<string, Request>();

api.use({
  onRequest({ request, id }) {
    const token = getAccessToken();
    if (token) request.headers.set('Authorization', `Bearer ${token}`);
    retryable.set(id, request.clone());
    return request;
  },

  async onResponse({ response, id }) {
    const retry = retryable.get(id);
    retryable.delete(id);

    if (response.status !== 401 || !retry) return undefined;

    const refreshed = await refreshSession();
    if (!refreshed) return undefined;

    retry.headers.set('Authorization', `Bearer ${getAccessToken() ?? ''}`);
    return fetch(retry);
  },

  onError({ id }) {
    retryable.delete(id);
  },
});

export type WorkspaceDto = components['schemas']['WorkspaceDto'];
export type WorkspaceMemberDto = components['schemas']['WorkspaceMemberDto'];
export type WorkspaceRole = components['schemas']['WorkspaceRole'];
export type ProjectDto = components['schemas']['ProjectDto'];
export type TaskItemDto = components['schemas']['TaskItemDto'];
export type TaskItemStatus = components['schemas']['TaskItemStatus'];

/** Transforme une erreur ProblemDetails de l'API en Error exploitable. */
export function toError(problem: unknown, fallback: string): Error {
  if (typeof problem === 'object' && problem !== null && 'title' in problem) {
    const { title } = problem as components['schemas']['ProblemDetails'];
    if (title) return new Error(title);
  }
  return new Error(fallback);
}

export function unwrap<T>(
  result: { data?: T; error?: unknown },
  fallback: string,
): T {
  if (result.error) throw toError(result.error, fallback);
  if (result.data === undefined) throw new Error(fallback);
  return result.data;
}
