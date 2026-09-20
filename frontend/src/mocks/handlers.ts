import { http, HttpResponse } from 'msw'
import { API_BASE_URL } from '../api/config'
import type { ProjectDto, TaskItemDto, WorkspaceDto } from '../api/client'

/** Les mocks suivent la meme base d'URL que le client, mocks ou API reelle. */
const url = (path: string) => `${API_BASE_URL}${path}`

const workspaces: WorkspaceDto[] = [
  { id: 'w1', name: 'Equipe produit', myRole: 'Admin', createdAt: new Date().toISOString() },
  { id: 'w2', name: 'Equipe support', myRole: 'Member', createdAt: new Date().toISOString() },
]

const projects: ProjectDto[] = [
  { id: 'p1', workspaceId: 'w1', name: 'TaskManager v1', status: 'Active', taskCount: 2 },
  { id: 'p2', workspaceId: 'w1', name: 'Site vitrine', status: 'Active', taskCount: 0 },
  { id: 'p3', workspaceId: 'w2', name: 'Base de connaissances', status: 'Active', taskCount: 0 },
]

/** Etat en memoire : une tache creee reapparait dans la liste rechargee. */
const tasks: TaskItemDto[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Configurer le projet',
    status: 'ToDo',
    priority: 'High',
    assignedUserId: null,
    commentCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Ecrire les tests',
    status: 'InProgress',
    priority: 'Medium',
    assignedUserId: '1',
    commentCount: 2,
    createdAt: new Date().toISOString(),
  },
]

export const handlers = [
  http.post(url('/api/auth/login'), () =>
    HttpResponse.json({
      accessToken: 'fake-token-123',
      refreshToken: 'fake-refresh-456',
      expiresAtUtc: new Date(Date.now() + 3_600_000).toISOString(),
      user: { id: '1', email: 'demo@taskflow.pro', fullName: 'Utilisateur Demo' },
    }),
  ),

  http.get(url('/api/workspaces'), () => HttpResponse.json(workspaces)),

  http.get(url('/api/workspaces/:workspaceId/projects'), ({ params }) =>
    HttpResponse.json(projects.filter((project) => project.workspaceId === params.workspaceId)),
  ),

  http.get(url('/api/projects/:projectId/tasks'), ({ params }) => {
    const items = tasks.filter((task) => task.projectId === params.projectId)
    return HttpResponse.json({ items, page: 1, pageSize: 20, totalCount: items.length })
  }),

  http.post(url('/api/projects/:projectId/tasks'), async ({ params, request }) => {
    const body = (await request.json()) as { title: string; priority: TaskItemDto['priority'] }
    const created: TaskItemDto = {
      id: crypto.randomUUID(),
      projectId: String(params.projectId),
      title: body.title,
      status: 'ToDo',
      priority: body.priority ?? 'Medium',
      assignedUserId: null,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    }
    tasks.push(created)
    return HttpResponse.json(created, { status: 201 })
  }),
]
