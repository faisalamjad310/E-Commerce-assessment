import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Run all tests in a single fork process (same machine constraint as backend)
    pool: 'forks',
    singleFork: true,
    setupFiles: './src/test/setup.ts',
  },
})
