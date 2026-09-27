import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../api/config';
import type { ProjectDto, TaskItemDto, WorkspaceDto } from '../api/client';
import { decodeJwt, isExpired } from '../auth/jwt';

/** Les mocks suivent la meme base d'URL que le client, mocks ou API reelle. */
const url = (path: string) => `${API_BASE_URL}${path}`;

const workspaces: WorkspaceDto[] = [
  {
    id: 'w1',
    name: 'Equipe produit',
    myRole: 'Admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w2',
    name: 'Equipe support',
    myRole: 'Member',
    createdAt: new Date().toISOString(),
  },
];

const projects: ProjectDto[] = [
  {
    id: 'p1',
    workspaceId: 'w1',
    name: 'TaskManager v1',
    status: 'Active',
    taskCount: 2,
  },
  {
    id: 'p2',
    workspaceId: 'w1',
    name: 'Site vitrine',
    status: 'Active',
    taskCount: 0,
  },
  {
    id: 'p3',
    workspaceId: 'w2',
    name: 'Base de connaissances',
    status: 'Active',
    taskCount: 0,
  },
];

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
];

/** Baisse cette valeur a 5 pour voir le cycle 401 -> refresh -> retry aussitot. */
const ACCESS_TOKEN_TTL_SECONDS = 60;
const DEMO_PASSWORD = 'Demo1234!';
const DEMO_IDENTITY_ID = '11111111-1111-1111-1111-111111111111';
const DEMO_USER_ID = '1';

const accounts = new Map<string, string>();

let validRefreshToken: string | null = null;
let sessionEmail = '';

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function issueTokens(email: string) {
  sessionEmail = email;
  validRefreshToken = `refresh-${crypto.randomUUID()}`;

  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64Url(
    JSON.stringify({
      sub: DEMO_IDENTITY_ID,
      email,
      domainUserId: DEMO_USER_ID,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_TTL_SECONDS,
    }),
  );

  return {
    accessToken: `${header}.${payload}.signature-de-test`,
    refreshToken: validRefreshToken,
  };
}

function identityPasswordErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) {
    errors.push('Passwords must be at least 8 characters.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Passwords must have at least one digit ('0'-'9').");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Passwords must have at least one uppercase ('A'-'Z').");
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Passwords must have at least one non alphanumeric character.');
  }
  return errors;
}

function unauthorized(request: Request) {
  const header = request.headers.get('Authorization') ?? '';
  const claims = header.startsWith('Bearer ')
    ? decodeJwt(header.slice(7))
    : null;

  if (!claims || isExpired(claims, 0)) {
    return HttpResponse.json(
      { message: 'Token absent ou expire' },
      { status: 401 },
    );
  }
  return null;
}

export const handlers = [
  http.post(url('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = (body.email ?? '').trim().toLowerCase();
    const registered = accounts.get(email);
    const valid =
      body.password === DEMO_PASSWORD ||
      (registered !== undefined && registered === body.password);

    if (!valid) {
      return HttpResponse.json(
        { message: 'Email ou mot de passe incorrect' },
        { status: 401 },
      );
    }

    return HttpResponse.json(issueTokens(body.email ?? ''));
  }),

  http.post(url('/auth/register'), async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    const email = (body.email ?? '').trim().toLowerCase();

    if (email === 'taken@test.com' || accounts.has(email)) {
      return HttpResponse.json(
        { message: 'Cet email est deja utilise' },
        { status: 409 },
      );
    }

    const errors = identityPasswordErrors(body.password ?? '');
    if (errors.length > 0) {
      return HttpResponse.json(
        { message: 'Erreur lors de la creation de l utilisateur', errors },
        { status: 400 },
      );
    }

    accounts.set(email, body.password ?? '');

    return HttpResponse.json({ id: crypto.randomUUID() }, { status: 201 });
  }),

  http.post(url('/auth/refresh'), async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };

    if (!body.refreshToken || body.refreshToken !== validRefreshToken) {
      return HttpResponse.json(
        { message: 'Refresh token invalide' },
        { status: 401 },
      );
    }

    return HttpResponse.json(issueTokens(sessionEmail));
  }),

  http.get(
    url('/api/workspaces'),
    ({ request }) => unauthorized(request) ?? HttpResponse.json(workspaces),
  ),

  http.get(
    url('/api/workspaces/:workspaceId/projects'),
    ({ request, params }) =>
      unauthorized(request) ??
      HttpResponse.json(
        projects.filter(
          (project) => project.workspaceId === params.workspaceId,
        ),
      ),
  ),

  http.get(url('/api/projects/:projectId/tasks'), ({ request, params }) => {
    const denied = unauthorized(request);
    if (denied) return denied;

    const items = tasks.filter((task) => task.projectId === params.projectId);
    return HttpResponse.json({
      items,
      page: 1,
      pageSize: 20,
      totalCount: items.length,
    });
  }),

  http.post(
    url('/api/projects/:projectId/tasks'),
    async ({ params, request }) => {
      const denied = unauthorized(request);
      if (denied) return denied;

      const body = (await request.json()) as {
        title: string;
        priority: TaskItemDto['priority'];
      };
      const created: TaskItemDto = {
        id: crypto.randomUUID(),
        projectId: String(params.projectId),
        title: body.title,
        status: 'ToDo',
        priority: body.priority ?? 'Medium',
        assignedUserId: null,
        commentCount: 0,
        createdAt: new Date().toISOString(),
      };
      tasks.push(created);
      return HttpResponse.json(created, { status: 201 });
    },
  ),
];
