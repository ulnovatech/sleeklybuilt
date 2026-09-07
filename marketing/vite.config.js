import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // For local dev, the PHP handlers are served by Apache at:
  //   http://localhost/sleeklybuilt/php/...
  // We proxy /php/* from Vite to Apache so fetch('/php/..') works.
  const apacheBase = env.VITE_APACHE_BASE || 'http://localhost/sleeklybuilt'

  return {
    plugins: [react()],
    base: '/',
    resolve: {
      // Linked packages must share marketing's peers (react, router, icons).
      dedupe: ['react', 'react-dom', 'react-router-dom', 'react-icons'],
      alias: {
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': path.resolve(__dirname, 'node_modules/react/jsx-runtime.js'),
        'react/jsx-dev-runtime': path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime.js'),
        'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
        'react-icons': path.resolve(__dirname, 'node_modules/react-icons'),
        '@sleeklybuilt/design-foundation/react': path.resolve(
          __dirname,
          'node_modules/@sleeklybuilt/design-foundation/src/index.js',
        ),
      },
    },
    server: {
      port: Number(env.VITE_PORT) || 5176,
      host: true,
      proxy: {
        '/php': {
          target: apacheBase,
          changeOrigin: true,
          secure: false,
        },
        '/assets': {
          target: apacheBase,
          changeOrigin: true,
          secure: false,
        },
        '/forms': {
          target: apacheBase,
          changeOrigin: true,
          secure: false,
        },
        '/portfolio/api': {
          target: apacheBase,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
