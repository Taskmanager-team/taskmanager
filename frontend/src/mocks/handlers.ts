import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      accessToken: 'fake-token-123',
      refreshToken: 'fake-refresh-456',
      expiresAtUtc: new Date(Date.now() + 3600_000).toISOString(),
      user: { id: '1', email: 'demo@taskflow.pro', fullName: 'Utilisateur Demo' }
    })
  }),

  http.get('/api/projects/:projectId/tasks', () => {
    return HttpResponse.json({
      items: [
        { id: '1', projectId: 'p1', title: 'Configurer le projet', status: 'ToDo', priority: 'High', assignedUserId: null, commentCount: 0, createdAt: new Date().toISOString() },
        { id: '2', projectId: 'p1', title: 'Écrire les tests', status: 'InProgress', priority: 'Medium', assignedUserId: '1', commentCount: 2, createdAt: new Date().toISOString() },
      ],
      page: 1, pageSize: 20, totalCount: 2
    })
  }),
]