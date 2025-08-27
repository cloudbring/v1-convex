# AGENTS.md - get-convex/v1 Testing Implementation Guide (Canonical)

## ⚠️ Critical Warning: Test Runner

Never use `bun test`. Bun’s built‑in test runner is incompatible with our Vitest-based architecture and will:
- Ignore Vitest configuration and projects
- Break convex-test integration
- Not work with `@amiceli/vitest-cucumber`
- Produce incompatible coverage

Use Vitest via scripts or `bunx vitest` only.

### Correct Commands

```bash
# ✅ Correct (Vitest)
bun run test                 # Vitest (UI or watch depending on script)
bun run test:run             # Vitest run once
bun run test:unit            # Vitest unit project
bun run test:storybook       # Storybook tests via Vitest project
bun run test:coverage        # Vitest with coverage
bun run test:bdd             # BDD (Vitest + @amiceli/vitest-cucumber)
bun run test:e2e             # Playwright smoke / health
bun run test:e2e:full        # All Playwright tests

# ❌ Wrong (Bun test runner – do not use)
bun test
bun test:unit
```

## Project Overview

- Repository: get-convex/v1
- Type: Turbo monorepo (Bun)
- Stack: Vitest + Playwright + Storybook + convex-test + BDD

Repository layout:

```
/
├── apps/
│   ├── app/          # Main application (Next.js)
│   └── web/          # Marketing website (Next.js)
├── packages/
│   ├── backend/      # Convex functions + tests
│   ├── ui/           # Shared UI components + stories + tests
│   ├── analytics/    # Analytics package
│   ├── email/        # Email templates
│   ├── logger/       # Logging utilities
│   └── test-utils/   # Shared test helpers
├── tests/            # E2E tests (Playwright)
├── .github/          # CI
└── turbo.json        # Turbo tasks
```

## Testing Architecture

1) Unit tests (Vitest)
- Location: colocated `*.test.ts(x)` across apps/packages
- Target: 90%+ coverage (backend package enforces 95%)

2) BDD tests (`@amiceli/vitest-cucumber`)
- Location: `apps/*/features/*.feature` with step files

3) Convex integration (`convex-test`)
- Location: `packages/backend/convex/*.test.ts`
- Run in Node environment via the backend package’s Vitest config

4) E2E (Playwright)
- Location: `tests/e2e/**/*.spec.ts` (+ smoke tests in `tests/smoke`)

5) Component tests (Storybook)
- Location: `packages/ui/src/**/*.stories.tsx`
- Executed via Vitest project using `@storybook/addon-vitest`

## Root package.json Scripts (Actual)

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:unit": "vitest run --project unit",
    "test:storybook": "vitest run --project storybook",
    "test:bdd": "vitest run --config vitest.bdd.config.ts",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test tests/smoke/playwright-health.spec.ts",
    "test:e2e:headed": "playwright test --headed tests/smoke/playwright-health.spec.ts",
    "test:e2e:full": "playwright test",
    "test:storybook:legacy": "test-storybook",
    "test:all": "turbo run test:coverage --parallel && bun run test:e2e",
    "test:ci": "turbo run test:coverage --parallel && bun run test:e2e",
    "test:backend": "bun -C packages/backend run test:coverage"
  }
}
```

Package-level package.json scripts remain standard:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Vitest Configuration (Root – Actual shape)

The repo uses Vitest projects for unit and Storybook testing. Mirrors `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  esbuild: { jsxInject: `import React from 'react'` },
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'apps/app/src'),
      '@v1/ui': path.resolve(dirname, 'packages/ui'),
      '@v1/backend': path.resolve(dirname, 'packages/backend'),
      '@v1/logger': path.resolve(dirname, 'packages/logger/src'),
      '@v1/analytics': path.resolve(dirname, 'packages/analytics/src'),
    }
  },
  test: {
    projects: [
      {
        resolve: { alias: { '@': path.resolve(dirname, 'apps/app/src'), '@v1/ui': path.resolve(dirname, 'packages/ui'), '@v1/backend': path.resolve(dirname, 'packages/backend'), '@v1/logger': path.resolve(dirname, 'packages/logger/src'), '@v1/analytics': path.resolve(dirname, 'packages/analytics/src') } },
        test: {
          name: 'unit', globals: true, environment: 'jsdom', setupFiles: ['./vitest.setup.ts'],
          include: ['packages/**/*.test.{ts,tsx}', 'apps/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
          exclude: ['**/node_modules/**','**/dist/**','**/.next/**','**/cypress/**','**/tests/e2e/**','**/*.stories.tsx','**/convex/_generated/**']
        }
      },
      {
        plugins: [storybookTest({ configDir: path.join(dirname, '.storybook') })],
        optimizeDeps: { include: ['react','react-dom','react/jsx-runtime','react/jsx-dev-runtime','@storybook/react','@storybook/addon-vitest','@storybook/test'] },
        test: { name: 'storybook', browser: { enabled: true, headless: true, provider: 'playwright', instances: [{ browser: 'chromium' }], screenshotFailures: false }, setupFiles: ['.storybook/vitest.setup.ts'], testTimeout: 30000, hookTimeout: 10000 }
      }
    ],
    coverage: {
      provider: 'v8', reporter: ['text','json','html','lcov'], reportsDirectory: './coverage/unified',
      include: ['packages/**/*.{ts,tsx}','apps/**/*.{ts,tsx}'],
      exclude: ['node_modules/','.next/','*.config.*','**/*.config.{js,ts,mjs,cjs}','**/*.setup.{js,ts}','**/*.stories.tsx','**/*.story.tsx','**/test-utils/**','**/convex/_generated/**','**/.turbo/**','**/dist/**','**/build/**','**/storybook-static/**','**/.storybook/**','**/email/.react-email/**','**/email/static/**','**/tests/**','**/__tests__/**','**/*.test.{js,ts,jsx,tsx}','**/*.spec.{js,ts,jsx,tsx}','**/fixtures/**','**/mocks/**','**/page-objects/**','**/*.mock.{js,ts}','**/coverage/**','**/*.d.ts','**/playwright.config.ts','**/tailwind.config.js','**/postcss.config.js','**/next.config.js','**/turbo.json','**/.env*','**/public/**','**/static/**','**/*.md','**/.github/**','**/scripts/**','**/tools/**']
    }
  }
})
```

Backend package (`packages/backend/vitest.config.ts`) runs Convex tests in Node with stricter thresholds (95%) and `pool: 'forks'` for isolation.

## Turbo Tasks for Testing (Actual)

Your repo uses Turbo v2 tasks (not legacy pipeline). Relevant parts of `turbo.json`:

```json
{
  "tasks": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "inputs": [
        "src/**/*.{ts,tsx}",
        "convex/**/*.ts",
        "**/*.{test,spec}.{ts,tsx}",
        "**/*.feature",
        "**/*.steps.ts",
        "**/*.step.ts",
        "**/vitest*.config.{ts,js}",
        "**/.storybook/**"
      ]
    },
    "test:coverage": { "dependsOn": ["^build"], "outputs": ["coverage/**"], "cache": false },
    "test:e2e": { "dependsOn": ["build"], "cache": false, "outputs": ["test-results/**","playwright-report/**"] },
    "test:storybook": { "dependsOn": ["build:storybook"], "cache": false }
  }
}
```

## Execution Reference

```bash
# Unit tests
bun run test                  # watch/UI
bun run test:run              # run once
bun run test:coverage         # coverage (unified)

