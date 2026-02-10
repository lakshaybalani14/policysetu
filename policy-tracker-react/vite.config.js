import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/backboard': {
        target: 'https://api.backboard.io/v1', // Reverting to .io as confirmed by user
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/backboard/, ''),
      },
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
