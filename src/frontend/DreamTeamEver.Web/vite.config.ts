import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const port = Number.parseInt(process.env.PORT ?? '', 10)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    ...(Number.isFinite(port) && port > 0
      ? { port, strictPort: true }
      : {}),
    proxy: {
      '/api': {
        target: 'http://localhost:5262',
        changeOrigin: true,
      },
    },
  },
})
