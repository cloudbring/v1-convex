# Dropdown Menu UI Component Test Plan

**File**: `packages/ui/src/components/dropdown-menu.tsx`  
**Current Coverage**: ~45% (estimated from existing tests)  
**Target Coverage**: 95%  
**Priority**: 🟠 High

## Execution Context

### Prerequisites
- Ensure common test dependencies are installed (see coverage-strategy.md)
- Working directory: `/Users/e/dev/github.com/cloudbring/v1-convex`

### Test File Creation
```bash
# Enhance existing test file
# File already exists at: packages/ui/src/components/dropdown-menu.test.tsx
```

### Run This Test Only
```bash
# Run only this test file
bunx vitest run packages/ui/src/components/dropdown-menu.test.tsx

# Run with coverage for this file
bunx vitest run --coverage packages/ui/src/components/dropdown-menu.test.tsx

# Watch mode for development
bunx vitest watch packages/ui/src/components/dropdown-menu.test.tsx
```

### Coverage Measurement
```bash
# Check coverage for dropdown menu specifically
bunx vitest run --coverage --reporter=json | jq '.coverageMap."packages/ui/src/components/dropdown-menu.tsx"'
```

### Enhancement Commands
```bash
# Add comprehensive test cases to existing file
cd packages/ui
cat >> src/components/dropdown-menu.test.tsx << 'EOF'

// Add enhanced test coverage for interactive behavior
describe('Dropdown Menu Interactive Behavior', () => {
  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    const trigger = screen.getByText('Open')
    await user.click(trigger)
    
    // Test arrow key navigation
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
  })

  it('should handle checkbox item state changes', async () => {
    const onCheckedChange = vi.fn()
    const user = userEvent.setup()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem 
            checked={false} 
            onCheckedChange={onCheckedChange}
          >
            Toggle Option
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await user.click(screen.getByText('Open'))
    await user.click(screen.getByRole('menuitemcheckbox'))
    
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('should handle radio group selection', async () => {
    const onValueChange = vi.fn()
    const user = userEvent.setup()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await user.click(screen.getByText('Open'))
    await user.click(screen.getByRole('menuitemradio', { name: /option 2/i }))
    
    expect(onValueChange).toHaveBeenCalledWith('option2')
  })
})

// Add accessibility tests
describe('Dropdown Menu Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
EOF
```

## File Overview

The Dropdown Menu is a comprehensive UI component built on Radix UI primitives that provides:
- Complete dropdown menu functionality with accessibility support
- Multiple component variants: basic items, checkbox items, radio items, submenus
- Advanced features: labels, separators, shortcuts, groups, and portals
- Custom styling integration with Tailwind CSS classes
- Proper TypeScript support with forwardRef patterns

### Dependencies
- `@radix-ui/react-dropdown-menu` - Base functionality
- `@radix-ui/react-icons` - CheckIcon, ChevronRightIcon, DotFilledIcon
- `../utils` - cn utility for className merging
- React forwardRef for component composition

### Complexity Analysis
- **High**: 206 lines with multiple interconnected components
- **Component Library**: Wrapper around Radix UI primitives
- **TypeScript Heavy**: Complex forwardRef typing patterns
- **Accessibility**: Built-in ARIA support from Radix

## Coverage Analysis

### Current State
- **~45% coverage** - Basic structural tests exist
- **Missing Interactive Testing** - No actual user interaction tests
- **Missing Edge Cases** - Error states and prop variations untested
- **Missing Accessibility Testing** - A11y compliance not verified

### Critical Paths to Test
1. **Component Rendering**:
   - All component variants render correctly
   - Custom props (inset, className) work properly
   - Styling integration with cn utility

2. **Interactive Behavior**:
   - Menu opening/closing with trigger
   - Item selection and callbacks
   - Keyboard navigation support

3. **Component Variants**:
   - Checkbox items with checked states
   - Radio items with value selection
   - Submenu trigger and content
   - Labels, separators, and shortcuts

4. **Accessibility Features**:
   - ARIA attributes and roles
   - Keyboard navigation (Arrow keys, Enter, Escape)
   - Focus management and trap

## Testing Approaches

### Approach 1: Deep Integration Testing with Radix Behavior
**Strategy**: Test complete dropdown behavior including Radix UI integration and real interactions

**Pros**:
- Tests actual user interactions and behavior
- Validates Radix UI integration works correctly
- Tests real accessibility features and keyboard navigation
- Catches integration issues with third-party library

**Cons**:
- Complex setup due to portal rendering and async behavior
- Slower test execution due to user interaction simulation
- May be brittle due to Radix UI implementation details
- Requires advanced testing techniques for portal content

**Test Structure**:
```typescript
describe('Dropdown Menu Integration', () => {
  it('should open menu and select item', async () => {
    const onSelect = jest.fn()
    const user = userEvent.setup()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await user.click(screen.getByText('Open'))
    await user.click(screen.getByText('Item 1'))
    
    expect(onSelect).toHaveBeenCalled()
  })
})
```

