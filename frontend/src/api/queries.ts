import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from './client';
import type { WorkspaceRole } from './client';

/** Cles de cache TanStack Query, centralisees pour pouvoir les invalider. */
export const queryKeys = {
  workspaces: ['workspaces'] as const,
  members: (workspaceId: string) =>
    ['workspaces', workspaceId, 'members'] as const,
  projects: (workspaceId: string) =>
    ['workspaces', workspaceId, 'projects'] as const,
  tasks: (projectId: string) => ['projects', projectId, 'tasks'] as const,
};

export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces,
    queryFn: async () =>
      unwrap(
        await api.GET('/api/workspaces'),
        'Impossible de charger les workspaces',
      ),
  });
}

/**
 * Creation d'un workspace. La liste est invalidee au succes : TanStack Query
 * la recharge, le nouveau workspace apparait sans rechargement de page.
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) =>
      unwrap(
        await api.POST('/api/workspaces', { body: { name } }),
        'Creation du workspace impossible',
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces }),
  });
}

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.members(workspaceId),
    queryFn: async () =>
      unwrap(
        await api.GET('/api/workspaces/{workspaceId}/members', {
          params: { path: { workspaceId } },
        }),
        'Impossible de charger les membres',
      ),
  });
}

/** Invitation par email. L'utilisateur doit deja avoir un compte (contrat). */
export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) =>
      unwrap(
        await api.POST('/api/workspaces/{workspaceId}/members', {
          params: { path: { workspaceId } },
          body: { email },
        }),
        'Invitation impossible',
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.members(workspaceId),
      }),
  });
}

export function useChangeMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { userId: string; role: WorkspaceRole }) =>
      unwrap(
        await api.PATCH('/api/workspaces/{workspaceId}/members/{userId}/role', {
          params: { path: { workspaceId, userId: input.userId } },
          body: { role: input.role },
        }),
        'Changement de role impossible',
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.members(workspaceId),
      }),
  });
}

export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.projects(workspaceId),
    queryFn: async () =>
      unwrap(
        await api.GET('/api/workspaces/{workspaceId}/projects', {
          params: { path: { workspaceId } },
        }),
        'Impossible de charger les projets',
      ),
  });
}

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: queryKeys.tasks(projectId),
    queryFn: async () =>
      unwrap(
        await api.GET('/api/projects/{projectId}/tasks', {
          params: { path: { projectId } },
        }),
        'Impossible de charger les taches',
      ),
  });
}

/**
 * Creation d'une tache. En cas de succes on invalide la liste : TanStack Query
 * la recharge tout seul, sans qu'on touche a l'etat local du composant.
 */
export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) =>
      unwrap(
        await api.POST('/api/projects/{projectId}/tasks', {
          params: { path: { projectId } },
          body: { title, priority: 'Medium' },
        }),
        'Creation de la tache impossible',
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks(projectId) }),
  });
}
