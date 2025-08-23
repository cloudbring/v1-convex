import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Input } from './input'
import { fn } from '@storybook/test'
import { useState } from 'react'

const onChange = fn()
const onFocus = fn()
const onBlur = fn()

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with consistent styling and accessibility features.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      description: 'HTML input type'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled'
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required'
    },
    onChange: { action: 'changed' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' }
  },
  args: {
    onChange,
    onFocus,
    onBlur
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...'
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Enter text...')
    
    // Test typing
    await userEvent.type(input, 'Hello World')
    expect(input).toHaveValue('Hello World')
    expect(args.onChange).toHaveBeenCalled()
  }
}

// Email input
export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...'
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    expect(input).toHaveAttribute('type', 'email')
    
    await userEvent.type(input, 'user@example.com')
    expect(input).toHaveValue('user@example.com')
  }
}

// Password input
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password...'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByPlaceholderText('Enter your password...')
    
    expect(input).toHaveAttribute('type', 'password')
    
    await userEvent.type(input, 'secretpassword')
    expect(input).toHaveValue('secretpassword')
  }
}

// Number input
export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number...',
    min: 0,
    max: 100
  }
}

// Search input
export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...'
  }
}

// Disabled input
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    value: 'Cannot edit this'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed')
    
    // Verify that typing doesn't work when disabled
    await userEvent.type(input, 'Should not work')
    expect(input).toHaveValue('Cannot edit this')
  }
}

// Required input
export const Required: Story = {
  args: {
    placeholder: 'Required field',
    required: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    expect(input).toBeRequired()
  }
}

// With value
export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
    placeholder: 'This won\'t show'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    expect(input).toHaveValue('Pre-filled value')
  }
}

// Focus and blur events
export const FocusEvents: Story = {
  args: {
    placeholder: 'Focus and blur me'
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    
    await userEvent.click(input)
    expect(args.onFocus).toHaveBeenCalled()
    
    await userEvent.tab()
    expect(args.onBlur).toHaveBeenCalled()
  }
}

// File input
export const File: Story = {
  args: {
    type: 'file',
    accept: '.txt,.pdf,.doc,.docx'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('button', { name: /choose file|browse/i }) || 
                  canvas.getByDisplayValue('') // File inputs can be tricky to query
    
    expect(input).toBeInTheDocument()
  }
}

// Custom styling example
export const CustomStyling: Story = {
  args: {
    placeholder: 'Custom styled input',
    className: 'border-purple-300 focus-visible:ring-purple-500'
  }
}

// Controlled input example
export const ControlledInput: Story = {
  render: () => {
    const [value, setValue] = useState('')
    
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type to see controlled behavior"
        />
        <p className="text-sm text-muted-foreground">
          Current value: "{value}"
        </p>
      </div>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    const valueDisplay = canvas.getByText(/Current value:/)
    
    await userEvent.type(input, 'Test')
    expect(valueDisplay).toHaveTextContent('Current value: "Test"')
  }
}

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <div className="space-y-2">
      <label htmlFor="accessible-input" className="text-sm font-medium">
        Accessible Input Label
      </label>
      <Input
        id="accessible-input"
        placeholder="Enter your name"
        aria-describedby="input-help"
        required
      />
      <p id="input-help" className="text-sm text-muted-foreground">
        This field is required and must contain your full name
      </p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('textbox')
    const label = canvas.getByText('Accessible Input Label')
    
    expect(input).toHaveAttribute('id', 'accessible-input')
    expect(input).toHaveAttribute('aria-describedby', 'input-help')
    expect(input).toBeRequired()
    expect(label).toHaveAttribute('for', 'accessible-input')
  }
}

// All input types showcase
export const AllTypes: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-96">
      <Input type="text" placeholder="Text" />
      <Input type="email" placeholder="Email" />
      <Input type="password" placeholder="Password" />
      <Input type="number" placeholder="Number" />
      <Input type="search" placeholder="Search" />
      <Input type="tel" placeholder="Phone" />
      <Input type="url" placeholder="URL" />
      <Input type="date" />
    </div>
  ),
  parameters: {
    layout: 'padded'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const inputs = canvas.getAllByRole('textbox')
    
    // Should have multiple inputs rendered
    expect(inputs.length).toBeGreaterThan(3)
  }
}