### Approach 2: Component Structure Testing with Mocked Radix
**Strategy**: Test component structure and props while mocking Radix UI primitives

**Pros**:
- Fast test execution without complex interactions
- Easy to test all component variants and props
- Simple setup and maintenance
- Focuses on component API rather than third-party behavior

**Cons**:
- Doesn't test actual dropdown behavior
- May miss Radix UI integration issues  
- Doesn't validate accessibility features
- Mock maintenance when Radix updates

**Test Structure**:
```typescript
// Mock Radix UI components
jest.mock('@radix-ui/react-dropdown-menu', () => ({
  Root: ({ children }) => <div data-testid="dropdown-root">{children}</div>,
  Trigger: ({ children, ...props }) => <button {...props}>{children}</button>,
  Content: ({ children, ...props }) => <div {...props}>{children}</div>,
  // ... other mocks
}))

describe('Dropdown Menu Components', () => {
  it('should render with custom className', () => {
    render(<DropdownMenuItem className="custom-class">Item</DropdownMenuItem>)
    expect(screen.getByText('Item')).toHaveClass('custom-class')
  })
})
```

### Approach 3: Layered Testing (Structure + Behavior + Accessibility)
**Strategy**: Multi-layered approach testing components at different levels

**Pros**:
- Comprehensive coverage across all aspects
- Structure tests for component API, behavior tests for interactions
- Accessibility tests for ARIA compliance
- Balanced approach between speed and confidence

**Cons**:
- Most complex test suite organization
- Potential for test duplication across layers
- Higher maintenance overhead
- Requires coordination between test types

**Test Structure**:
```typescript
// Component structure tests
describe('Dropdown Menu Structure', () => {
  it('should render all component variants', () => {
    // Test component rendering
  })
})

// Interactive behavior tests  
describe('Dropdown Menu Behavior', () => {
  it('should handle user interactions', async () => {
    // Test user interactions with real Radix components
  })
})

// Accessibility tests
describe('Dropdown Menu Accessibility', () => {
  it('should meet WCAG standards', async () => {
    // Test keyboard navigation and ARIA attributes
  })
})
```

## Selected Approach: Approach 3 - Layered Testing (Structure + Behavior + Accessibility)

### Justification

**Primary Reasoning**:
Layered testing is optimal for this complex UI component because:

1. **Component Library Nature**: Need to test both our wrapper components and underlying Radix behavior
2. **Accessibility Critical**: Dropdown menus require thorough a11y testing for compliance
3. **User Interaction Heavy**: Must test real user interactions, not just rendering
4. **Comprehensive Coverage**: Need to validate structure, behavior, and accessibility separately
5. **Maintainability**: Organized test layers make it easier to maintain and update

**Supporting Factors**:
- Component is used throughout the application in critical UX flows
- Accessibility compliance is mandatory for dropdown components
- Need confidence in both custom styling and Radix integration

## Implementation Details

### Test Types
- **Structure Tests**: 35% coverage - Component rendering and props
- **Behavior Tests**: 35% coverage - User interactions and state management  
- **Accessibility Tests**: 25% coverage - A11y compliance and keyboard navigation

### Test Scenarios

#### Component Structure Tests
1. **Basic component rendering**
   - Should render all exported components without errors
   - Should apply custom className props correctly
   - Should forward refs to underlying DOM elements

2. **Styling integration**
   - Should merge custom classes with default styles using cn utility
   - Should apply inset prop styling where applicable
   - Should handle conditional styling props

3. **Component composition**
   - Should render nested component structures
   - Should handle Portal rendering for content
   - Should manage sideOffset and positioning props

#### Interactive Behavior Tests
4. **Menu opening/closing**
   - Should open menu when trigger is clicked
   - Should close menu when item is selected
   - Should close menu when clicking outside
   - Should close menu with Escape key

5. **Item selection**
   - Should call onSelect handlers for menu items
   - Should handle checkbox item state changes
   - Should manage radio group selections
   - Should prevent disabled items from being selected

6. **Submenu behavior**
   - Should open submenus on trigger hover/click
   - Should navigate submenu with keyboard
   - Should close parent menu when submenu item selected

#### Keyboard Navigation Tests
7. **Arrow key navigation**
   - Should move focus between items with arrow keys
   - Should loop focus from last to first item
   - Should enter/exit submenus with arrow keys

8. **Keyboard shortcuts**
   - Should activate items with Enter key
   - Should close menu with Escape key
   - Should display keyboard shortcuts correctly

#### Accessibility Tests
9. **ARIA attributes**
   - Should have proper role and aria-* attributes
   - Should announce menu state to screen readers
   - Should maintain proper focus management

10. **Focus management**
    - Should trap focus within open menu
    - Should return focus to trigger when menu closes
    - Should handle focus for disabled items

#### State Management Tests
11. **Checkbox states**
    - Should toggle checked state for checkbox items
    - Should display check icons for checked items
    - Should call onCheckedChange handlers

12. **Radio group states**  
    - Should maintain single selection in radio groups
    - Should display radio indicators for selected items
    - Should call onValueChange handlers

