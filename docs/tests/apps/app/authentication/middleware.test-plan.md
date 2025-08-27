# Middleware Test Plan

**File**: `apps/app/src/middleware.ts`  
**Current Coverage**: 0%  
**Target Coverage**: 95%  
**Priority**: 🔴 Critical

## Execution Context

### Prerequisites
- Ensure common test dependencies are installed (see coverage-strategy.md)
- Working directory: `/Users/e/dev/github.com/cloudbring/v1-convex`

### Test File Creation
```bash
# Create test file
touch apps/app/src/middleware.test.ts
```

### Run This Test Only
```bash
# Run only this test file
bunx vitest run apps/app/src/middleware.test.ts

# Run with coverage for this file
bunx vitest run --coverage apps/app/src/middleware.test.ts

# Watch mode for development
bunx vitest watch apps/app/src/middleware.test.ts
```

### Coverage Measurement
```bash
# Check coverage for middleware specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."apps/app/src/middleware.ts"'
```

### Implementation Commands
```bash
# Install specific dependencies for this test
cd apps/app
bun add -D next-router-mock@^0.9.10

# Create the test file with complete implementation
cat > src/middleware.test.ts << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware } from './middleware'

// Mock Convex auth
const mockIsAuthenticated = vi.fn()
const mockCreateRouteMatcher = vi.fn()
const mockNextjsMiddlewareRedirect = vi.fn()

vi.mock('@convex-dev/auth/nextjs/server', () => ({
  convexAuthNextjsMiddleware: vi.fn(),
  createRouteMatcher: mockCreateRouteMatcher,
  isAuthenticatedNextjs: mockIsAuthenticated,
  nextjsMiddlewareRedirect: mockNextjsMiddlewareRedirect
}))

// Mock i18n middleware
const mockI18nMiddleware = vi.fn()
vi.mock('next-international/middleware', () => ({
  createI18nMiddleware: vi.fn(() => mockI18nMiddleware)
}))

describe('Middleware Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateRouteMatcher.mockReturnValue(() => false) // Default: not sign-in page
  })

  it('should redirect authenticated user from login page', async () => {
    mockIsAuthenticated.mockResolvedValue(true)
    mockCreateRouteMatcher.mockReturnValue(() => true) // Is sign-in page
    
    const request = new NextRequest('http://localhost:3000/login')
    await middleware(request)
    
    expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, '/')
  })

  it('should redirect unauthenticated user to login', async () => {
    mockIsAuthenticated.mockResolvedValue(false)
    
    const request = new NextRequest('http://localhost:3000/dashboard')
    await middleware(request)
    
    expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(request, '/login')
  })

  it('should continue to i18n for authenticated user on protected route', async () => {
    mockIsAuthenticated.mockResolvedValue(true)
    mockI18nMiddleware.mockResolvedValue(new Response())
    
    const request = new NextRequest('http://localhost:3000/dashboard')
    await middleware(request)
    
    expect(mockI18nMiddleware).toHaveBeenCalledWith(request)
    expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled()
  })
})
EOF
```

## File Overview

The middleware file handles authentication routing and internationalization for the Next.js app. It's a critical piece that:
- Redirects authenticated users away from login page
- Redirects unauthenticated users to login page  
- Handles internationalization routing
- Logs routing decisions for debugging

### Dependencies
- `@convex-dev/auth/nextjs/server` - Convex authentication
- `next-international/middleware` - i18n middleware
- Next.js Request/Response objects

### Complexity Analysis
- **High**: Complex authentication logic with multiple conditions
- **Critical**: All routes pass through this middleware
- **Error-prone**: Authentication state management and routing redirects

## Coverage Analysis

### Current State
- **0% coverage** - No tests exist
- **52 lines** of logic code
- **Multiple code paths** for different authentication states

