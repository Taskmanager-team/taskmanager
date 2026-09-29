import createClient from 'openapi-fetch';
import { API_BASE_URL } from './config';
import type { paths } from './schema';

export const authClient = createClient<paths>({ baseUrl: API_BASE_URL });