### Technical Requirements

#### Required Packages
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "@testing-library/jest-dom": "^5.16.5",
    "jest-axe": "^8.0.0"
  }
}
```

#### Mock Setup for Isolated Tests
```typescript
// Mock Radix icons for simpler testing
jest.mock('@radix-ui/react-icons', () => ({
  CheckIcon: () => <span data-testid="check-icon">✓</span>,
  ChevronRightIcon: () => <span data-testid="chevron-right">→</span>,
  DotFilledIcon: () => <span data-testid="dot-filled">●</span>
}))

// Mock cn utility for predictable class testing
jest.mock('../utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}))
```

#### Test Data & Fixtures
```typescript
// Menu item fixtures
const menuItems = [
  { id: 'item1', label: 'Item 1', disabled: false },
  { id: 'item2', label: 'Item 2', disabled: true },
  { id: 'item3', label: 'Item 3', disabled: false }
]

// Checkbox item fixtures
const checkboxItems = [
  { id: 'cb1', label: 'Option 1', checked: true },
  { id: 'cb2', label: 'Option 2', checked: false }
]

// Radio group fixture
const radioGroup = {
  value: 'option1',
  options: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]
}
```

### Test Structure
```
packages/ui/src/components/dropdown-menu.test.tsx
├── Component Structure Tests
│   ├── Basic component exports and rendering
│   ├── Custom className and prop handling
│   ├── ForwardRef functionality
│   └── Styling integration with cn utility
├── Interactive Behavior Tests
│   ├── Menu opening and closing
│   ├── Item selection and callbacks
│   ├── Submenu navigation
│   └── State management (checkbox/radio)
├── Keyboard Navigation Tests
│   ├── Arrow key navigation
│   ├── Enter/Escape key handling
│   └── Focus management
└── Accessibility Tests
    ├── ARIA attributes and roles
    ├── Screen reader compatibility
    ├── Keyboard accessibility
    └── Focus trap and management
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Comprehensive dropdown testing patterns can be reused for other UI components
- **Dependencies**: Tests validate integration with Radix UI and icon libraries
- **Performance**: Interactive tests may be slower but provide high confidence

### Execution Approach
1. **Phase 1**: Enhance existing structure tests and add missing component coverage
2. **Phase 2**: Add comprehensive interactive behavior tests with user events
3. **Phase 3**: Implement keyboard navigation and focus management tests
4. **Phase 4**: Add accessibility testing with jest-axe

### Mock Strategies
- **Selective Mocking**: Mock icons for predictable testing, keep Radix components real
- **Utility Mocking**: Mock cn utility for predictable className testing
- **Portal Testing**: Handle Radix Portal rendering in test environment
- **Async Testing**: Use proper async/await for user interactions

### Test Data Approach  
- **Reusable Fixtures**: Create fixtures for common dropdown scenarios
- **State Variations**: Test different checkbox/radio states and combinations
- **Edge Cases**: Include disabled items, empty menus, and error states
- **Accessibility Data**: Test data includes proper labels and ARIA attributes

### Performance Considerations
- **Test Speed**: Balance real interaction testing with fast execution
- **Memory Management**: Clean up event listeners and state between tests
- **Parallel Safety**: Ensure all tests are isolated and can run concurrently

### CI/CD Integration
- **Coverage Requirements**: Enforce 95% coverage due to UI component criticality
- **Accessibility Gates**: Fail builds if a11y tests don't pass
- **Visual Testing**: Consider adding Storybook interaction tests

### Accessibility Testing Strategy
```typescript
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Dropdown Menu Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup()
    
    render(/* dropdown menu */)
    
    const trigger = screen.getByRole('button', { name: /open menu/i })
    await user.click(trigger)
    
    // Test arrow key navigation
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: /item 1/i })).toHaveFocus()
    
    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('menuitem', { name: /item 2/i })).toHaveFocus()
    
    // Test Enter activation
    await user.keyboard('{Enter}')
    // Verify item was activated
  })
})
```

### Interactive Testing Strategy
```typescript
describe('Dropdown Menu Interactions', () => {
  it('should handle checkbox item interactions', async () => {
    const onCheckedChange = jest.fn()
    const user = userEvent.setup()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem 
            checked={false} 
            onCheckedChange={onCheckedChange}
          >
            Toggle Option
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitemcheckbox'))
    
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('should manage radio group selection', async () => {
    const onValueChange = jest.fn()
    const user = userEvent.setup()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="option1" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="option1">Option 1</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">Option 2</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    
    await user.click(screen.getByRole('button'))
    await user.click(screen.getByRole('menuitemradio', { name: /option 2/i }))
    
    expect(onValueChange).toHaveBeenCalledWith('option2')
  })
})
```

### Edge Cases and Error Handling
- **Empty Menus**: Test behavior with no menu items
- **Disabled Items**: Verify disabled items can't be selected
- **Portal Failures**: Handle cases where Portal doesn't render
- **Missing Props**: Test graceful degradation with missing required props
- **Large Menus**: Test performance with many menu items