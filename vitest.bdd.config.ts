import { defineConfig } from 'vitest/config'
import { mergeConfig } from 'vite'
import baseConfig from './vitest.config'

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ['**/features/**/*.test.ts', '**/features/**/*.steps.ts'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**'
      ]
    }
  })
)