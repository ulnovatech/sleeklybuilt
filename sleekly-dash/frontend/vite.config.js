import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/dash/' : '/sleekly-dash/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/sleeklybuilt',
        changeOrigin: true,
        secure: false,
      },
    },
  },
}))
