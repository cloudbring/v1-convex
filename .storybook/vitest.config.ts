import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/test/vitest-plugin'

export default defineConfig({
  plugins: [
    storybookTest({
      // This should match your package.json script to run Storybook
      // If you're not using the default Storybook port, update the port accordingly
      storybookScript: 'storybook',
    }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      name: 'chromium',
    },
    // Make sure to adjust this path to where your built Storybook is served
    include: ['**/*.stories.?(m)[jt]s?(x)'],
    setupFiles: ['./.storybook/vitest-setup.ts'],
  },
})