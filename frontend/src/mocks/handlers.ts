import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../api/config';
import type {
  ProjectDto,
  TaskItemDto,
  WorkspaceDto,
  WorkspaceMemberDto,
  WorkspaceRole,
} from '../api/client';
import { decodeJwt, isExpired } from '../auth/jwt';

/** Les mocks suivent la meme base d'URL que le client, mocks ou API reelle. */
const url = (path: string) => `${API_BASE_URL}${path}`;

/**
 * Les donnees du faux backend survivent au rechargement de page. Sans cela un
 * workspace cree disparaissait au premier F5 : genant en developpement, et
 * surtout en demonstration.
 */
function persisted<T>(key: string, seed: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // Stockage indisponible : on retombe sur les donnees d'origine.
  }
  return seed;
}

function persist(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Stockage indisponible : l'etat reste en memoire pour la session.
  }
}

const WORKSPACES_KEY = 'taskmanager.mockWorkspaces';
const MEMBERS_KEY = 'taskmanager.mockMembers';

const workspaces: WorkspaceDto[] = persisted(WORKSPACES_KEY, [
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
]);

/**
 * Membres par workspace. L'utilisateur demo est Admin de w1 et simple membre
 * de w2 : ce couple permet de verifier de visu que les actions reservees aux
 * Admin disparaissent cote membre.
 */
const members: Record<string, WorkspaceMemberDto[]> = persisted(MEMBERS_KEY, {
  w1: [
    {
      userId: '1',
      email: 'demo@taskflow.pro',
      fullName: 'Utilisateur Demo',
      role: 'Admin',
    },
    {
      userId: '2',
      email: 'sofia@taskflow.pro',
      fullName: 'Sofia Martin',
      role: 'Member',
    },
  ],
  w2: [
    {
      userId: '3',
      email: 'karim@taskflow.pro',
      fullName: 'Karim Benali',
      role: 'Admin',
    },
    {
      userId: '1',
      email: 'demo@taskflow.pro',
      fullName: 'Utilisateur Demo',
      role: 'Member',
    },
  ],
});

/**
 * Faux annuaire. Le contrat impose qu'un invite ait deja un compte : tout
 * email absent d'ici repond 404, comme le fera le backend.
 */
const directory: Record<string, { userId: string; fullName: string }> = {
  'sofia@taskflow.pro': { userId: '2', fullName: 'Sofia Martin' },
  'karim@taskflow.pro': { userId: '3', fullName: 'Karim Benali' },
  'lea@taskflow.pro': { userId: '4', fullName: 'Lea Dubois' },
  'tom@taskflow.pro': { userId: '5', fullName: 'Tom Leroy' },
};

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

/**
 * Etat du faux backend. Il est persiste dans localStorage : sans cela, un
 * simple rechargement de page reinitialiserait le module, le refresh token
 * stocke par l'application ne correspondrait plus a rien, et le developpeur
 * serait deconnecte a chaque F5. C'est aussi ce qui rend la restauration de
 * session testable sans backend.
 */
const MOCK_STATE_KEY = 'taskmanager.mockAuthState';

type MockAuthState = {
  accounts: Record<string, string>;
  validRefreshToken: string | null;
  sessionEmail: string;
};

