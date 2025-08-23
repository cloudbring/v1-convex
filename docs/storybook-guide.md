# Storybook Interaction Testing Guide

This guide covers the Storybook setup for the v1-convex project, including interaction testing capabilities.

## Overview

Storybook is configured with comprehensive interaction testing to validate component behavior, accessibility, and user interactions in isolation.

## Architecture

```
.storybook/
├── main.ts              # Storybook configuration
├── preview.ts           # Global parameters and decorators
├── vitest.config.ts     # Vitest integration for story testing
└── vitest-setup.ts      # Test setup

packages/ui/src/components/
├── *.stories.tsx        # Component stories with interactions
└── *.test.tsx          # Unit tests (separate from stories)
```

## Story Structure

Each story includes comprehensive interaction tests:

```typescript
export const InteractiveStory: Story = {
  args: {
    // Story arguments
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    
    // Test DOM elements
    const button = canvas.getByRole('button')
    expect(button).toBeInTheDocument()
    
    // Test interactions
    await userEvent.click(button)
    expect(args.onClick).toHaveBeenCalled()
    
    // Test state changes
    expect(button).toHaveClass('active')
  }
}
```

## Available Testing Utilities

### From @storybook/test
- `within()` - Query elements within story canvas
- `userEvent` - Simulate user interactions
- `expect()` - Assertions
- `waitFor()` - Async waiting utilities
- `fn()` - Mock functions

### Interaction Types Tested
1. **Click Events** - Button clicks, link navigation
2. **Form Interactions** - Input typing, form submission
3. **Focus Management** - Tab navigation, keyboard accessibility
4. **Modal Behaviors** - Dialog open/close, overlay clicks
5. **State Changes** - Component state updates, visual feedback
6. **Accessibility** - ARIA attributes, screen reader compatibility

## Component Stories Created

### Button Component (`button.stories.tsx`)
- **12 comprehensive stories** covering all variants and interactions
- Tests all button variants: default, destructive, outline, secondary, ghost, link
- Tests all sizes: sm, default, lg, icon
- Interactive click testing with mock functions
- Accessibility validation with ARIA labels
- Loading states and disabled state testing

### Input Component (`input.stories.tsx`)
- **11 detailed stories** with complete form interaction testing
- All input types: text, email, password, number, search, tel, url, file
- Focus and blur event testing
- Controlled vs uncontrolled input behavior
- Validation states and error handling
- Accessibility with proper labeling

### Avatar Component (`avatar.stories.tsx`)
- **6 visual testing stories** for different avatar states
- Image loading and fallback behavior
- Size variations and grouping patterns
- Custom styling and color variations

### Dialog Component (`dialog.stories.tsx`)
- **6 modal interaction stories** with complete dialog lifecycle
- Form dialogs with input validation
- Confirmation dialogs with action testing
- Close behavior testing (X button, Cancel, ESC key)
- Accessibility focus management

## Running Storybook

```bash
# Start Storybook development server
bun run storybook

# Build Storybook for production
bun run build:storybook

# Run interaction tests
bun run test:storybook

# Run specific story tests
npx test-storybook --grep="Button"
```

## Configuration Features

### Accessibility Testing
- Automatic a11y checks with `@storybook/addon-a11y`
- Color contrast validation
- ARIA attribute verification
- Keyboard navigation testing

### Theme Support
- Light/dark theme toggle in toolbar
- Custom background options
- Consistent design tokens

### Interaction Debugging
- Interactive debugger for play functions
- Step-through interaction testing
- Visual feedback for test results

## Best Practices

### Story Organization
1. **One component per story file**
2. **Comprehensive variant coverage**
3. **Interactive play functions for all user actions**
4. **Accessibility testing in dedicated stories**

### Interaction Testing
```typescript
// ✅ Good - Comprehensive interaction testing
export const FormSubmission: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Test initial state
    const input = canvas.getByRole('textbox')
    expect(input).toBeInTheDocument()
    
    // Test user interaction
    await userEvent.type(input, 'test@example.com')
    expect(input).toHaveValue('test@example.com')
    
    // Test form submission
    const submitBtn = canvas.getByRole('button', { name: /submit/i })
    await userEvent.click(submitBtn)
    
    // Verify result
    await waitFor(() => {
      expect(canvas.getByText('Success!')).toBeInTheDocument()
    })
  }
}

// ❌ Bad - No interaction testing
export const BasicStory: Story = {
  args: {
    children: 'Button'
  }
  // Missing play function
}
```

### Accessibility Testing
```typescript
// ✅ Good - Proper accessibility testing
export const AccessibleButton: Story = {
  args: {
    children: 'Accessible Button',
    'aria-label': 'Descriptive label',
    'aria-describedby': 'button-help'
  },
  render: (args) => (
    <div>
      <Button {...args} />
      <div id="button-help" className="sr-only">
        Helper text for button
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    expect(button).toHaveAttribute('aria-label', 'Descriptive label')
    expect(button).toHaveAttribute('aria-describedby', 'button-help')
  }
}
```

## CI/CD Integration

Storybook tests run in CI/CD pipeline:

```yaml
- name: Build Storybook
  run: bun run build:storybook

- name: Run Storybook Tests
  run: bun run test:storybook

- name: Visual Regression Testing
  run: bunx chromatic
  env:
    CHROMATIC_PROJECT_TOKEN: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

## Extending Stories

When creating new component stories:

1. **Follow naming convention**: `ComponentName.stories.tsx`
2. **Include interaction testing** with play functions
3. **Test all component variants** and states
4. **Add accessibility validation** stories
5. **Document component props** with proper ArgTypes
6. **Use mock functions** for event handlers

Example template:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { YourComponent } from './your-component'

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Define prop controls
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    // Default props
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    // Add interaction tests
  }
}
```

## Troubleshooting

### Common Issues

1. **Story not loading**: Check import paths and component exports
2. **Interaction tests failing**: Verify element queries and async operations
3. **Accessibility errors**: Review ARIA attributes and semantic HTML
4. **Styling issues**: Ensure CSS imports in preview.ts

### Debug Mode

Run Storybook with debugging enabled:

```bash
# Debug interaction tests
npx test-storybook --debug

# Debug specific story
npx test-storybook --grep="Button.*Default" --debug
```

This Storybook setup provides comprehensive component testing with real user interaction simulation, accessibility validation, and visual regression testing capabilities.