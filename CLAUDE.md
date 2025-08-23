# CLAUDE.md - get-convex/v1 Testing Implementation Guide

## ⚠️ CRITICAL WARNING: Test Runner Configuration

**NEVER use `bun test` directly!** Bun has its own built-in test runner that is incompatible with our Vitest-based testing architecture. Using `bun test` will:
- Break our testing setup
- Ignore Vitest configuration
- Fail to run convex-test properly
- Not work with @amiceli/vitest-cucumber
- Produce incompatible coverage reports

### Correct Test Commands

```bash
# ✅ CORRECT - Uses Vitest
bun run test           # Runs vitest
bunx vitest            # Direct vitest execution
bun run test:unit      # Runs vitest with unit config
bun run test:coverage  # Runs vitest with coverage

# ❌ WRONG - Uses Bun's test runner
bun test              # DO NOT USE
bun test:unit         # DO NOT USE
```

## Project Overview

**Repository**: get-convex/v1
**Type**: Turbo Monorepo with Bun package manager
**Testing Stack**: Vitest + Playwright + Storybook + convex-test

## Repository Structure

```
/
├── apps/
│   ├── app/          # Main application
│   └── web/          # Marketing website
├── packages/
│   ├── backend/      # Convex functions
│   ├── ui/          # Shared components
│   ├── analytics/   # Analytics package
│   ├── email/       # Email templates
│   ├── logger/      # Logging utilities
│   └── test-utils/  # Shared test utilities
├── tests/           # E2E tests
├── .github/         # GitHub Actions
└── turbo.json       # Turbo configuration
```

## Testing Architecture

### 1. Unit Testing (Vitest)
- **Framework**: Vitest (NOT Bun test)
- **Coverage Target**: 90%
- **Location**: Alongside source files (`*.test.ts`)

### 2. BDD Testing (@amiceli/vitest-cucumber)
- **Framework**: @amiceli/vitest-cucumber on top of Vitest
- **Location**: `apps/*/features/*.feature`
- **Purpose**: User journey validation

### 3. Integration Testing (convex-test)
- **Framework**: convex-test with Vitest
- **Location**: `packages/backend/convex/*.test.ts`
- **Purpose**: Convex function testing

### 4. E2E Testing (Playwright)
- **Framework**: Playwright
- **Location**: `tests/e2e/**/*.spec.ts`
- **Purpose**: Full application flow testing

### 5. Component Testing (Storybook)
- **Framework**: Storybook with Vitest addon
- **Location**: `packages/ui/src/**/*.stories.tsx`
- **Purpose**: Component isolation and visual testing

## Package.json Scripts Setup

**Root package.json:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run --mode=unit",
    "test:integration": "vitest run --mode=integration",
    "test:bdd": "vitest run --config vitest.bdd.config.ts",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:storybook": "test-storybook",
    "test:all": "turbo run test test:e2e --parallel",
    "test:smoke": "playwright test tests/smoke",
    "test:ci": "turbo run test:coverage test:e2e --parallel"
  }
}
```

**Package-level package.json:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Vitest Configuration

**vitest.config.ts (root):**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        '.next/',
        '*.config.*',
        '**/*.stories.tsx',
        '**/test-utils/**'
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
      '**/*.stories.tsx'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@packages': path.resolve(__dirname, './packages')
    }
  }
})
```

## Turbo Configuration for Testing

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": true,
      "inputs": [
        "src/**/*.ts",
        "src/**/*.tsx", 
        "convex/**/*.ts",
        "**/*.test.ts",
        "**/*.test.tsx",
        "vitest.config.ts"
      ]
    },
    "test:coverage": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "cache": false
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "cache": false,
      "outputs": ["test-results/**", "playwright-report/**"]
    }
  }
}
```

## Test Execution Commands Reference

```bash
# Unit Tests (Vitest)
bunx vitest                          # Run tests in watch mode
bunx vitest run                      # Run tests once
bunx vitest run --coverage           # With coverage
bunx vitest --ui                     # Open UI mode

# BDD Tests (Vitest + Cucumber)
bun run test:bdd                     # Run BDD tests
bunx vitest run --config vitest.bdd.config.ts

# Integration Tests (convex-test)
cd packages/backend && bun run test  # Test Convex functions

# E2E Tests (Playwright)
bunx playwright test                 # Run all E2E tests
bunx playwright test --debug         # Debug mode
bunx playwright test --headed        # With browser UI

# Component Tests (Storybook)
bun run storybook                    # Start Storybook dev server
bun run build:storybook             # Build Storybook for production
bun run test:storybook              # Run Storybook interaction tests

# Monorepo Testing
turbo run test                       # Test all packages
turbo run test --filter=@repo/backend  # Test specific package
turbo run test --parallel           # Parallel execution
```

## Common Testing Patterns

### Testing Convex Functions

```typescript
// ALWAYS use vitest, never bun test
import { describe, it, expect } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

describe('Convex Functions', () => {
  it('should create user', async () => {
    const t = convexTest(schema)
    
    const userId = await t.mutation(api.users.create, {
      name: 'Test User',
      email: 'test@example.com'
    })
    
    expect(userId).toBeDefined()
  })
})
```

### BDD Feature Testing

```typescript
// Uses vitest under the hood via @amiceli/vitest-cucumber
import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'

const feature = await loadFeature('features/auth.feature')

describeFeature(feature, ({ Scenario }) => {
  Scenario('User login', ({ Given, When, Then }) => {
    // Implementation
  })
})
```

## CI/CD Scripts

Ensure all GitHub Actions use the correct commands:

```yaml
- name: Run Tests
  run: |
    # Never use 'bun test'!
    bun run test:coverage  # Calls vitest run --coverage
    
- name: Run E2E Tests  
  run: |
    bunx playwright install --with-deps
    bun run test:e2e  # Calls playwright test
```

## Troubleshooting

### If tests don't run correctly:

1. **Check you're not using `bun test`**
   ```bash
   # Wrong
   bun test
   
   # Right
   bun run test  # Uses script that calls vitest
   bunx vitest
   ```

2. **Verify Vitest is installed**
   ```bash
   bun add -D vitest @vitest/ui @vitest/coverage-v8
   ```

3. **Check package.json scripts**
   - Ensure "test" script calls "vitest" not "bun test"

4. **Clear cache if needed**
   ```bash
   rm -rf node_modules .turbo
   bun install
   ```

## Best Practices

1. **Always use Vitest** for unit/integration tests
2. **Never mix test runners** - Bun test is incompatible
3. **Use turbo for parallel execution** in CI/CD
4. **Maintain 90% coverage** minimum
5. **Write tests alongside code** (colocated)
6. **Use convex-test** for backend testing
7. **Mock external services** appropriately
8. **Test authentication flows** with withIdentity()
9. **Run tests before commits** using husky hooks
10. **Document test patterns** for team consistency

## Dependencies to Install

```bash
# Core testing dependencies
bun add -D vitest @vitest/ui @vitest/coverage-v8

# Testing utilities
bun add -D @testing-library/react @testing-library/user-event
bun add -D @testing-library/jest-dom

# Convex testing
bun add -D convex-test @edge-runtime/vm

# BDD testing
bun add -D @amiceli/vitest-cucumber

# E2E testing
bun add -D @playwright/test

# Storybook with interaction testing
bun add -D @storybook/react-vite @storybook/addon-vitest @storybook/addon-essentials @storybook/addon-interactions @storybook/addon-a11y @storybook/test-runner
```

---

Remember: **NEVER use `bun test`** - Always use Vitest through npm scripts or bunx!
