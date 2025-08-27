# Dashboard Page Test Plan

**File**: `apps/app/src/app/[locale]/(dashboard)/page.tsx`  
**Current Coverage**: 0%  
**Target Coverage**: 90%  
**Priority**: 🔴 Critical

## Execution Context

### Prerequisites
- Ensure common test dependencies are installed (see coverage-strategy.md)
- Working directory: `/Users/e/dev/github.com/cloudbring/v1-convex`

### Test File Creation
```bash
# Create test file
touch apps/app/src/app/[locale]/\(dashboard\)/page.test.tsx
```

### Run This Test Only
```bash
# Run only this test file
bunx vitest run "apps/app/src/app/**/\(dashboard\)/page.test.tsx"

# Run with coverage for this file
bunx vitest run --coverage "apps/app/src/app/**/\(dashboard\)/page.test.tsx"

# Watch mode for development
bunx vitest watch "apps/app/src/app/**/\(dashboard\)/page.test.tsx"
```

### Coverage Measurement
```bash
# Check coverage for dashboard page specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."apps/app/src/app/[locale]/(dashboard)/page.tsx"'
```

### Implementation Commands
```bash
# Create the test file with complete implementation
cd apps/app
cat > "src/app/[locale]/(dashboard)/page.test.tsx" << 'EOF'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Page, { metadata } from './page'

expect.extend(toHaveNoViolations)

// Mock server-side i18n
const mockGetScopedI18n = vi.fn()
vi.mock('@/locales/server', () => ({
  getScopedI18n: mockGetScopedI18n
}))

// Mock Header component
vi.mock('@/app/[locale]/(dashboard)/_components/header', () => ({
  Header: ({ title, description }: any) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}))

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Plus: () => <span data-testid="plus-icon">+</span>,
  ExternalLink: () => <span data-testid="external-link-icon">↗</span>
}))

// Mock UI components
vi.mock('@v1/ui/button', () => ({
  buttonVariants: vi.fn(() => 'mocked-button-class')
}))

vi.mock('@v1/ui/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    mockGetScopedI18n.mockImplementation(() => (key: string) => {
      const translations: Record<string, string> = {
        'title': 'Dashboard Test Title',
        'description': 'Dashboard Test Description',
        'bodyTitle': 'Body Test Title',
        'bodyDescription': 'Body Test Description',
        'bodyTip': 'Test Tip',
        'documentationLink': 'Test Documentation Link'
      }
      return translations[key] || `missing.${key}`
    })
  })

  it('should render dashboard page structure', async () => {
    const PageComponent = Page as any
    render(await PageComponent())
    
    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Test Title')).toBeInTheDocument()
    expect(screen.getByText('Dashboard Test Description')).toBeInTheDocument()
  })

  it('should render body content with icons', async () => {
    const PageComponent = Page as any
    render(await PageComponent())
    
    expect(screen.getByText('Body Test Title')).toBeInTheDocument()
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument()
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument()
  })

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('Home')
  })

  it('should render documentation link', async () => {
    const PageComponent = Page as any
    render(await PageComponent())
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://docs.convex-saas.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should have no accessibility violations', async () => {
    const PageComponent = Page as any
    const { container } = render(await PageComponent())
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
EOF
```

## File Overview

The main dashboard page is the first screen users see after authentication. It's a server component that:
- Uses internationalization for multi-language support
- Renders the main dashboard header with localized content
- Displays an empty state with documentation links
- Includes responsive design elements and branding

### Dependencies
- `@/locales/server` - Server-side i18n
- `@v1/ui/button` - UI button components
- `@v1/ui/utils` - Utility functions (cn)
- `lucide-react` - Icon components
- Header component from dashboard components

### Complexity Analysis
- **Medium**: Server component with async data fetching
- **UI-Heavy**: Complex JSX structure with responsive classes
- **I18n Integration**: Multiple localized strings
- **Static**: No complex business logic or user interactions

## Coverage Analysis

### Current State
- **0% coverage** - No tests exist
- **76 lines** of code including JSX structure
- **Server component** requiring special testing approach

