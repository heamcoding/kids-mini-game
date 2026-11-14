/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { swPrecache } from './vite-plugins/swPrecache'

export default defineConfig({
  plugins: [react(), swPrecache()],
  server: {
    // mirrors the nginx routing so `npm run dev` also calls same-origin /api/*
    proxy: {
      '/api/settings': 'http://localhost:8080',
      '/api/records': { target: 'http://localhost:8000', rewrite: p => p.replace(/^\/api/, '') },
      '/api/stats': { target: 'http://localhost:8000', rewrite: p => p.replace(/^\/api/, '') },
    },
  },
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
})
