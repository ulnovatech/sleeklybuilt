import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function assertProductionEnv(env) {
  const apiUrl = String(env.VITE_API_URL || '').trim()
  const clerkKey = String(env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()

  if (!/^https?:\/\//i.test(apiUrl)) {
    throw new Error(
      '[admin-mobile] Production build requires absolute VITE_API_URL (https://…/api). ' +
        `Got: ${apiUrl || '(empty)'}. Set it in .env.production or .env.production.local.`,
    )
  }
  if (!clerkKey) {
    throw new Error(
      '[admin-mobile] Production build requires VITE_CLERK_PUBLISHABLE_KEY. ' +
        'Set it in .env.production.local (gitignored) or CI secrets.',
    )
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apacheBase = env.VITE_APACHE_BASE || 'http://localhost/sleeklybuilt'

  if (mode === 'production') {
    assertProductionEnv(env)
  }

  return {
    plugins: [react()],
    base: './',
    server: {
      port: Number(env.VITE_PORT) || 5177,
      host: true,
      proxy: {
        '/api': {
          target: apacheBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  }
})