### Critical Paths to Test
1. Authenticated user accessing login page → redirect to dashboard
2. Unauthenticated user accessing protected route → redirect to login  
3. Authenticated user accessing protected route → allow through + i18n
4. Route matching logic for sign-in pages
5. Internationalization middleware integration
6. Logging behavior for debugging

## Testing Approaches

### Approach 1: Integration Testing with Real Next.js Middleware
**Strategy**: Test middleware as integration component using Next.js test utilities

**Pros**:
- Tests real middleware behavior in Next.js context
- Closest to production environment
- Tests actual routing and redirects

**Cons**:
- Complex setup with Next.js test environment
- Slower test execution
- Harder to mock external dependencies (Convex auth)
- Requires full Next.js application context

**Test Structure**:
```typescript
// Requires @jest/test-sequencer and custom Next.js test setup
describe('Middleware Integration', () => {
  it('should redirect authenticated user from login', async () => {
    const request = new NextRequest('/login')
    // Mock Convex auth to return authenticated
    const response = await middleware(request, mockConvexAuth)
    expect(response.status).toBe(307)
    expect(response.headers.get('Location')).toBe('/')
  })
})
```

### Approach 2: Unit Testing with Mocked Dependencies
**Strategy**: Test middleware logic in isolation with comprehensive mocking

**Pros**:
- Fast test execution
- Easy to mock all external dependencies
- Can test edge cases and error scenarios
- Follows established unit testing patterns

**Cons**:
- Heavy mocking may not catch integration issues
- Mock setup complexity for Next.js middleware context
- May not catch actual routing behavior issues

**Test Structure**:
```typescript
// Mock all external dependencies
jest.mock('@convex-dev/auth/nextjs/server')
jest.mock('next-international/middleware')

describe('Middleware Unit Tests', () => {
  it('should redirect when authenticated user visits login', async () => {
    mockIsAuthenticated.mockResolvedValue(true)
    mockCreateRouteMatcher.mockReturnValue(() => true)
    
    const result = await middleware(mockRequest, mockContext)
    expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/')
  })
})
```

### Approach 3: Hybrid Testing (Unit + Component + E2E)
**Strategy**: Multi-layer testing approach combining unit tests, component tests, and E2E verification

**Pros**:
- Comprehensive coverage at multiple levels
- Unit tests for logic, E2E for behavior verification  
- Can catch both logic errors and integration issues
- Balanced between speed and confidence

**Cons**:
- Most complex setup and maintenance
- Higher overhead with multiple test types
- Requires coordination between test types

**Test Structure**:
```typescript
// Unit tests for pure logic
describe('Middleware Logic', () => {
  it('should determine correct redirect path', () => {
    expect(getRedirectPath(true, true)).toBe('/')
    expect(getRedirectPath(false, false)).toBe('/login')
  })
})

// Component tests for middleware behavior
describe('Middleware Behavior', () => {
  it('should handle authentication flow', async () => {
    // Mock middleware context and test behavior
  })
})

// E2E tests verify actual routing
describe('Authentication Routing E2E', () => {
  it('should redirect user correctly in browser', async () => {
    // Playwright test for actual routing behavior
  })
})
```

## Selected Approach: Approach 2 - Unit Testing with Mocked Dependencies

### Justification

**Primary Reasoning**: 
Unit testing with comprehensive mocking is the best approach because:

1. **Speed**: Middleware tests will run frequently in CI/CD - need fast execution
2. **Isolation**: Can test each authentication scenario independently  
3. **Edge Cases**: Easy to simulate error conditions and edge cases
4. **Maintainability**: Simple, focused tests that are easy to understand and maintain
5. **Existing Patterns**: Aligns with current testing patterns in the codebase

**Secondary Benefits**:
- E2E tests already cover authentication flow end-to-end
- Component tests for pages will verify routing behavior
- Unit tests can focus on middleware logic correctness

## Implementation Details

### Test Types
- **Unit Tests**: 100% of coverage through isolated testing
- **Integration Coverage**: Handled by existing E2E authentication tests

