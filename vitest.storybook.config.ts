/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    // The plugin will run tests for the stories defined in your Storybook config
    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
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
    hookTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: './coverage/storybook',
      include: [
        "packages/ui/src/components/**/*.tsx"
      ],
      exclude: [
        "**/*.stories.tsx",
        "**/*.story.tsx",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/*.d.ts",
        "**/test-utils/**",
        "**/tests/**",
        "**/__tests__/**",
        "**/__mocks__/**",
        "**/node_modules/**",
        "**/coverage/**",
        "**/.next/**",
        "**/.storybook/**",
        "**/dist/**",
        "**/build/**",
        "**/*.config.{js,ts,mjs,cjs}",
        "**/utils/**",
        "**/lib/**",
        "**/constants/**",
        "**/types/**"
      ]
    }
  }
});