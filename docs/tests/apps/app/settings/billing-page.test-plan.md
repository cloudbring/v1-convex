# Billing Page Test Plan

**File**: `apps/app/src/app/[locale]/(dashboard)/settings/billing/page.tsx`  
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
touch apps/app/src/app/[locale]/\(dashboard\)/settings/billing/page.test.tsx
```

### Run This Test Only
```bash
# Run only this test file
bunx vitest run "apps/app/src/app/**/billing/page.test.tsx"

# Run with coverage for this file
bunx vitest run --coverage "apps/app/src/app/**/billing/page.test.tsx"

# Watch mode for development
bunx vitest watch "apps/app/src/app/**/billing/page.test.tsx"
```

### Coverage Measurement
```bash
# Check coverage for billing page specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."apps/app/src/app/[locale]/(dashboard)/settings/billing/page.tsx"'
```

### Implementation Commands
```bash
# Create the test file with complete implementation
cd apps/app
cat > "src/app/[locale]/(dashboard)/settings/billing/page.test.tsx" << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Page from './page'

// Mock Polar integration
vi.mock('@convex-dev/polar/react', () => ({
  CheckoutLink: ({ children, productId, ...props }: any) => (
    <button data-testid={`checkout-${productId}`} {...props}>
      {typeof children === 'function' ? children({ loading: false }) : children}
    </button>
  ),
  CustomerPortalLink: ({ children }: any) => (
    <button data-testid="customer-portal">
      {children}
    </button>
  )
}))

// Mock Convex queries
const mockUseQuery = vi.fn()
vi.mock('convex/react', () => ({
  useQuery: mockUseQuery
}))

