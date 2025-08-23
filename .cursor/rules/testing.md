# Cursor Rules for get-convex/v1 Testing

## CRITICAL: Test Runner Configuration

NEVER suggest or use `bun test` - this runs Bun's incompatible test runner!

Always use:
- `bun run test` (calls vitest via package.json script)
- `bunx vitest` (direct vitest execution)
- `bun run test:unit` (calls vitest with unit config)

## Testing Framework Stack

You MUST use these specific testing frameworks:
- Unit/Integration Tests: Vitest (NOT Jest, NOT Bun test)
- BDD Tests: @amiceli/vitest-cucumber
- E2E Tests: Playwright (NOT Cypress)
- Component Tests: Storybook with Vitest addon
- Convex Tests: convex-test library

## File Naming Conventions

- Unit tests: `*.test.ts` or `*.test.tsx`
- BDD features: `*.feature` in features/ directory
- E2E tests: `*.spec.ts` in tests/e2e/
- Stories: `*.stories.tsx`
- Test utilities: in packages/test-utils/

## Import Statements

Always use these imports for testing:
```typescript
// ✅ CORRECT
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { convexTest } from 'convex-test'
import { render, screen } from '@testing-library/react'

// ❌ WRONG
import { test } from 'bun:test'  // NEVER use this
```

## Test Structure

Follow this pattern for all tests:
```typescript
import { describe, it, expect } from 'vitest'

describe('ComponentName', () => {
  describe('feature/method', () => {
    it('should do something specific', async () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

## Convex Testing Patterns

When testing Convex functions:
```typescript
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

const t = convexTest(schema)

// Always use withIdentity for auth testing
const authedUser = t.withIdentity({ 
  subject: 'user_123',
  email: 'test@example.com' 
})
```

## Coverage Requirements

Maintain minimum 90% coverage:
- Statements: 90%
- Branches: 90%
- Functions: 90%
- Lines: 90%

## Command Shortcuts

When user asks to:
- "run tests" → suggest `bun run test` NOT `bun test`
- "test with coverage" → suggest `bun run test:coverage`
- "watch tests" → suggest `bunx vitest watch`
- "debug tests" → suggest `bunx vitest --ui`

## Package.json Scripts

Always ensure test scripts use vitest:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Common Mistakes to Avoid

1. Never suggest `bun test` command
2. Don't mix Jest and Vitest syntax
3. Don't use describe.only() or it.only() in committed code
4. Always clean up after tests (close connections, clear mocks)
5. Don't hardcode test data - use factories or fixtures

## Testing Priorities

When writing tests, prioritize:
1. Critical user paths (auth, payments)
2. Convex database operations
3. Complex business logic
4. API integrations
5. Error handling
6. Edge cases

## Mocking Guidelines

Use Vitest's vi.mock():
```typescript
vi.mock('@packages/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}))
```

## Async Testing

Always properly handle async operations:
```typescript
it('should handle async operations', async () => {
  await expect(asyncFunction()).resolves.toBe(value)
  await expect(asyncFunction()).rejects.toThrow(Error)
})
```

Remember: Testing is not optional - every feature needs tests!
