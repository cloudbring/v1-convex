import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    name: 'ui',
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.{ts,tsx}',
        'src/globals.css'
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 85,
          functions: 85,
          lines: 85
        }
      }
    },
    include: ['src/**/*.test.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@v1/test-utils': path.resolve(__dirname, '../test-utils/src')
    }
  }
})