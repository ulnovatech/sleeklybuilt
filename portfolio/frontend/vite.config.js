import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    base: env.VITE_BASE || '/portfolio-app/',
    resolve: {
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
      port: Number(env.VITE_PORT) || 5175,
      host: true,
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
        },
        '/php': {
          target: env.VITE_APACHE_BASE || 'http://localhost/sleeklybuilt',
          changeOrigin: true,
          secure: false,
        },
        '/portfolio/api': {
          target: env.VITE_APACHE_BASE || 'http://localhost/sleeklybuilt',
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