### Critical Paths to Test
1. Server-side i18n data fetching (`getScopedI18n`)
2. Metadata generation (title)
3. Component rendering with localized strings
4. Header component integration
5. Documentation link rendering
6. Responsive CSS class application
7. Icon rendering (Plus, ExternalLink)

## Testing Approaches

### Approach 1: Next.js App Router Testing with RSC Support
**Strategy**: Use Next.js testing utilities to test server components with app router

**Pros**:
- Tests actual server component behavior
- Tests i18n integration in server context
- Most accurate representation of production behavior
- Tests metadata generation

**Cons**:
- Complex setup with Next.js app router testing
- Requires experimental RSC testing features
- Slower test execution
- Limited tooling and examples available
- May require custom test utilities

**Test Structure**:
```typescript
// Requires experimental Next.js testing features
import { render } from '@testing-library/react'
import { createServerContext } from 'next/test/server'

describe('Dashboard Page RSC', () => {
  it('should render with localized content', async () => {
    const DashboardPage = await import('./page')
    const { container } = await render(<DashboardPage />, {
      wrapper: createServerContext()
    })
    expect(container).toHaveTextContent('expected localized content')
  })
})
```

### Approach 2: Component Testing with Mocked Dependencies
**Strategy**: Test the page component with mocked i18n and server dependencies

**Pros**:
- Standard React Testing Library approach
- Fast test execution
- Easy to control i18n strings and test different locales
- Can test component logic independently
- Well-supported testing patterns

**Cons**:
- Doesn't test actual server component behavior
- Heavy mocking of server-side functionality
- May miss server-specific issues
- Need to mock async i18n fetching

**Test Structure**:
```typescript
// Mock server-side dependencies
jest.mock('@/locales/server', () => ({
  getScopedI18n: jest.fn()
}))

describe('Dashboard Page Component', () => {
  beforeEach(() => {
    mockGetScopedI18n.mockResolvedValue((key: string) => `mocked.${key}`)
  })
  
  it('should render dashboard content', async () => {
    const DashboardPage = await import('./page').default
    render(<DashboardPage />)
    expect(screen.getByText('mocked.title')).toBeInTheDocument()
  })
})
```

### Approach 3: Hybrid Testing (Unit + Integration + E2E)
**Strategy**: Multi-layer approach testing different aspects at different levels

**Pros**:
- Comprehensive coverage of all functionality
- Unit tests for fast feedback, E2E for behavior verification
- Can test both component logic and server behavior
- Balanced approach with multiple verification layers

**Cons**:
- Most complex setup and maintenance overhead
- Potential for test duplication across layers
- Requires coordination between different test types
- Higher total time investment

**Test Structure**:
```typescript
// Unit tests for component logic
describe('Dashboard Page Logic', () => {
  it('should generate correct metadata', () => {
    expect(metadata.title).toBe('Home')
  })
})

// Component tests for rendering
describe('Dashboard Page Rendering', () => {
  it('should render with mocked i18n', async () => {
    // Test component rendering with mocks
  })
})

// E2E tests for full behavior  
describe('Dashboard Page E2E', () => {
  it('should display dashboard correctly for authenticated user', async () => {
    // Playwright test for full page behavior
  })
})
```

## Selected Approach: Approach 2 - Component Testing with Mocked Dependencies

### Justification

**Primary Reasoning**:
Component testing with mocked dependencies is the optimal choice because:

1. **Practicality**: Current Next.js RSC testing support is experimental and unstable
2. **Speed**: Fast unit tests provide quick feedback during development
3. **Control**: Can easily test different i18n scenarios and edge cases
4. **Reliability**: Well-established testing patterns with good tooling support
5. **Coverage**: Can achieve 90%+ coverage testing component behavior

**Secondary Benefits**:
- E2E tests already cover full page behavior in browser context
- Component tests focus on rendering logic and i18n integration
- Easier maintenance compared to complex RSC testing setup

## Implementation Details

### Test Types
- **Component Tests**: 90% of coverage through React component testing
- **Integration Coverage**: Handled by existing E2E dashboard tests

### Test Scenarios

#### Rendering Tests
1. **Basic page rendering**
   - Should render header component
   - Should render main dashboard content area
   - Should display empty state message

