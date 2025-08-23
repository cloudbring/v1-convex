import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.next/',
        '*.config.*',
        '**/*.stories.tsx',
        '**/test-utils/**',
        '**/convex/_generated/**',
        '**/.turbo/**',
        '**/dist/**'
      ],
      thresholds: {
        global: {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90
        }
      }
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/cypress/**',
      '**/tests/e2e/**', // Playwright tests
      '**/*.stories.tsx',
      '**/convex/_generated/**'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@packages': path.resolve(__dirname, './packages')
    }
  }
})