// Mock UI components
vi.mock('@v1/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}))

vi.mock('@v1/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}))

const mockFreeUser = {
  subscription: null,
  plan: null
}

const mockProMonthlyUser = {
  subscription: {
    status: 'active',
    planId: 'pro-monthly',
    plan: {
      name: 'Pro Plan',
      amount: 1999,
      recurringInterval: 'month'
    }
  }
}

const mockProducts = [
  {
    _id: 'pro-monthly',
    name: 'Pro Plan',
    amount: 1999,
    recurringInterval: 'month',
    description: 'Monthly Pro subscription'
  },
  {
    _id: 'pro-yearly',
    name: 'Pro Plan', 
    amount: 19999,
    recurringInterval: 'year',
    description: 'Yearly Pro subscription'
  }
]

describe('Billing Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseQuery.mockReturnValue(mockFreeUser)
  })

  it('should render billing page for free user', () => {
    render(<Page />)
    
    expect(screen.getByText(/Pro Plan/i)).toBeInTheDocument()
    expect(screen.getByText(/Free/i)).toBeInTheDocument()
  })

  it('should render checkout links for free user', () => {
    render(<Page />)
    
    // Should have checkout buttons for pro plans
    expect(screen.getByTestId('checkout-pro-monthly')).toBeInTheDocument()
    expect(screen.getByTestId('checkout-pro-yearly')).toBeInTheDocument()
  })

  it('should show current plan for subscribed user', () => {
    mockUseQuery.mockReturnValue(mockProMonthlyUser)
    
    render(<Page />)
    
    expect(screen.getByText(/Current/i)).toBeInTheDocument()
    expect(screen.getByTestId('customer-portal')).toBeInTheDocument()
  })

  it('should toggle billing interval', async () => {
    const user = userEvent.setup()
    render(<Page />)
    
    const billingToggle = screen.getByRole('checkbox')
    await user.click(billingToggle)
    
    // Should update pricing display
    expect(billingToggle).toBeChecked()
  })

  it('should display pricing correctly', () => {
    render(<Page />)
    
    // Should show monthly pricing by default
    expect(screen.getByText(/\$19\.99/)).toBeInTheDocument()
  })

  it('should calculate yearly savings', () => {
    render(<Page />)
    
    // Should show savings for yearly plan
    const yearlyPricing = screen.getByText(/\$199\.99/)
    expect(yearlyPricing).toBeInTheDocument()
    
    // Should show savings amount
    expect(screen.getByText(/Save/)).toBeInTheDocument()
  })
})
EOF
```

## File Overview

The billing page is a complex client component managing subscription and payment functionality:
- Displays available subscription plans (Free, Pro monthly, Pro yearly)
- Handles plan switching and billing interval toggles
- Integrates with Polar for checkout and customer portal
- Manages subscription state and user billing information
- Provides plan upgrade/downgrade functionality

### Dependencies
- `@convex-dev/polar/react` - Checkout and customer portal links
- `@v1/backend/convex/_generated/api` - Convex API for subscriptions
- `@v1/ui/button` and `@v1/ui/switch` - UI components
- `convex/react` - Convex query hooks
- `useState` - React state management

### Complexity Analysis
- **Very High**: 242 lines with complex billing logic
- **Business Critical**: Handles payments and subscriptions
- **State Management**: Complex state for plan selection and billing intervals
- **External Integration**: Polar payment processor integration

## Coverage Analysis

### Current State
- **0% coverage** - No tests exist
- **242 lines** of complex component logic
- **Payment-critical functionality** requiring thorough testing

### Critical Paths to Test
1. **Plan Display Logic**:
   - Free plan display and selection
   - Pro plan (monthly/yearly) display
   - Current plan highlighting
   - Plan comparison and pricing

2. **Billing Interval Management**:
   - Monthly/yearly toggle functionality
   - Price calculations and display
   - Interval switching effects

3. **Payment Integration**:
   - Checkout link generation
   - Customer portal access
   - Payment flow initiation

4. **Subscription State Management**:
   - Current subscription detection
   - Plan upgrade/downgrade logic
   - Subscription status handling

## Testing Approaches

### Approach 1: Integration Testing with Real Convex and Polar
**Strategy**: Test with real backend integration and payment provider

**Pros**:
- Tests actual payment flow integration
- Catches real API integration issues
- Most accurate representation of production behavior
- Tests actual subscription data flow

**Cons**:
- Requires real payment provider setup (expensive/complex)
- Slow test execution due to API calls
- Difficult to control subscription states for testing
- May incur actual payment charges during testing
- Hard to test error scenarios consistently

**Test Structure**:
```typescript
describe('Billing Integration Tests', () => {
  it('should handle real checkout flow', async () => {
    // Requires actual Polar/Convex setup
    render(<BillingPage />)
    const checkoutButton = screen.getByText('Subscribe')
    fireEvent.click(checkoutButton)
    // Test real payment flow - complex setup required
  })
})
```

### Approach 2: Component Testing with Comprehensive Mocking
**Strategy**: Mock all external dependencies and test component behavior

**Pros**:
- Fast test execution
- Complete control over subscription states
- Can test all error scenarios safely
- No payment charges during testing
- Easy to test edge cases and error handling

**Cons**:
- Heavy mocking may miss integration issues
- Mock maintenance overhead
- May not catch actual payment flow issues
- Need to keep mocks synchronized with real APIs

**Test Structure**:
```typescript
// Mock all external dependencies
jest.mock('@convex-dev/polar/react')
jest.mock('convex/react')

describe('Billing Page Component', () => {
  beforeEach(() => {
    mockUseQuery.mockReturnValue(mockSubscriptionData)
    mockCheckoutLink.mockImplementation(({ children }) => children)
  })
  
  it('should display subscription plans', () => {
    render(<BillingPage />)
    expect(screen.getByText('Pro Plan')).toBeInTheDocument()
  })
})
```

### Approach 3: Layered Testing (Unit + Component + Payment Integration)
**Strategy**: Unit tests for logic, mocked component tests, and minimal payment integration

**Pros**:
- Comprehensive coverage at appropriate levels
- Unit tests for business logic, component tests for UI
- Selective integration testing for critical payment flows
- Balanced approach between speed and confidence

**Cons**:
- Most complex setup with multiple test types
- Still requires some payment provider setup
- Higher maintenance overhead
- Coordination needed between test layers

**Test Structure**:
```typescript
// Unit tests for billing logic
describe('Billing Logic', () => {
  it('should calculate yearly discount correctly', () => {
    expect(calculateYearlyDiscount(1999, 19999)).toBe(17)
  })
})

// Component tests for UI behavior
describe('Billing Component', () => {
  it('should toggle billing interval', () => {
    // Test UI interactions with mocks
  })
})

