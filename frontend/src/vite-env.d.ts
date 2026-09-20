/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 'true' pour intercepter l'API avec MSW, 'false' pour taper le vrai backend. */
  readonly VITE_USE_MOCKS: string
  /** Base de l'API reelle. Vide en mode mocks : les appels restent relatifs. */
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
