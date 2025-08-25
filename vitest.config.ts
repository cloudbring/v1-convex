/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    // Modern projects configuration instead of deprecated workspace
    projects: [
      // Unit tests project
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'packages/**/*.test.{ts,tsx}',
            'apps/**/*.test.{ts,tsx}',
            'tests/**/*.test.{ts,tsx}'
          ],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/cypress/**',
            '**/tests/e2e/**',
            '**/*.stories.tsx',
            '**/convex/_generated/**'
          ]
        }
      },
      // Storybook tests project  
      {
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook')
          })
        ],
        optimizeDeps: {
          include: [
            'react',
            'react-dom',
            'react/jsx-runtime',
            'react/jsx-dev-runtime',
            '@storybook/react',
            '@storybook/addon-vitest',
            '@storybook/test'
          ]
        },
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{
              browser: 'chromium'
            }],
            screenshotFailures: false,
            slowHijackESM: false
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          testTimeout: 30000,
          hookTimeout: 10000
        }
      },
      // Integration tests project (currently using same files as unit but can be filtered by mode)
      {
        test: {
          name: 'integration',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          include: [
            'packages/**/*.integration.{ts,tsx}',
            'apps/**/*.integration.{ts,tsx}',
            // Also include regular test files that can be run in integration mode
            'packages/**/*.test.{ts,tsx}',
            'apps/**/*.test.{ts,tsx}'
          ],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/cypress/**',
            '**/tests/e2e/**',
            '**/*.stories.tsx',
            '**/convex/_generated/**'
          ],
          // Use integration mode to differentiate from unit tests
          mode: 'integration'
        }
      }
    ],
    // Unified coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: './coverage/unified',
      // Include both unit test files and React components
      include: [
        'packages/**/*.{ts,tsx}',
        'apps/**/*.{ts,tsx}'
      ],
      exclude: [
        'node_modules/',
        '.next/',
        '*.config.*',
        '**/*.config.{js,ts,mjs,cjs}',
        '**/*.setup.{js,ts}',
        '**/*.stories.tsx',
        '**/*.story.tsx',
        '**/test-utils/**',
        '**/convex/_generated/**',
        '**/.turbo/**',
        '**/dist/**',
        '**/build/**',
        '**/storybook-static/**',
        '**/.storybook/**',
        '**/email/.react-email/**',
        '**/email/static/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        '**/fixtures/**',
        '**/mocks/**',
        '**/page-objects/**',
        '**/*.mock.{js,ts}',
        '**/coverage/**',
        '**/*.d.ts',
        '**/playwright.config.ts',
        '**/tailwind.config.js',
        '**/postcss.config.js',
        '**/next.config.js',
        '**/turbo.json',
        '**/.env*',
        '**/public/**',
        '**/static/**',
        '**/*.md',
        '**/.github/**',
        '**/scripts/**',
        '**/tools/**'
      ]
    }
  }
});