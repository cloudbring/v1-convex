# Login Page Test Plan

**File**: `apps/app/src/app/[locale]/(public)/login/page.tsx`  
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
touch apps/app/src/app/[locale]/\(public\)/login/page.test.tsx
```

### Run This Test Only
```bash
# Run only this test file
bunx vitest run "apps/app/src/app/**/login/page.test.tsx"

# Run with coverage for this file
bunx vitest run --coverage "apps/app/src/app/**/login/page.test.tsx"

# Watch mode for development
bunx vitest watch "apps/app/src/app/**/login/page.test.tsx"
```

### Coverage Measurement
```bash
# Check coverage for login page specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."apps/app/src/app/[locale]/(public)/login/page.tsx"'
```

### Implementation Commands
```bash
# Create the test file with complete implementation
cd apps/app
cat > "src/app/[locale]/(public)/login/page.test.tsx" << 'EOF'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Page, { metadata } from './page'

expect.extend(toHaveNoViolations)

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, ...props }: any) => (
    <img 
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  )
}))

// Mock GoogleSignin component
vi.mock('@/components/google-signin', () => ({
  GoogleSignin: () => (
    <button data-testid="google-signin">
      Sign in with Google
    </button>
  )
}))

describe('Login Page', () => {
  it('should render page structure correctly', () => {
    render(<Page />)
    
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByAltText('logo')).toBeInTheDocument()
    expect(screen.getByTestId('google-signin')).toBeInTheDocument()
  })

  it('should render logo with correct attributes', () => {
    render(<Page />)
    
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute('src', '/logo.png')
    expect(logo).toHaveAttribute('width', '350')
    expect(logo).toHaveAttribute('height', '350')
  })

  it('should have correct metadata', () => {
    expect(metadata.title).toBe('Login')
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<Page />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should maintain responsive layout', () => {
    render(<Page />)
    
    const container = screen.getByRole('main')
    expect(container).toHaveClass('h-screen', 'w-screen', 'flex', 'flex-col', 'items-center', 'justify-center')
  })
})
EOF
```

## File Overview

The login page is a simple but critical authentication entry point that:
- Displays the company logo prominently
- Renders the GoogleSignin component for authentication
- Uses responsive design for optimal display across devices
- Serves as the main entry point for unauthenticated users

### Dependencies
- `@/components/google-signin` - Google authentication component
- `next/image` - Next.js optimized image component
- Static assets (`/logo.png`)

### Complexity Analysis
- **Low**: Simple server component with minimal logic
- **Critical**: Authentication entry point for all users
- **UI-focused**: Primarily layout and image rendering
- **Static**: No complex business logic or state management

## Coverage Analysis

### Current State
- **0% coverage** - No tests exist
- **17 lines** of simple component code
- **Authentication critical** but structurally simple

### Critical Paths to Test
1. **Component Rendering**:
   - Page structure and layout
   - Logo image rendering with proper attributes
   - GoogleSignin component integration

2. **Accessibility**:
   - Image alt text and accessibility attributes
   - Semantic HTML structure
   - Keyboard navigation support

3. **Responsive Design**:
   - Layout behavior across screen sizes
   - Image scaling and positioning
   - Component positioning and alignment

4. **Metadata**:
   - Page title configuration
   - SEO and meta tag handling

## Testing Approaches

### Approach 1: Server Component Testing with Next.js Test Utils
**Strategy**: Use Next.js testing utilities to test server component rendering

**Pros**:
- Tests actual server component behavior
- Tests Next.js Image optimization
- Most accurate production representation
- Tests metadata generation

**Cons**:
- Complex setup with experimental Next.js features
- Requires server component test environment
- Limited tooling and documentation
- Potential for test instability

**Test Structure**:
```typescript
import { render } from '@testing-library/react'
import { createMockRouter } from 'next-router-mock'