### Test Scenarios

#### Authentication State Tests
1. **Authenticated user on login page**
   - Should redirect to dashboard (`/`)
   - Should log redirect decision
   
2. **Unauthenticated user on protected route**  
   - Should redirect to login (`/login`)
   - Should log redirect decision
   
3. **Authenticated user on protected route**
   - Should continue to i18n middleware  
   - Should not redirect
   - Should log no redirect decision

#### Route Matching Tests  
4. **Sign-in route detection**
   - Should correctly identify `/login` as sign-in page
   - Should handle locale prefixes (`/en/login`, `/fr/login`)

#### Internationalization Tests
5. **I18n middleware integration**
   - Should call i18n middleware when no auth redirect needed
   - Should pass request through correctly
   - Should handle i18n middleware errors

#### Error Handling Tests
6. **Authentication service errors**
   - Should handle Convex auth failures gracefully
   - Should default to redirect to login on auth errors
   - Should log errors appropriately

#### Edge Cases
7. **Malformed requests**
   - Should handle missing headers
   - Should handle invalid URLs
   - Should not crash on unexpected input

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "next-router-mock": "^0.9.10",
    "@types/jest": "^29.5.0"
  }
}
```

#### Mock Setup
```typescript
// Mock Convex auth
jest.mock('@convex-dev/auth/nextjs/server', () => ({
  convexAuthNextjsMiddleware: jest.fn(),
  createRouteMatcher: jest.fn(),
  isAuthenticatedNextjs: jest.fn(),
  nextjsMiddlewareRedirect: jest.fn()
}))

// Mock i18n middleware  
jest.mock('next-international/middleware', () => ({
  createI18nMiddleware: jest.fn()
}))
```

#### Test Data & Fixtures
```typescript
// Request fixtures
const mockUnauthenticatedRequest = new Request('http://localhost:3000/')
const mockAuthenticatedLoginRequest = new Request('http://localhost:3000/login')

// Context fixtures
const mockAuthContext = {
  isAuthenticated: jest.fn()
}
```

### Test Structure
```
apps/app/src/middleware.test.ts
├── Authentication Flow Tests
│   ├── Authenticated user redirects
│   ├── Unauthenticated user redirects  
│   └── No redirect scenarios
├── Route Matching Tests
│   ├── Sign-in page detection
│   └── Protected route detection
├── I18n Integration Tests
│   ├── Middleware chaining
│   └── Request passthrough
└── Error Handling Tests
    ├── Auth service errors
    └── Malformed requests
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Mocking patterns can be reused in other authentication tests
- **Setup**: Other tests may need to mock middleware for routing tests
- **Performance**: Fast unit tests won't slow down test suite

### Execution Approach
1. **Phase 1**: Set up comprehensive mocking infrastructure
2. **Phase 2**: Implement core authentication flow tests
3. **Phase 3**: Add edge case and error handling tests  
4. **Phase 4**: Integration verification with existing E2E tests

### Mock Strategies
- **Authentication**: Mock Convex auth service responses
- **Routing**: Mock Next.js redirect functions  
- **I18n**: Mock internationalization middleware
- **Console**: Mock console.log to test logging behavior

### Test Data Approach
- **Request Fixtures**: Pre-built Request objects for different scenarios
- **Auth State Fixtures**: Mocked authentication states
- **Route Fixtures**: Different URL patterns for route matching tests

### Performance Considerations
- **Fast Execution**: Unit tests should run in <100ms total
- **Parallel Safe**: All tests use isolated mocks, safe for parallel execution
- **Memory Efficient**: Minimal fixtures, cleanup mocks between tests

### CI/CD Integration
- **Coverage Enforcement**: Require 95% coverage for middleware.ts
- **Fast Feedback**: Unit tests run on every commit
- **Error Reporting**: Clear error messages for authentication test failures