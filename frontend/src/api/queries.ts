import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, toError } from './client'

/** Cles de cache TanStack Query, centralisees pour pouvoir les invalider. */
export const queryKeys = {
  workspaces: ['workspaces'] as const,
  projects: (workspaceId: string) => ['workspaces', workspaceId, 'projects'] as const,
  tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
}

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/workspaces')
      if (error) throw toError(error, 'Impossible de charger les workspaces')
      return data
    },
  })
}

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.projects(workspaceId),
    queryFn: async () => {
      const { data, error } = await api.GET('/api/workspaces/{workspaceId}/projects', {
        params: { path: { workspaceId } },
      })
      if (error) throw toError(error, 'Impossible de charger les projets')
      return data
    },
  })
}

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: async () => {
      const { data, error } = await api.GET('/api/projects/{projectId}/tasks', {
        params: { path: { projectId } },
      })
      if (error) throw toError(error, 'Impossible de charger les taches')
      return data
    },
  })
}

/**
 * Creation d'une tache. En cas de succes on invalide la liste : TanStack Query
 * la recharge tout seul, sans qu'on touche a l'etat local du composant.
 */
export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await api.POST('/api/projects/{projectId}/tasks', {
        params: { path: { projectId } },
        body: { title, priority: 'Medium' },
      })
      if (error) throw toError(error, 'Creation de la tache impossible')
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) }),
  })
}
