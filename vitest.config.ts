/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/*.test.{ts,tsx}", "apps/**/*.test.{ts,tsx}", "tests/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.next/**", "**/cypress/**", "**/tests/e2e/**", "**/*.stories.tsx", "**/convex/_generated/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      reportsDirectory: './coverage/vitest',
      exclude: ["node_modules/", ".next/", "*.config.*", "**/*.config.{js,ts,mjs,cjs}", "**/*.setup.{js,ts}", "**/*.stories.tsx", "**/test-utils/**", "**/convex/_generated/**", "**/.turbo/**", "**/dist/**", "**/build/**", "**/storybook-static/**", "**/.storybook/**", "**/email/.react-email/**", "**/email/static/**", "**/tests/**", "**/__tests__/**", "**/*.test.{js,ts,jsx,tsx}", "**/*.spec.{js,ts,jsx,tsx}", "**/fixtures/**", "**/mocks/**", "**/page-objects/**", "**/*.mock.{js,ts}", "**/coverage/**", "**/*.d.ts", "**/playwright.config.ts", "**/tailwind.config.js", "**/postcss.config.js", "**/next.config.js", "**/turbo.json", "**/.env*", "**/public/**", "**/static/**", "**/*.md", "**/.github/**", "**/scripts/**", "**/tools/**"]
    }
  }
});