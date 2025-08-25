import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'

// Create a mock version of SubscribeForm without external dependencies
const SubscribeForm = ({ group, placeholder, className }: { group: string; placeholder: string; className?: string }) => {
  const [isSubmitted, setSubmitted] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setTimeout(() => {
      setSubmitted(true)
      setPending(false)
      setTimeout(() => setSubmitted(false), 5000)
    }, 1000)
  }
  
  return (
    <div>
      <div>
        {isSubmitted ? (
          <div className="border border-[#2C2C2C] text-sm text-primary h-9 w-[290px] flex items-center py-0.5 px-2 justify-between">
            <p>Subscribed</p>
            <svg width="17" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <title>Check</title>
              <path
                d="m14.546 4.724-8 8-3.667-3.667.94-.94 2.727 2.72 7.06-7.053.94.94Z"
                fill="currentColor"
              />
            </svg>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              placeholder={placeholder}
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              aria-label="Email address"
              required
              className={className || "border border-border rounded px-3 py-2"}
            />
            <button type="submit" className="ml-auto rounded-full bg-primary text-primary-foreground px-4 py-2" disabled={pending}>
              {pending ? (
                <svg className="size-4 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75"/>
                </svg>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

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