// Integration tests for critical flows
describe('Billing Integration', () => {
  it('should initiate checkout process', () => {
    // Test key integration points
  })
})
```

## Selected Approach: Approach 2 - Component Testing with Comprehensive Mocking

### Justification

**Primary Reasoning**:
Comprehensive mocking is optimal for billing functionality because:

1. **Safety**: Avoid accidental payment charges during testing
2. **Control**: Can test all subscription states and error conditions
3. **Speed**: Fast tests that can run frequently during development
4. **Reliability**: Consistent test results without external payment provider dependencies
5. **Coverage**: Can test edge cases that are hard to reproduce with real payment data

**Supporting Factors**:
- E2E tests can cover actual payment integration at the system level
- Component focuses on UI logic and state management
- Payment provider integration is handled by well-tested libraries (Polar)

## Implementation Details

### Test Types
- **Component Tests**: 95% coverage through React component testing
- **Integration Coverage**: Critical payment flows handled by E2E tests

### Test Scenarios

#### Plan Display Tests
1. **Free plan rendering**
   - Should display "Free" plan with $0 pricing
   - Should show plan description
   - Should indicate current plan if user is on free tier

2. **Pro plan rendering**
   - Should display monthly and yearly Pro plans
   - Should show correct pricing for each interval
   - Should calculate and display yearly savings

3. **Current plan highlighting**
   - Should highlight currently active plan
   - Should show "Current" or "Subscribed" indicator
   - Should handle edge cases (no current plan)

#### Billing Interval Management Tests
4. **Interval switching**
   - Should toggle between monthly and yearly billing
   - Should update pricing display when interval changes
   - Should maintain interval preference across plan changes

5. **Price calculations**
   - Should display correct monthly pricing
   - Should display correct yearly pricing
   - Should show savings amount for yearly plans
   - Should handle pricing edge cases (free plans, promotional pricing)

#### Subscription State Tests
6. **Current subscription detection**
   - Should identify user's current subscription plan
   - Should handle users without subscriptions
   - Should handle subscription loading states

7. **Plan comparison logic**
   - Should enable upgrades from lower tiers
   - Should handle downgrades appropriately
   - Should prevent "upgrading" to same plan

#### Payment Integration Tests
8. **Checkout link rendering**
   - Should render CheckoutLink components for paid plans
   - Should pass correct product IDs to checkout
   - Should handle checkout link loading states

9. **Customer portal integration**
   - Should render CustomerPortalLink for subscribed users
   - Should handle portal access errors
   - Should show portal button only for relevant users

#### User Interface Tests
10. **Plan selection interactions**
    - Should handle plan selection clicks
    - Should update UI state when plans are selected
    - Should provide visual feedback for interactions

11. **Switch component behavior**
    - Should toggle billing interval with switch
    - Should update pricing immediately on toggle
    - Should maintain proper switch state

#### Error Handling Tests
12. **Data loading errors**
    - Should handle failed subscription queries
    - Should display error states appropriately
    - Should provide retry mechanisms where appropriate

13. **Payment flow errors**
    - Should handle checkout initialization errors
    - Should display payment error messages
    - Should gracefully degrade when payment provider unavailable

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "@testing-library/jest-dom": "^5.16.5"
  }
}
```

#### Mock Setup
```typescript
// Mock Polar integration
jest.mock('@convex-dev/polar/react', () => ({
  CheckoutLink: ({ children, productId, ...props }) => (
    <button data-testid={`checkout-${productId}`} {...props}>
      {typeof children === 'function' ? children({ loading: false }) : children}
    </button>
  ),
  CustomerPortalLink: ({ children }) => (
    <button data-testid="customer-portal">
      {children}
    </button>
  )
}))

// Mock Convex queries
jest.mock('convex/react', () => ({
  useQuery: jest.fn()
}))

// Mock UI components if needed
jest.mock('@v1/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>
}))

jest.mock('@v1/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  )
}))
```

