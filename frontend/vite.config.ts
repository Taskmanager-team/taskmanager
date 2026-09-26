import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  /*
   * Cible du backend local. `dotnet run` ecoute sur 5152 (profil http de
   * launchSettings.json), l'image Docker sur 8080. Surchargeable par
   * VITE_API_PROXY_TARGET dans .env.
   *
   * On vise volontairement le HTTP et pas le HTTPS : le certificat de dev est
   * auto-signe, et le profil http n'expose aucun port HTTPS, donc
   * UseHttpsRedirection ne redirige pas.
   */
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5152';
  const backend = () => ({
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
  });

  return {
    plugins: [react()],
    server: {
      /*
       * Sans mocks et sans base d'URL, les appels relatifs passent par ce proxy :
       * le navigateur ne voit que du same-origin, ce qui evite d'avoir besoin
       * d'une politique CORS cote backend.
       *
       * `/auth` est liste a part de `/api` parce que les routes d'auth ne
       * portent pas le prefixe /api (cf. la note dans openapi.yaml).
       */
      proxy:
        env.VITE_USE_MOCKS === 'true' || env.VITE_API_BASE_URL
          ? undefined
          : { '/api': backend(), '/auth': backend() },
    },
  };
});