2. **Internationalization**
   - Should render localized strings for title
   - Should render localized body content
   - Should render localized description text
   - Should render localized documentation link text

3. **UI Components**
   - Should render Plus icon in empty state
   - Should render ExternalLink icon in documentation link
   - Should render button with correct variant and size

#### Metadata Tests
4. **Page metadata**
   - Should export correct metadata object
   - Should have title "Home"

#### Responsive Design Tests  
5. **CSS classes**
   - Should apply correct responsive classes
   - Should use proper Tailwind utility classes
   - Should have correct layout classes

#### Integration Tests
6. **Header component integration**
   - Should pass correct props to Header component
   - Should render Header with title and description

7. **External link behavior**
   - Should render documentation link with correct href
   - Should have proper accessibility attributes (target, rel)

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0"
  }
}
```

#### Mock Setup
```typescript
// Mock server-side i18n
jest.mock('@/locales/server', () => ({
  getScopedI18n: jest.fn()
}))

// Mock Header component
jest.mock('@/app/[locale]/(dashboard)/_components/header', () => ({
  Header: jest.fn(({ title, description }) => (
    <div data-testid="header">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ))
}))

// Mock UI components if needed for isolation
jest.mock('@v1/ui/button', () => ({
  buttonVariants: jest.fn(() => 'mocked-button-class')
}))
```

#### Test Data & Fixtures
```typescript
// Mock i18n responses
const mockI18nData = {
  title: 'Dashboard Test Title',
  description: 'Dashboard Test Description', 
  bodyTitle: 'Body Test Title',
  bodyDescription: 'Body Test Description',
  bodyTip: 'Test Tip',
  documentationLink: 'Test Documentation Link'
}

// Helper to setup i18n mock
const setupI18nMock = (data = mockI18nData) => {
  mockGetScopedI18n.mockImplementation((scope) => {
    return (key: string) => data[key] || `missing.${key}`
  })
}
```

### Test Structure
```
apps/app/src/app/[locale]/(dashboard)/page.test.tsx
├── Basic Rendering Tests
│   ├── Page structure rendering
│   ├── Header component integration
│   └── Empty state content
├── Internationalization Tests  
│   ├── Localized string rendering
│   ├── Missing key handling
│   └── Different locale scenarios
├── UI Component Tests
│   ├── Icon rendering
│   ├── Button component integration
│   └── Link attributes
├── Metadata Tests
│   └── Page metadata export
└── Accessibility Tests
    ├── ARIA attributes
    ├── Semantic HTML structure
    └── Link accessibility
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: i18n mocking patterns can be reused across page tests
- **Dependencies**: Header component may need its own test coverage
- **Performance**: Fast component tests won't impact test suite speed

### Execution Approach
1. **Phase 1**: Set up i18n mocking infrastructure and basic rendering tests
2. **Phase 2**: Add comprehensive internationalization test scenarios  
3. **Phase 3**: Test UI component integration and accessibility
4. **Phase 4**: Add metadata and edge case testing

### Mock Strategies
- **I18n Service**: Mock `getScopedI18n` with configurable return values
- **Header Component**: Mock with props verification to test integration
- **UI Components**: Shallow mocking to focus on page logic
- **Icons**: Mock Lucide React icons to avoid SVG rendering complexity

### Test Data Approach
- **I18n Fixtures**: Predefined translation objects for different test scenarios
- **Component Props**: Fixtures for testing Header component integration
- **Error States**: Mock data for testing missing translation scenarios

### Performance Considerations
- **Fast Execution**: Component tests should run in <50ms each
- **Parallel Safe**: All mocks are isolated and safe for parallel execution
- **Memory Efficient**: Minimal fixtures and proper mock cleanup

### CI/CD Integration
- **Coverage Enforcement**: Require 90% coverage for dashboard page
- **Snapshot Testing**: Consider visual regression testing for UI components
- **Accessibility Testing**: Include automated a11y testing with jest-axe

### Accessibility Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<DashboardPage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Visual Regression Considerations
- Consider adding Storybook stories for the dashboard page
- Could add visual regression testing with Chromatic
- Useful for catching unintended UI changes in complex layouts