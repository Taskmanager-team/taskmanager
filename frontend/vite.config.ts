import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [react()],
    server: {
      // Sans mocks et sans base d'URL, les appels relatifs /api sont
      // rediriges vers le backend local (evite les soucis de CORS).
      proxy:
        env.VITE_USE_MOCKS === 'true' || env.VITE_API_BASE_URL
          ? undefined
          : {
              '/api': {
                target: 'https://localhost:7001',
                changeOrigin: true,
                secure: false,
              },
            },
    },
  }
})
