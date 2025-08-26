# Marketing Footer Test Plan

**File**: `apps/web/src/components/footer.tsx`  
**Current Coverage**: 0%  
**Target Coverage**: 90%  
**Priority**: 🟡 Medium

## Execution Context

### Prerequisites
- Ensure common test dependencies are installed (see coverage-strategy.md)
- Working directory: `/Users/e/dev/github.com/cloudbring/v1-convex`

### Test File Creation
```bash
# Create test file for footer
touch apps/web/src/components/footer.test.tsx
```

### Run This Test Only
```bash
# Run only footer test
bunx vitest run apps/web/src/components/footer.test.tsx

# Run with coverage for footer
bunx vitest run --coverage apps/web/src/components/footer.test.tsx

# Watch mode for development
bunx vitest watch apps/web/src/components/footer.test.tsx
```

### Coverage Measurement
```bash
# Check coverage for footer specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."apps/web/src/components/footer.tsx"'
```

### Implementation Commands
```bash
cd apps/web

# Create comprehensive footer tests
cat > src/components/footer.test.tsx << 'EOF'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Footer } from './footer'

expect.extend(toHaveNoViolations)

const expectedPartnerLinks = [
  { name: 'Convex', href: 'https://convex.dev/c/middayv1template' },
  { name: 'Vercel', href: 'https://vercel.com?utm_source=v1' },
  { name: 'Cal.com', href: 'https://cal.com?utm_source=v1' },
  { name: 'Polar', href: 'https://polar.sh?utm_source=v1' }
]

describe('Footer Component', () => {
  it('should render footer structure', () => {
    render(<Footer />)
    
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    expect(screen.getByText('Featuring')).toBeInTheDocument()
  })

  it.each(expectedPartnerLinks)('should render $name link correctly', ({ name, href }) => {
    render(<Footer />)
    
    const links = screen.getAllByRole('link', { name: new RegExp(name, 'i') })
    expect(links).toHaveLength(2) // Duplicate for marquee
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('should render all partner logos', () => {
    render(<Footer />)
    
    const svgs = screen.getAllByRole('img', { hidden: true })
    expect(svgs).toHaveLength(8) // 4 logos × 2 for marquee animation
    
    svgs.forEach(svg => {
      expect(svg.querySelector('path')).toBeInTheDocument()
    })
  })

  it('should have no accessibility violations', async () => {
    const { container } = render(<Footer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should apply correct CSS classes for marquee animation', () => {
    render(<Footer />)
    
    const marqueeContainer = document.querySelector('.animate-marquee')
    expect(marqueeContainer).toBeInTheDocument()
  })
})
EOF
```

## File Overview

The Footer component is a large marketing component (500 lines) that showcases partner company logos:
- Displays "Featuring" text above partner logos
- Contains four company logos: Convex, Vercel, Cal.com, and Polar
- Implements responsive marquee animation for mobile devices
- Uses inline SVGs for all partner logos
- Positioned as fixed footer at bottom of page

### Dependencies
- No external dependencies
- Pure React functional component
- Uses Tailwind CSS classes for styling
- Contains large inline SVG logo definitions

### Complexity Analysis
- **High**: 500 lines primarily due to extensive inline SVG paths
- **Static**: No dynamic logic or state management
- **Visual**: Primarily focused on visual presentation and animations
- **Marketing**: Partner showcase component for landing pages

## Coverage Analysis

### Current State
- **0% coverage** - No tests exist
- **500 lines** of code (mostly SVG paths)
- **Simple component logic** but large codebase due to SVG content

### Critical Paths to Test
1. **Component Rendering**:
   - Footer structure and layout
   - "Featuring" text display
   - Container and animation classes

2. **Partner Links**:
   - All four company links render correctly
   - External link attributes (target="_blank", rel="noopener noreferrer")
   - Correct href URLs for each partner

3. **SVG Logo Rendering**:
   - All SVG logos render without errors
   - Proper SVG attributes and viewBox dimensions
   - SVG paths render correctly

4. **Responsive Animation**:
   - Marquee animation classes applied
   - Different animation behavior on desktop vs mobile
   - CSS animation class application

## Testing Approaches

### Approach 1: Comprehensive Component Testing with SVG Validation
**Strategy**: Test complete component rendering including SVG content validation

**Pros**:
- Validates all SVG content renders correctly
- Tests actual visual output
- Catches SVG path errors or malformation
- Comprehensive coverage of all component aspects

**Cons**:
- Heavy test setup due to large SVG content
- Slow test execution due to DOM size
- SVG testing complexity
- May be brittle due to large inline content