describe('Login Page RSC', () => {
  it('should render login page server component', async () => {
    const LoginPage = await import('./page')
    const { container } = render(<LoginPage />)
    expect(container.querySelector('img')).toHaveAttribute('alt', 'logo')
  })
})
```

### Approach 2: Component Testing with Mocked Dependencies
**Strategy**: Test as regular React component with mocked Next.js features

**Pros**:
- Simple React Testing Library approach
- Fast test execution
- Easy to mock Image component and dependencies
- Well-established testing patterns
- Reliable and stable

**Cons**:
- Doesn't test actual Next.js Image behavior
- May miss server-specific rendering issues
- Requires mocking Next.js components
- Less accurate than server component testing

**Test Structure**:
```typescript
// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />
}))

// Mock GoogleSignin component
jest.mock('@/components/google-signin', () => ({
  GoogleSignin: () => <button data-testid="google-signin">Sign in with Google</button>
}))

describe('Login Page Component', () => {
  it('should render logo and sign-in button', () => {
    render(<LoginPage />)
    expect(screen.getByAltText('logo')).toBeInTheDocument()
    expect(screen.getByTestId('google-signin')).toBeInTheDocument()
  })
})
```

### Approach 3: Hybrid Testing (Component + E2E + Visual)
**Strategy**: Multi-layer testing focusing on different aspects

**Pros**:
- Comprehensive coverage across test types
- Component tests for structure, E2E for behavior, visual for design
- Can catch issues at multiple levels
- Balanced approach for critical authentication page

**Cons**:
- Most complex setup and maintenance
- Potential for test duplication
- Higher overhead for simple component
- May be overengineering for this simple page

**Test Structure**:
```typescript
// Unit tests for metadata
describe('Login Page Metadata', () => {
  it('should export correct metadata', () => {
    expect(metadata.title).toBe('Login')
  })
})

// Component tests for rendering
describe('Login Page Rendering', () => {
  it('should render layout correctly', () => {
    // Test component structure
  })
})

// E2E tests for authentication flow
describe('Login Page E2E', () => {
  it('should complete authentication flow', async () => {
    // Playwright test for full authentication
  })
})
```

## Selected Approach: Approach 2 - Component Testing with Mocked Dependencies

### Justification

**Primary Reasoning**:
Component testing with mocking is optimal for this simple page because:

1. **Simplicity**: Page structure is straightforward and doesn't require complex server testing
2. **Speed**: Fast tests provide immediate feedback during development
3. **Reliability**: Well-established testing patterns with stable tooling
4. **Maintainability**: Simple test setup that's easy to understand and maintain
5. **Coverage**: Can achieve 95%+ coverage testing component behavior and integration

**Supporting Factors**:
- E2E tests already cover full authentication flow
- Visual regression tests can handle design/layout verification
- Component focuses on UI rendering rather than complex logic

## Implementation Details

### Test Types
- **Component Tests**: 95% coverage through React component testing
- **Integration Coverage**: Authentication flow handled by E2E tests

### Test Scenarios

#### Basic Rendering Tests
1. **Page structure**
   - Should render main container with correct layout classes
   - Should render centered content area
   - Should have proper flex layout structure

2. **Logo rendering**
   - Should render Image component with correct src
   - Should have proper alt text for accessibility
   - Should have correct width and height attributes
   - Should handle image loading states

3. **Authentication component integration**
   - Should render GoogleSignin component
   - Should integrate properly with authentication flow
   - Should handle component loading states

#### Metadata Tests
4. **Page metadata**
   - Should export metadata object with correct title
   - Should have title "Login"

#### Accessibility Tests
5. **Image accessibility**
   - Should have descriptive alt text
   - Should be properly labeled for screen readers

6. **Page structure accessibility**
   - Should use semantic HTML structure
   - Should be keyboard navigable
   - Should meet WCAG accessibility standards

#### Responsive Design Tests
7. **Layout responsiveness**
   - Should maintain proper layout on different screen sizes
   - Should center content appropriately
   - Should handle various viewport dimensions

#### Component Integration Tests
8. **GoogleSignin integration**
   - Should render authentication component
   - Should pass correct props to GoogleSignin
   - Should handle authentication component errors

#### Error Handling Tests
9. **Image loading errors**
   - Should handle missing logo file gracefully
   - Should provide fallback for failed image loads

10. **Component loading errors**
    - Should handle GoogleSignin component loading failures
    - Should display error states appropriately

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "jest-axe": "^8.0.0"
  }
}
```