# BDD
bun run test:bdd              # uses vitest-cucumber config

# Convex backend tests (Node env)
cd packages/backend && bun run test
# or from root
bun run test:backend

# E2E (Playwright)
bun run test:e2e              # smoke-only default
bun run test:e2e:full         # full suite

# Storybook tests via Vitest
bun run test:storybook
# Legacy (Jest-based) runner if needed
bun run test:storybook:legacy
```

## Common Patterns

Convex test (Node env, with convex-test):

```ts
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

describe('Convex Functions', () => {
  it('creates user', async () => {
    const t = convexTest(schema)
    const userId = await t.mutation(api.users.create, { name: 'Test', email: 't@example.com' })
    expect(userId).toBeDefined()
  })
})
```

BDD feature (Vitest + `@amiceli/vitest-cucumber`):

```ts
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
const feature = await loadFeature('features/auth.feature')
describeFeature(feature, ({ Scenario }) => {
  Scenario('User login', ({ Given, When, Then }) => {
    // steps
  })
})
```

## CI Guidance

Run Vitest coverage in CI; keep E2E in dedicated jobs or preview flow.

```yaml
- name: Run unit tests with coverage
  run: bun run test:coverage
```

Preview testing already runs smoke and critical E2E against a Vercel URL.

## Troubleshooting

1) Ensure you’re not using Bun’s runner

```bash
bun test       # ❌ wrong
bun run test   # ✅ right
bunx vitest    # ✅ right
```

2) Install Vitest and coverage UI

```bash
bun add -D vitest @vitest/ui @vitest/coverage-v8
```

3) Convex tests must run in Node
- Use `packages/backend/vitest.config.ts`
- Avoid jsdom env for Convex integration

4) Clear caches if needed

```bash
rm -rf node_modules .turbo
bun install
```

## Best Practices

- Always run Vitest; never `bun test`
- Use Turbo for parallel runs in CI
- Keep 90%+ coverage (backend enforces 95%)
- Co-locate tests with code
- Use convex-test for backend; prefer `withIdentity()` for auth flows
- Mock external services at boundaries
- Document test patterns for consistency

## Suggested Dev Dependencies

```bash
# Core
bun add -D vitest @vitest/ui @vitest/coverage-v8

# React testing
bun add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Convex
bun add -D convex-test

# BDD
bun add -D @amiceli/vitest-cucumber

# E2E
bun add -D @playwright/test

# Storybook testing
bun add -D @storybook/react-vite @storybook/addon-vitest @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-a11y
```

---

Remember: Never use `bun test` — use Vitest via scripts or `bunx vitest`.