**Test Structure**:
```typescript
import { render, screen } from '@testing-library/react'
import { Footer } from './footer'

describe('Footer Component', () => {
  it('should render all partner logos with SVG content', () => {
    render(<Footer />)
    
    // Test each SVG by viewBox or unique paths
    expect(screen.getByRole('img', { name: /convex/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /vercel/i })).toBeInTheDocument()
    
    // Validate SVG paths exist
    const convexLogo = screen.getByRole('img', { name: /convex/i })
    expect(convexLogo.querySelector('path')).toBeInTheDocument()
  })
})
```

### Approach 2: Structural Testing with Mocked SVG Content
**Strategy**: Test component structure and links while mocking/simplifying SVG content

**Pros**:
- Fast test execution
- Focuses on component logic rather than SVG details
- Easy to maintain and update
- Tests critical functionality (links, structure)
- Avoids SVG complexity

**Cons**:
- Doesn't validate actual SVG content
- May miss SVG-related rendering issues
- Requires mocking large portions of component
- Less comprehensive visual validation

**Test Structure**:
```typescript
// Mock SVG content to focus on structure
jest.mock('./footer', () => ({
  Footer: () => (
    <footer data-testid="footer">
      <span>Featuring</span>
      <div>
        <a href="https://convex.dev/c/middayv1template" data-testid="convex-link">
          <div data-testid="convex-logo">Convex Logo</div>
        </a>
        {/* Other partner links */}
      </div>
    </footer>
  )
}))

describe('Footer Structure', () => {
  it('should render partner links', () => {
    render(<Footer />)
    expect(screen.getByTestId('convex-link')).toHaveAttribute(
      'href', 
      'https://convex.dev/c/middayv1template'
    )
  })
})
```

### Approach 3: Hybrid Testing (Structure + Visual + Accessibility)
**Strategy**: Multi-layered testing focusing on different aspects at appropriate levels

**Pros**:
- Balanced coverage across different concerns
- Structure tests for links and layout
- Accessibility tests for proper link attributes
- Visual tests for key elements without full SVG validation
- Maintainable and focused test suites

**Cons**:
- More complex test organization
- Multiple test files/suites to maintain
- Potential for some overlap between test types
- Requires careful test planning

**Test Structure**:
```typescript
// Structure tests
describe('Footer Structure', () => {
  it('should render footer with correct layout', () => {
    // Test layout and basic structure
  })
})

// Link behavior tests  
describe('Footer Links', () => {
  it('should have correct external link attributes', () => {
    // Test all partner links
  })
})

// Accessibility tests
describe('Footer Accessibility', () => {
  it('should meet accessibility standards', () => {
    // Test a11y compliance
  })
})
```

## Selected Approach: Approach 3 - Hybrid Testing (Structure + Visual + Accessibility)

### Justification

**Primary Reasoning**:
Hybrid testing is optimal for this large visual component because:

1. **Balanced Coverage**: Tests critical functionality without getting bogged down in SVG details
2. **Maintainability**: Focuses on what matters most - links, structure, and accessibility
3. **Performance**: Avoids heavy SVG validation while covering essential behaviors
4. **Practical**: Tests the component as users and search engines experience it
5. **Future-Proof**: Easy to extend when component changes or new partners are added

**Supporting Factors**:
- Visual regression tests can handle SVG rendering validation
- E2E tests cover the complete visual experience
- Component testing focuses on structural integrity and link functionality

## Implementation Details

### Test Types
- **Structural Tests**: 40% coverage - Basic rendering and layout
- **Link Tests**: 30% coverage - Partner link validation and attributes  
- **Accessibility Tests**: 20% coverage - A11y compliance and semantic HTML

### Test Scenarios

#### Structural Rendering Tests
1. **Basic component rendering**
   - Should render footer element
   - Should render "Featuring" text
   - Should render partner logo container
   - Should apply correct CSS classes

2. **Layout structure**
   - Should render fixed positioning classes
   - Should render flex layout containers
   - Should apply responsive animation classes
   - Should render marquee animation containers

#### Partner Link Tests
3. **Convex link validation**
   - Should render Convex link with correct href
   - Should have external link attributes
   - Should contain Convex logo SVG

4. **Vercel link validation**
   - Should render Vercel link with correct href
   - Should have external link attributes
   - Should contain Vercel logo SVG

5. **Cal.com link validation**
   - Should render Cal.com link with correct href
   - Should have external link attributes
   - Should contain Cal.com logo SVG

6. **Polar link validation**
   - Should render Polar link with correct href
   - Should have external link attributes  
   - Should contain Polar logo SVG

#### Animation and Responsive Tests
7. **Animation classes**
   - Should apply marquee animation classes
   - Should apply different classes for mobile vs desktop
   - Should render duplicate content for continuous scroll

8. **Responsive behavior**
   - Should hide/show appropriate elements on different screen sizes
   - Should apply correct positioning classes
   - Should handle mobile marquee animation