#### Mock Setup
```typescript
// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, ...props }) => (
    <img 
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  )
}))

// Mock GoogleSignin component
jest.mock('@/components/google-signin', () => ({
  GoogleSignin: () => (
    <button data-testid="google-signin">
      Sign in with Google
    </button>
  )
}))
```

#### Test Data & Fixtures
```typescript
// Image props fixture
const expectedImageProps = {
  src: '/logo.png',
  alt: 'logo',
  width: 350,
  height: 350
}

// Metadata fixture
const expectedMetadata = {
  title: 'Login'
}
```

### Test Structure
```
apps/app/src/app/[locale]/(public)/login/page.test.tsx
├── Basic Rendering Tests
│   ├── Page structure rendering
│   ├── Logo image rendering
│   └── GoogleSignin component integration
├── Metadata Tests
│   └── Page metadata export
├── Accessibility Tests
│   ├── Image accessibility
│   ├── Page structure accessibility
│   └── WCAG compliance
├── Responsive Design Tests
│   ├── Layout behavior
│   └── Content positioning
├── Component Integration Tests
│   ├── GoogleSignin integration
│   └── Props passing
└── Error Handling Tests
    ├── Image loading errors
    └── Component errors
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Simple mocking patterns can be reused for other page tests
- **Dependencies**: GoogleSignin component will need separate comprehensive testing
- **Performance**: Lightweight tests won't impact test suite performance

### Execution Approach
1. **Phase 1**: Set up basic mocking for Next.js Image and GoogleSignin components
2. **Phase 2**: Implement core rendering and metadata tests
3. **Phase 3**: Add accessibility and responsive design tests
4. **Phase 4**: Add error handling and edge case tests

### Mock Strategies
- **Next.js Image**: Mock to return regular img element with same props
- **GoogleSignin**: Mock to return testable button element
- **Static Assets**: Mock image loading behavior if needed
- **Metadata**: Test exported metadata object directly

### Test Data Approach
- **Props Fixtures**: Expected props for Image component verification
- **Metadata Fixtures**: Expected metadata values
- **Error Fixtures**: Error states for testing failure scenarios
- **Accessibility Fixtures**: Expected accessibility attributes

### Performance Considerations
- **Test Speed**: Target <50ms per test with simple component structure
- **Memory Efficiency**: Minimal fixtures and clean mock setup
- **Parallel Execution**: All mocks isolated for concurrent test runs

### CI/CD Integration
- **Coverage Requirements**: 95% coverage for authentication entry point
- **Accessibility Testing**: Automated a11y checks with jest-axe
- **Visual Regression**: Consider snapshot testing for layout consistency

### Accessibility Testing Strategy
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  render(<LoginPage />)
  const results = await axe(document.body)
  expect(results).toHaveNoViolations()
})

it('should have proper image accessibility', () => {
  render(<LoginPage />)
  const logo = screen.getByAltText('logo')
  expect(logo).toBeInTheDocument()
  expect(logo).toHaveAttribute('alt', 'logo')
})
```

### Responsive Design Testing
```typescript
it('should maintain layout on different screen sizes', () => {
  // Test mobile viewport
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375
  })
  
  render(<LoginPage />)
  const container = screen.getByRole('main')
  expect(container).toHaveClass('flex flex-col items-center justify-center')
})
```

### Visual Regression Considerations
- Simple page layout makes it good candidate for snapshot testing
- Consider adding Storybook story for visual testing
- Layout changes should be easily caught by screenshot comparisons

### Integration with Authentication Flow
- Tests focus on UI rendering; authentication logic tested in GoogleSignin component
- E2E tests handle full authentication flow verification
- Component tests verify proper integration between login page and auth component