#### Test Data & Fixtures
```typescript
// Subscription data fixtures
const mockFreeUser = {
  subscription: null,
  plan: null
}

const mockProMonthlyUser = {
  subscription: {
    status: 'active',
    planId: 'pro-monthly',
    plan: {
      name: 'Pro Plan',
      amount: 1999,
      recurringInterval: 'month'
    }
  }
}

const mockProYearlyUser = {
  subscription: {
    status: 'active', 
    planId: 'pro-yearly',
    plan: {
      name: 'Pro Plan',
      amount: 19999,
      recurringInterval: 'year'
    }
  }
}

// Products fixture
const mockProducts = [
  {
    _id: 'pro-monthly',
    name: 'Pro Plan',
    amount: 1999,
    recurringInterval: 'month',
    description: 'Monthly Pro subscription'
  },
  {
    _id: 'pro-yearly',
    name: 'Pro Plan', 
    amount: 19999,
    recurringInterval: 'year',
    description: 'Yearly Pro subscription'
  }
]
```

### Test Structure
```
apps/app/src/app/[locale]/(dashboard)/settings/billing/page.test.tsx
├── Plan Display Tests
│   ├── Free plan rendering
│   ├── Pro plan rendering
│   └── Current plan highlighting
├── Billing Interval Tests
│   ├── Monthly/yearly switching
│   ├── Price calculations
│   └── Savings calculations
├── Subscription State Tests
│   ├── Current subscription detection
│   ├── Plan comparison logic
│   └── Subscription loading states
├── Payment Integration Tests
│   ├── Checkout link rendering
│   ├── Customer portal integration
│   └── Payment flow initiation
├── User Interface Tests
│   ├── Plan selection interactions
│   ├── Switch component behavior
│   └── Visual feedback
└── Error Handling Tests
    ├── Data loading errors
    ├── Payment flow errors
    └── Graceful degradation
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Payment mocking patterns can be reused across billing-related tests
- **Dependencies**: Tests verify integration with Polar components and UI library
- **Performance**: Fast component tests won't impact overall test suite speed

### Execution Approach
1. **Phase 1**: Set up comprehensive mocking for Polar and Convex dependencies
2. **Phase 2**: Implement core plan display and subscription state tests
3. **Phase 3**: Add billing interval and price calculation tests
4. **Phase 4**: Add payment integration and error handling tests

### Mock Strategies
- **Payment Provider**: Mock Polar CheckoutLink and CustomerPortalLink components
- **Subscription Data**: Mock Convex useQuery with various subscription states
- **UI Components**: Mock Switch and Button components for consistent behavior
- **State Management**: Mock useState for controlling component state

### Test Data Approach
- **User Fixtures**: Different subscription states (free, monthly, yearly, expired)
- **Product Fixtures**: Various pricing structures and plan options
- **Error Fixtures**: API errors and payment provider failures
- **Edge Cases**: Unusual pricing, promotional plans, legacy subscriptions

### Performance Considerations
- **Test Speed**: Target <150ms per test with effective mocking
- **Memory Management**: Clean up mocks and state between tests
- **Parallel Safety**: Ensure all mocks are isolated for concurrent test execution

### CI/CD Integration
- **Coverage Requirements**: Enforce 95% coverage due to business criticality
- **Payment Testing**: Include dedicated payment integration tests in E2E suite
- **Security Testing**: Verify no sensitive payment data is logged or exposed

### Security Considerations
- **Data Sanitization**: Ensure test fixtures don't contain real payment information
- **Mock Verification**: Verify mocks don't accidentally call real payment APIs
- **Access Control**: Test that payment features require proper authentication

### Business Logic Testing
```typescript
describe('Billing Business Logic', () => {
  it('should calculate yearly savings correctly', () => {
    const monthlyCost = 1999 // $19.99
    const yearlyCost = 19999 // $199.99
    const expectedSavings = (monthlyCost * 12 - yearlyCost) / 100
    
    expect(calculateYearlySavings(monthlyCost, yearlyCost)).toBe(expectedSavings)
  })
  
  it('should determine upgrade eligibility', () => {
    expect(canUpgrade('free', 'pro-monthly')).toBe(true)
    expect(canUpgrade('pro-monthly', 'pro-yearly')).toBe(true)
    expect(canUpgrade('pro-yearly', 'pro-monthly')).toBe(false)
  })
})
```

### Accessibility Testing
```typescript
it('should have accessible plan selection', async () => {
  const user = userEvent.setup()
  render(<BillingPage />)
  
  // Test keyboard navigation
  await user.tab()
  expect(screen.getByRole('button', { name: /pro plan/i })).toHaveFocus()
  
  // Test screen reader labels
  expect(screen.getByLabelText(/billing interval/i)).toBeInTheDocument()
})
```