#### Accessibility Tests
9. **Link accessibility**
   - Should have proper external link attributes
   - Should have accessible link text or aria-labels
   - Should use semantic HTML structure

10. **SVG accessibility**
    - Should have appropriate alt text or aria-labels for logos
    - Should not interfere with screen readers
    - Should maintain focus order

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest-axe": "^8.0.0"
  }
}
```

#### Test Data & Fixtures
```typescript
// Partner links fixture
const expectedPartnerLinks = [
  {
    name: 'Convex',
    href: 'https://convex.dev/c/middayv1template',
    testId: 'convex-link'
  },
  {
    name: 'Vercel', 
    href: 'https://vercel.com?utm_source=v1',
    testId: 'vercel-link'
  },
  {
    name: 'Cal.com',
    href: 'https://cal.com?utm_source=v1',
    testId: 'cal-link'
  },
  {
    name: 'Polar',
    href: 'https://polar.sh?utm_source=v1',
    testId: 'polar-link'
  }
]

// CSS classes fixture
const expectedClasses = {
  footer: 'flex items-center justify-center font-mono text-xs fixed bottom-8 w-full flex-col space-y-6',
  marquee: 'animate-marquee',
  marquee2: 'animate-marquee2',
  container: 'relative flex overflow-x-hidden space-x-6'
}
```

### Test Structure
```
apps/web/src/components/footer.test.tsx
├── Basic Rendering Tests
│   ├── Footer element rendering
│   ├── "Featuring" text display
│   └── Container structure
├── Partner Link Tests
│   ├── Convex link and logo
│   ├── Vercel link and logo
│   ├── Cal.com link and logo
│   └── Polar link and logo
├── Layout and Animation Tests
│   ├── CSS class application
│   ├── Marquee animation setup
│   └── Responsive behavior
└── Accessibility Tests
    ├── External link attributes
    ├── Semantic HTML structure
    └── WCAG compliance
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Partner link testing patterns can be reused for other marketing components
- **Dependencies**: Large component may increase test suite memory usage
- **Performance**: Simple structural tests won't impact test performance

### Execution Approach
1. **Phase 1**: Set up basic structural rendering tests
2. **Phase 2**: Add comprehensive partner link validation
3. **Phase 3**: Add responsive animation and layout tests  
4. **Phase 4**: Add accessibility and semantic HTML tests

### Mock Strategies
- **No Heavy Mocking**: Keep component intact to test real structure
- **SVG Simplification**: Focus on SVG presence rather than path validation
- **External Links**: Test href and attributes rather than actual navigation
- **Animation Classes**: Test class application rather than animation behavior

### Test Data Approach
- **Partner Fixtures**: Centralized partner link data for consistency
- **Class Fixtures**: Expected CSS classes for layout validation
- **Accessibility Fixtures**: Expected a11y attributes for compliance testing

### Performance Considerations
- **Test Speed**: Target <100ms per test despite large component
- **Memory Usage**: Monitor test memory usage due to large SVG content
- **Parallel Safety**: All tests are stateless and safe for parallel execution

### CI/CD Integration
- **Coverage Requirements**: 90% coverage focusing on functional aspects
- **Visual Testing**: Consider Storybook stories for visual regression
- **Link Validation**: Could add E2E tests to verify actual link destinations

### Accessibility Testing Strategy
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

it('should have no accessibility violations', async () => {
  const { container } = render(<Footer />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

it('should have proper external link attributes', () => {
  render(<Footer />)
  
  const links = screen.getAllByRole('link')
  
  links.forEach(link => {
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
```

### Visual Testing Considerations
```typescript
it('should render all partner logos', () => {
  render(<Footer />)
  
  // Test SVG presence without validating complex paths
  const svgs = screen.getAllByRole('img', { hidden: true })
  expect(svgs).toHaveLength(8) // 4 logos × 2 for marquee animation
  
  // Test that each SVG has paths (basic structure)
  svgs.forEach(svg => {
    expect(svg.querySelector('path')).toBeInTheDocument()
  })
})
```

### Link Validation Strategy
```typescript
describe('Partner Links', () => {
  it.each(expectedPartnerLinks)('should render %s link correctly', ({ name, href }) => {
    render(<Footer />)
    
    const links = screen.getAllByRole('link', { name: new RegExp(name, 'i') })
    expect(links).toHaveLength(2) // Duplicate for marquee
    
    links.forEach(link => {
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })
})
```

### Error Handling Considerations
- **Missing SVG Content**: Test graceful degradation if SVG fails to render
- **Broken Links**: Validate href format and structure
- **Animation Failures**: Ensure component renders even if animations don't load
- **Responsive Issues**: Test layout stability across viewport sizes