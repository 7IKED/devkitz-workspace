import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3050', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '') },
      '/ws': { target: 'ws://localhost:3050', ws: true }
    }
  }
})
