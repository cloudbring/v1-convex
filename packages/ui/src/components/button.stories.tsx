import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from 'storybook/internal/test'
import { Button } from './button'

// Mock function for click events
const onClick = fn()

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes based on Radix UI Slot and class-variance-authority.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Visual style variant of the button'
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Size of the button'
    },
    asChild: {
      control: { type: 'boolean' },
      description: 'When true, the button will render as a Slot component'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled'
    },
    onClick: { action: 'clicked' }
  },
  args: {
    onClick
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Primary button story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default'
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    // Test that button is rendered
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Button')
    
    // Test click interaction
    await userEvent.click(button)
    expect(args.onClick).toHaveBeenCalled()
  }
}

// Destructive variant
export const Destructive: Story = {
  args: {
    children: 'Delete',
    variant: 'destructive'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-destructive')
  }
}

// Outline variant
export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline'
  }
}

// Secondary variant
export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary'
  }
}

// Ghost variant
export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost'
  }
}

// Link variant
export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link'
  }
}

// Small size
export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm'
  }
}

// Large size
export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg'
  }
}

// Icon size
export const Icon: Story = {
  args: {
    children: '🚀',
    size: 'icon'
  }
}

// Disabled state
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none')
  }
}

// Loading state example
export const Loading: Story = {
  args: {
    children: (
      <>
        <span className="animate-spin mr-2">⚪</span>
        Loading...
      </>
    ),
    disabled: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Loading...')
  }
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const buttons = canvas.getAllByRole('button')
    
    expect(buttons).toHaveLength(6)
    
    // Test each variant exists
    expect(canvas.getByText('Default')).toBeInTheDocument()
    expect(canvas.getByText('Destructive')).toBeInTheDocument()
    expect(canvas.getByText('Outline')).toBeInTheDocument()
    expect(canvas.getByText('Secondary')).toBeInTheDocument()
    expect(canvas.getByText('Ghost')).toBeInTheDocument()
    expect(canvas.getByText('Link')).toBeInTheDocument()
  }
}

// All sizes showcase
export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🎯</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const buttons = canvas.getAllByRole('button')
    
    expect(buttons).toHaveLength(4)
  }
}

// Accessibility test
export const AccessibilityTest: Story = {
  args: {
    children: 'Accessible Button',
    'aria-label': 'This is an accessible button',
    'aria-describedby': 'button-description'
  },
  render: (args) => (
    <div>
      <Button {...args} />
      <div id="button-description" className="sr-only">
        This button demonstrates accessibility features
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    expect(button).toHaveAttribute('aria-label', 'This is an accessible button')
    expect(button).toHaveAttribute('aria-describedby', 'button-description')
  }
}