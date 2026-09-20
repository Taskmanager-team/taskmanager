/** Bascule mocks MSW / API reelle, pilotee par le fichier .env. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * Base des URLs d'API. Vide par defaut : les requetes partent en relatif
 * (/api/...), ce que MSW intercepte et ce que le proxy Vite sait rediriger.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
