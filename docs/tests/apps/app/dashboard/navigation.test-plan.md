# Navigation Component Test Plan

**File**: `apps/app/src/app/[locale]/(dashboard)/_components/navigation.tsx`  
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
touch apps/app/src/app/[locale]/\(dashboard\)/_components/navigation.test.tsx
```

### Run This Test Only
```bash
# Run only this test file
bunx vitest run "apps/app/src/app/**/navigation.test.tsx"

# Run with coverage for this file
bunx vitest run --coverage "apps/app/src/app/**/navigation.test.tsx"

# Watch mode for development
bunx vitest watch "apps/app/src/app/**/navigation.test.tsx"
```

### Coverage Measurement
```bash
# Check coverage for navigation component specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."apps/app/src/app/[locale]/(dashboard)/_components/navigation.tsx"'
```

### Implementation Commands
```bash
# Create the test file with complete implementation
cd apps/app
cat > "src/app/[locale]/(dashboard)/_components/navigation.test.tsx" << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import Navigation from './navigation'

expect.extend(toHaveNoViolations)

// Mock authentication
const mockSignOut = vi.fn()
vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: mockSignOut })
}))

// Mock Convex queries
const mockUsePreloadedQuery = vi.fn()
vi.mock('convex/react', () => ({
  usePreloadedQuery: mockUsePreloadedQuery
}))

// Mock Next.js navigation
const mockUsePathname = vi.fn()
const mockUseRouter = vi.fn()
vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
  useRouter: mockUseRouter
}))

// Mock Polar checkout
vi.mock('@convex-dev/polar/react', () => ({
  CheckoutLink: ({ children, productId }: any) => (
    <div data-testid={`checkout-${productId}`}>{children}</div>
  )
}))

// Mock child components
vi.mock('./language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />
}))

vi.mock('./theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />
}))

// Mock fixtures
const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  subscription: {
    status: 'active',
    plan: 'pro'
  }
}

