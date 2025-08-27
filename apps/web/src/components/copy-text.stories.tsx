import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'
import { vi } from 'vitest'
import { CopyText } from './copy-text'

// Mock usehooks-ts for Storybook
vi.mock('usehooks-ts', () => ({
  useCopyToClipboard: () => [null, fn()]
}))

const meta: Meta<typeof CopyText> = {
  title: 'Web/Components/CopyText',
  component: CopyText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A copy-to-clipboard button component that shows the value and provides visual feedback when copied.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'The text value to copy to clipboard'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default copy text
export const Default: Story = {
  args: {
    value: 'hello@convex-v1.run'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    const copyText = canvas.getByText('hello@convex-v1.run')
    
    expect(button).toBeInTheDocument()
    expect(copyText).toBeInTheDocument()
  }
}

// Short value
export const ShortValue: Story = {
  args: {
    value: 'copy me'
  }
}

// URL example
export const URL: Story = {
  args: {
    value: 'https://convex-v1.run'
  }
}

// Email address
export const EmailAddress: Story = {
  args: {
    value: 'support@convex-v1.run'
  }
}

// Reference ID
export const ReferenceID: Story = {
  args: {
    value: 'REF-12345-ABCD'
  }
}

// Interactive copy behavior
export const InteractiveCopy: Story = {
  args: {
    value: 'Click to copy this text'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    // Click to copy
    await userEvent.click(button)
    
    // Button should still be there after click
    expect(button).toBeInTheDocument()
  }
}

// Long URL
export const LongURL: Story = {
  args: {
    value: 'https://convex-v1.run/dashboard/settings/billing?plan=pro&period=monthly'
  }
}

// Verification code
export const VerificationCode: Story = {
  args: {
    value: 'VERIFY-789123'
  }
}

// Share link
export const ShareLink: Story = {
  args: {
    value: 'https://convex-v1.run/share/abc123xyz'
  }
}