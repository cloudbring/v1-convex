import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'
import { vi } from 'vitest'
import { SubscribeForm } from './subscribe-form'

// Mock Convex hooks for Storybook
vi.mock('convex/react', () => ({
  useAction: () => fn()
}))

// Mock useFormStatus from react-dom for Storybook  
vi.mock('react-dom', () => ({
  useFormStatus: () => ({ pending: false })
}))

const meta: Meta<typeof SubscribeForm> = {
  title: 'Web/Components/SubscribeForm',
  component: SubscribeForm,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A newsletter subscription form component with email input and submit functionality, featuring a success state with visual feedback.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    group: {
      control: { type: 'text' },
      description: 'The user group identifier for the subscription'
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the email input'
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for styling'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default subscribe form
export const Default: Story = {
  args: {
    group: 'newsletter',
    placeholder: 'Enter your email address'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByPlaceholderText('Enter your email address')
    const submitButton = canvas.getByRole('button', { name: /subscribe/i })
    
    expect(emailInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
  }
}

// Marketing newsletter
export const MarketingNewsletter: Story = {
  args: {
    group: 'marketing',
    placeholder: 'Get product updates and news'
  }
}

// Developer newsletter
export const DeveloperNewsletter: Story = {
  args: {
    group: 'developers',
    placeholder: 'Stay updated with developer resources'
  }
}

// Beta updates
export const BetaUpdates: Story = {
  args: {
    group: 'beta',
    placeholder: 'Be the first to try new features'
  }
}

// Custom styled form
export const CustomStyled: Story = {
  args: {
    group: 'custom',
    placeholder: 'Your email here...',
    className: 'rounded-lg border-2 border-blue-500'
  }
}

// Long placeholder
export const LongPlaceholder: Story = {
  args: {
    group: 'newsletter',
    placeholder: 'Enter your email to receive weekly updates about our platform'
  }
}

// Interactive form submission
export const InteractiveSubmission: Story = {
  args: {
    group: 'newsletter',
    placeholder: 'test@example.com'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByPlaceholderText('test@example.com')
    const submitButton = canvas.getByRole('button', { name: /subscribe/i })
    
    // Fill in email
    await userEvent.type(emailInput, 'user@example.com')
    expect(emailInput).toHaveValue('user@example.com')
    
    // Form should be ready to submit
    expect(submitButton).toBeEnabled()
  }
}

// Form validation
export const FormValidation: Story = {
  args: {
    group: 'newsletter',
    placeholder: 'Enter valid email'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByPlaceholderText('Enter valid email')
    
    // Input should have email validation
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('autoComplete', 'email')
    expect(emailInput).toHaveAttribute('aria-label', 'Email address')
  }
}

// Accessibility features
export const AccessibilityFeatures: Story = {
  args: {
    group: 'newsletter',
    placeholder: 'Enter your email'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emailInput = canvas.getByLabelText('Email address')
    const submitButton = canvas.getByRole('button', { name: /subscribe/i })
    
    // Check accessibility attributes
    expect(emailInput).toHaveAttribute('aria-label', 'Email address')
    expect(emailInput).toHaveAttribute('name', 'email')
    expect(emailInput).toHaveAttribute('id', 'email')
    expect(submitButton).toHaveAttribute('type', 'submit')
  }
}

// Compact form
export const CompactForm: Story = {
  args: {
    group: 'compact',
    placeholder: 'Email',
    className: 'h-8 text-sm'
  }
}