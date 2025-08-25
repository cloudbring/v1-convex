import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    target: 'node18'
  },
  test: {
    name: 'backend',
    environment: 'node', // Change to node for convex-test compatibility
    setupFiles: ['../test-utils/src/setup.ts'],
    pool: 'forks', // Ensure better isolation for mocks
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['convex/**/*.ts'],
      exclude: [
        'convex/_generated/**',
        'convex/**/*.test.ts',
        'convex/tsconfig.json'
      ],
      thresholds: {
        global: {
          statements: 95,
          branches: 95,
          functions: 95,
          lines: 95
        }
      }
    },
    include: ['convex/**/*.test.ts'],
    exclude: ['convex/_generated/**']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './convex'),
      '@v1/test-utils': path.resolve(__dirname, '../test-utils/src')
    }
  }
})