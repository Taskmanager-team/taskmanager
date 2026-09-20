import createClient from 'openapi-fetch'
import { API_BASE_URL } from './config'
import type { components, paths } from './schema'

/**
 * Client HTTP type par le contrat OpenAPI.
 * Les chemins et les reponses viennent de schema.d.ts, genere par
 * `npm run generate:api` : rien n'est ecrit a la main ici.
 */
export const api = createClient<paths>({ baseUrl: API_BASE_URL })

export type WorkspaceDto = components['schemas']['WorkspaceDto']
export type ProjectDto = components['schemas']['ProjectDto']
export type TaskItemDto = components['schemas']['TaskItemDto']
export type TaskItemStatus = components['schemas']['TaskItemStatus']

/** Transforme une erreur ProblemDetails de l'API en Error exploitable. */
export function toError(problem: unknown, fallback: string): Error {
  if (typeof problem === 'object' && problem !== null && 'title' in problem) {
    const { title } = problem as components['schemas']['ProblemDetails']
    if (title) return new Error(title)
  }
  return new Error(fallback)
}
