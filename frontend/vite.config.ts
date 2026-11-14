/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { swPrecache } from './vite-plugins/swPrecache'

export default defineConfig({
  plugins: [react(), swPrecache()],
  test: { environment: 'jsdom', globals: true, setupFiles: ['./src/test-setup.ts'] },
})