function loadState(): MockAuthState {
  const empty: MockAuthState = {
    accounts: {},
    validRefreshToken: null,
    sessionEmail: '',
  };

  try {
    const raw = localStorage.getItem(MOCK_STATE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<MockAuthState>;
    return {
      accounts: parsed.accounts ?? {},
      validRefreshToken: parsed.validRefreshToken ?? null,
      sessionEmail: parsed.sessionEmail ?? '',
    };
  } catch {
    return empty;
  }
}

const state = loadState();

function saveState(): void {
  try {
    localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(state));
  } catch {
    // Stockage indisponible : on reste en memoire pour la session en cours.
  }
}

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function issueTokens(email: string) {
  state.sessionEmail = email;
  state.validRefreshToken = `refresh-${crypto.randomUUID()}`;
  saveState();

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
    refreshToken: state.validRefreshToken,
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
    const registered = state.accounts[email];
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

    if (email === 'taken@test.com' || email in state.accounts) {
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

    state.accounts[email] = body.password ?? '';
    saveState();

    return HttpResponse.json({ id: crypto.randomUUID() }, { status: 201 });
  }),

  http.post(url('/auth/refresh'), async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string };

    if (!body.refreshToken || body.refreshToken !== state.validRefreshToken) {
      return HttpResponse.json(
        { message: 'Refresh token invalide' },
        { status: 401 },
      );
    }

    return HttpResponse.json(issueTokens(state.sessionEmail));
  }),

  http.get(
    url('/api/workspaces'),
    ({ request }) => unauthorized(request) ?? HttpResponse.json(workspaces),
  ),

  http.post(url('/api/workspaces'), async ({ request }) => {
    const denied = unauthorized(request);
    if (denied) return denied;

    const body = (await request.json()) as { name?: string };
    const name = (body.name ?? '').trim();

    // Meme forme que ValidationProblemDetails du backend (SCRUM-33).
    if (name.length === 0 || name.length > 150) {
      return HttpResponse.json(
        {
          title: 'Validation failed',
          status: 400,
          errors: {
            name:
              name.length === 0
                ? ['Le nom est obligatoire.']
                : ['Le nom ne doit pas depasser 150 caracteres.'],
          },
        },
        { status: 400 },
      );
    }

    const id = `w${crypto.randomUUID().slice(0, 8)}`;
    const created: WorkspaceDto = {
      id,
      name,
      myRole: 'Admin', // le createur devient Admin (contrat)
      createdAt: new Date().toISOString(),
    };
    workspaces.push(created);
    members[id] = [
      {
        userId: '1',
        email: 'demo@taskflow.pro',
        fullName: 'Utilisateur Demo',
        role: 'Admin',
      },
    ];

    persist(WORKSPACES_KEY, workspaces);
    persist(MEMBERS_KEY, members);

    return HttpResponse.json(created, { status: 201 });
  }),

  http.get(
    url('/api/workspaces/:workspaceId/members'),
    ({ request, params }) => {
      const denied = unauthorized(request);
      if (denied) return denied;

      return HttpResponse.json(members[String(params.workspaceId)] ?? []);
    },
  ),

  http.post(
    url('/api/workspaces/:workspaceId/members'),
    async ({ request, params }) => {
      const denied = unauthorized(request);
      if (denied) return denied;

      const workspaceId = String(params.workspaceId);
      const list = members[workspaceId];
      if (!list) {
        return HttpResponse.json(
          { title: 'Workspace introuvable', status: 404 },
          { status: 404 },
        );
      }

      const body = (await request.json()) as { email?: string };
      const email = (body.email ?? '').trim().toLowerCase();
      const known = directory[email];

      if (!known) {
        return HttpResponse.json(
          { title: 'Aucun utilisateur avec cet email', status: 404 },
          { status: 404 },
        );
      }

      if (list.some((member) => member.userId === known.userId)) {
        return HttpResponse.json(
          { title: 'Deja membre du workspace', status: 409 },
          { status: 409 },
        );
      }

      const invited: WorkspaceMemberDto = {
        userId: known.userId,
        email,
        fullName: known.fullName,
        role: 'Member',
      };
      list.push(invited);
      persist(MEMBERS_KEY, members);

      return HttpResponse.json(invited, { status: 201 });
    },
  ),

  http.patch(
    url('/api/workspaces/:workspaceId/members/:userId/role'),
    async ({ request, params }) => {
      const denied = unauthorized(request);
      if (denied) return denied;

      const list = members[String(params.workspaceId)] ?? [];
      const member = list.find((item) => item.userId === params.userId);
      if (!member) {
        return HttpResponse.json(
          { title: 'Membre introuvable', status: 404 },
          { status: 404 },
        );
      }

      const body = (await request.json()) as { role?: WorkspaceRole };
      const role = body.role ?? 'Member';

      // Le contrat refuse de laisser un workspace sans Admin.
      const admins = list.filter((item) => item.role === 'Admin');
      if (role === 'Member' && admins.length === 1 && member.role === 'Admin') {
        return HttpResponse.json(
          { title: 'Le workspace doit garder au moins un Admin', status: 409 },
          { status: 409 },
        );
      }

      member.role = role;
      persist(MEMBERS_KEY, members);

      return HttpResponse.json(member);
    },
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
