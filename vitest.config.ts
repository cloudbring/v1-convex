import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "*.config.*",
        "**/*.stories.tsx",
        "**/test-utils/**",
        "**/convex/_generated/**",
        "**/.turbo/**",
        "**/dist/**",
      ],
    },
    include: [
      "packages/**/*.test.{ts,tsx}",
      "apps/**/*.test.{ts,tsx}",
      "tests/**/*.test.{ts,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/cypress/**",
      "**/tests/e2e/**",
      "**/*.stories.tsx",
      "**/convex/_generated/**",
    ],
  },
});