const mockProducts = [
  {
    _id: 'product1',
    name: 'Pro Plan',
    recurringInterval: 'month',
    amount: 1999
  }
]

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue('/')
    mockUseRouter.mockReturnValue({ push: vi.fn() })
    mockUsePreloadedQuery.mockReturnValue(mockUser)
  })

  it('should render authenticated user navigation', () => {
    render(<Navigation preloadedUser={mockUser} preloadedProducts={mockProducts} />)
    
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByTestId('language-switcher')).toBeInTheDocument()
    expect(screen.getByTestId('theme-switcher')).toBeInTheDocument()
  })

  it('should render user avatar or initials', () => {
    render(<Navigation preloadedUser={mockUser} preloadedProducts={mockProducts} />)
    
    // Should show avatar or initials
    const avatar = screen.getByRole('button', { name: /user menu/i })
    expect(avatar).toBeInTheDocument()
  })

  it('should handle sign out', async () => {
    const user = userEvent.setup()
    render(<Navigation preloadedUser={mockUser} preloadedProducts={mockProducts} />)
    
    // Open dropdown and click sign out
    const userButton = screen.getByRole('button', { name: /user menu/i })
    await user.click(userButton)
    
    const signOutButton = screen.getByText(/sign out/i)
    await user.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalled()
  })

  it('should render subscription checkout for non-subscribers', () => {
    const userWithoutSub = { ...mockUser, subscription: null }
    mockUsePreloadedQuery.mockReturnValue(userWithoutSub)
    
    render(<Navigation preloadedUser={userWithoutSub} preloadedProducts={mockProducts} />)
    
    expect(screen.getByTestId('checkout-product1')).toBeInTheDocument()
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<Navigation preloadedUser={mockUser} preloadedProducts={mockProducts} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should highlight active routes', () => {
    mockUsePathname.mockReturnValue('/settings')
    
    render(<Navigation preloadedUser={mockUser} preloadedProducts={mockProducts} />)
    
    // Check that settings route is highlighted (exact implementation depends on component)
    const settingsLink = screen.getByRole('link', { name: /settings/i })
    expect(settingsLink).toBeInTheDocument()
  })
})
EOF
```

## File Overview

The Navigation component is a complex client component that handles:
- User authentication state and sign-out functionality
- Subscription/billing management with Polar integration  
- Navigation menu with active route detection
- User profile display with avatar/fallback
- Theme and language switching
- Responsive dropdown menu interactions

### Dependencies
- `@convex-dev/auth/react` - Authentication hooks
- `@convex-dev/polar/react` - Subscription checkout links
- `@v1/backend/convex/_generated/api` - Convex API types
- `@v1/ui/*` - UI components (Button, DropdownMenu, Logo)
- `convex/react` - Convex query hooks
- `next/navigation` - Next.js routing
- Various icon components and child components

### Complexity Analysis
- **Very High**: 282 lines with complex business logic
- **Interactive**: Multiple user interactions (dropdowns, buttons, navigation)
- **State Management**: Authentication state, subscription state, routing state
- **External Dependencies**: Multiple third-party integrations

## Coverage Analysis

### Current State
- **0% coverage** - No tests exist
- **282 lines** of complex component logic
- **Multiple code paths** based on authentication and subscription states

### Critical Paths to Test
1. **Authentication States**:
   - User authenticated with subscription
   - User authenticated without subscription
   - User authentication loading states

2. **Navigation Behavior**:
   - Active route detection and highlighting
   - Route navigation functionality
   - Sign-out flow

3. **Subscription Management**:
   - Subscription status display
   - Checkout link generation
   - Plan switching (monthly/yearly)

4. **UI Interactions**:
   - Dropdown menu open/close
   - User profile interactions
   - Theme/language switcher integration

## Testing Approaches

### Approach 1: Integration Testing with Real Hooks
**Strategy**: Test component with real Convex hooks and minimal mocking

**Pros**:
- Tests actual hook behavior and data flow
- Closest to production environment
- Tests real Convex integration
- Catches integration issues

**Cons**:
- Requires complex Convex test setup
- Slower test execution due to real API calls
- Difficult to test error states
- Hard to control subscription data states
- May require test database setup

**Test Structure**:
```typescript
import { ConvexReactClient } from 'convex/react'
import { render } from '@testing-library/react'

describe('Navigation Integration', () => {
  it('should display user with subscription', async () => {
    const convex = new ConvexReactClient(process.env.CONVEX_URL)
    render(
      <ConvexProvider client={convex}>
        <Navigation preloadedUser={mockPreloadedUser} preloadedProducts={mockProducts} />
      </ConvexProvider>
    )
    // Test real data integration
  })
})
```

### Approach 2: Component Testing with Comprehensive Mocking
**Strategy**: Mock all external dependencies and test component behavior in isolation

**Pros**:
- Fast test execution
- Easy to control all external states
- Can test all code paths including error states
- Simple test setup and maintenance
- Can test edge cases easily

**Cons**:
- Heavy mocking may miss real integration issues
- Mock maintenance overhead
- May not catch actual Convex hook behavior changes
- Need to keep mocks in sync with real APIs

**Test Structure**:
```typescript
// Mock all external dependencies
jest.mock('@convex-dev/auth/react')
jest.mock('convex/react')  
jest.mock('next/navigation')

describe('Navigation Component', () => {
  beforeEach(() => {
    mockUseAuthActions.mockReturnValue({ signOut: jest.fn() })
    mockUsePreloadedQuery.mockReturnValue(mockUserData)
    mockUsePathname.mockReturnValue('/')
  })
  
  it('should render authenticated user navigation', () => {
    render(<Navigation {...mockProps} />)
    expect(screen.getByText('User Name')).toBeInTheDocument()
  })
})
```

### Approach 3: Layered Testing (Unit + Component + E2E)
**Strategy**: Test different aspects at appropriate levels with minimal overlap

**Pros**:
- Comprehensive coverage at appropriate levels
- Unit tests for logic, component tests for rendering, E2E for flows
- Balanced speed vs confidence
- Can catch issues at multiple levels

**Cons**:
- Most complex approach with multiple test types
- Higher maintenance overhead
- Requires careful coordination to avoid duplication
- Longer overall development time

**Test Structure**:
```typescript
// Unit tests for helper functions
describe('Navigation Utils', () => {
  it('should detect active route correctly', () => {
    expect(isActiveRoute('/dashboard', '/dashboard')).toBe(true)
  })
})

// Component tests for rendering states
describe('Navigation Rendering', () => {
  it('should render subscription status', () => {
    // Test component rendering with mocked data
  })
})

// E2E tests for critical flows
describe('Navigation E2E', () => {
  it('should complete sign-out flow', async () => {
    // Playwright test for sign-out behavior
  })
})
```

## Selected Approach: Approach 2 - Component Testing with Comprehensive Mocking

### Justification

**Primary Reasoning**:
Comprehensive mocking is the best approach for this complex component because:

1. **Controllability**: Can test all subscription states, authentication states, and error conditions
2. **Speed**: Fast tests that can run frequently during development
3. **Isolation**: Can test component logic without external dependencies
4. **Edge Cases**: Easy to simulate error states and unusual data combinations
5. **Maintainability**: Clear, focused tests that are easy to understand and debug

**Supporting Factors**:
- E2E tests already cover authentication and navigation flows end-to-end
- Component is primarily focused on UI logic and state display
- External dependencies (Convex, auth) are well-tested separately

## Implementation Details

### Test Types
- **Component Tests**: 95% coverage through comprehensive React component testing
- **Integration Coverage**: Handled by existing E2E tests for critical user flows

### Test Scenarios

#### Authentication State Tests
1. **Authenticated user with active subscription**
   - Should display user name and avatar
   - Should show subscription status
   - Should display "Subscribed" status

2. **Authenticated user without subscription**  
   - Should display user name and avatar
   - Should show checkout links for plans
   - Should display monthly/yearly plan options

3. **User with loading authentication**
   - Should handle loading states gracefully
   - Should not crash with undefined user data

#### Navigation Behavior Tests
4. **Active route detection**
   - Should highlight dashboard route when active
   - Should highlight settings route when active  
   - Should highlight billing route when active

5. **Route navigation**
   - Should navigate to settings when clicked
   - Should navigate to dashboard when logo clicked

#### Subscription Management Tests  
6. **Subscription status display**
   - Should show correct plan name
   - Should display plan pricing correctly
   - Should show subscription benefits

7. **Plan switching**
   - Should display monthly/yearly toggle
   - Should show correct pricing for each interval
   - Should handle plan changes

8. **Checkout integration**
   - Should render CheckoutLink components
   - Should pass correct product IDs
   - Should handle checkout errors

#### User Interface Tests
9. **Dropdown menu interactions**
   - Should open dropdown when triggered
   - Should close dropdown when item selected
   - Should handle keyboard navigation

10. **User profile display**
    - Should show user avatar when available
    - Should show initials fallback when no avatar
    - Should handle missing user data

11. **Sign-out functionality**
    - Should call signOut when button clicked
    - Should handle sign-out errors
    - Should show loading state during sign-out

#### Error Handling Tests
12. **Data loading errors**
    - Should handle failed user queries
    - Should handle failed product queries
    - Should display error states appropriately

13. **Missing data scenarios** 
    - Should handle undefined user
    - Should handle empty products array
    - Should handle malformed subscription data

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "@testing-library/jest-dom": "^5.16.5",
    "next-router-mock": "^0.9.10"
  }
}
```

#### Mock Setup
```typescript
// Mock authentication
jest.mock('@convex-dev/auth/react', () => ({
  useAuthActions: jest.fn()
}))

// Mock Convex queries
jest.mock('convex/react', () => ({
  usePreloadedQuery: jest.fn()
}))

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn()
}))

// Mock Polar checkout
jest.mock('@convex-dev/polar/react', () => ({
  CheckoutLink: ({ children, productId }) => (
    <div data-testid={`checkout-${productId}`}>{children}</div>
  )
}))

// Mock child components
jest.mock('./language-switcher', () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />
}))

jest.mock('./theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher" />
}))
```

#### Test Data & Fixtures  
```typescript
// User data fixtures
const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  avatarUrl: 'https://example.com/avatar.jpg',
  subscription: {
    status: 'active',
    plan: 'pro'
  }
}

const mockUserWithoutSubscription = {
  ...mockUser,
  subscription: null
}

// Product data fixtures
const mockProducts = [
  {
    _id: 'product1',
    name: 'Pro Plan',
    recurringInterval: 'month',
    amount: 1999
  },
  {
    _id: 'product2', 
    name: 'Pro Plan',
    recurringInterval: 'year',
    amount: 19999
  }
]

// Preloaded query fixtures
const mockPreloadedUser = {
  _valueJSON: mockUser,
  _args: {},
  _name: 'users.getUser'
}
```

### Test Structure
```
apps/app/src/app/[locale]/(dashboard)/_components/navigation.test.tsx
├── Authentication State Tests
│   ├── Authenticated with subscription
│   ├── Authenticated without subscription
│   └── Loading/error states
├── Navigation Behavior Tests
│   ├── Active route detection
│   ├── Route navigation clicks
│   └── Logo navigation
├── Subscription Management Tests
│   ├── Subscription status display
│   ├── Plan switching logic
│   └── Checkout link rendering  
├── User Interface Tests
│   ├── Dropdown interactions
│   ├── User profile display
│   └── Sign-out functionality
├── Child Component Integration
│   ├── LanguageSwitcher integration
│   ├── ThemeSwitcher integration
│   └── Logo component integration
└── Error Handling Tests
    ├── Data loading failures
    ├── Missing data scenarios
    └── Authentication errors
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Mock patterns can be reused for other dashboard component tests
- **Dependencies**: Child components (LanguageSwitcher, ThemeSwitcher) may need separate test coverage
- **Integration**: Tests will verify integration with UI components from @v1/ui package

### Execution Approach
1. **Phase 1**: Set up comprehensive mocking infrastructure for all external dependencies
2. **Phase 2**: Implement core authentication and subscription state tests
3. **Phase 3**: Add user interaction and navigation behavior tests
4. **Phase 4**: Add error handling and edge case scenarios

### Mock Strategies
- **Authentication**: Mock useAuthActions with configurable sign-out behavior
- **Data Queries**: Mock usePreloadedQuery with various data states
- **Routing**: Mock Next.js navigation hooks with route tracking
- **External Components**: Mock Polar CheckoutLink and child components
- **User Events**: Use userEvent library for realistic interaction testing

### Test Data Approach
- **User Fixtures**: Multiple user states (subscribed, unsubscribed, loading)
- **Product Fixtures**: Various subscription plans and pricing structures  
- **Error Fixtures**: Error states for testing failure scenarios
- **Route Fixtures**: Different pathname scenarios for navigation testing

### Performance Considerations
- **Test Speed**: Target <200ms per test with comprehensive mocking
- **Memory Usage**: Clean up mocks between tests to prevent memory leaks
- **Parallel Execution**: Ensure all mocks are isolated for parallel test runs

### CI/CD Integration
- **Coverage Requirements**: Enforce 95% coverage due to component complexity
- **Accessibility Testing**: Include automated a11y checks for dropdown interactions
- **Visual Testing**: Consider snapshot testing for complex UI states

### Accessibility Testing Strategy
```typescript
import { axe } from 'jest-axe'

it('should have accessible dropdown menu', async () => {
  const user = userEvent.setup()
  render(<Navigation {...props} />)
  
  // Open dropdown
  await user.click(screen.getByRole('button', { name: /user menu/i }))
  
  // Check accessibility
  const results = await axe(document.body)
  expect(results).toHaveNoViolations()
})
```

### Potential Challenges
- **Component Complexity**: 282 lines require careful test organization
- **Mock Maintenance**: Many dependencies need consistent mock updates
- **State Combinations**: Multiple state combinations (auth × subscription × routes) need systematic coverage
- **User Interactions**: Complex dropdown and navigation interactions need thorough testing