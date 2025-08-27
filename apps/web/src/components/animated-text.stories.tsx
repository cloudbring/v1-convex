import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { AnimatedText } from './animated-text'

const meta: Meta<typeof AnimatedText> = {
  title: 'Web/Components/AnimatedText',
  component: AnimatedText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An animated text component that creates a typewriter effect by first showing random characters then revealing the final text.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: { type: 'text' },
      description: 'The final text to be revealed after animation'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default animated text
export const Default: Story = {
  args: {
    text: 'Welcome to Convex V1'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const container = canvas.getByRole('generic')
    
    expect(container).toBeInTheDocument()
    expect(container).toHaveClass('relative inline-block')
  }
}

// Short text
export const ShortText: Story = {
  args: {
    text: 'Hello!'
  }
}

// Long text
export const LongText: Story = {
  args: {
    text: 'Building the future of real-time applications with Convex'
  }
}

// Technical term
export const TechnicalTerm: Story = {
  args: {
    text: 'Real-time Database'
  }
}

// Brand name
export const BrandName: Story = {
  args: {
    text: 'Convex'
  }
}

// Call to action
export const CallToAction: Story = {
  args: {
    text: 'Get Started Today'
  }
}

// With numbers
export const WithNumbers: Story = {
  args: {
    text: 'Version 1.0.0'
  }
}

// Special characters
export const WithSpecialChars: Story = {
  args: {
    text: 'React + TypeScript + Convex'
  }
}

// Single word
export const SingleWord: Story = {
  args: {
    text: 'Innovation'
  }
}

// Empty text (edge case)
export const EmptyText: Story = {
  args: {
    text: ''
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const textElement = canvas.getByRole('generic')
    
    expect(textElement).toBeInTheDocument()
  }
}

// Animation showcase
export const AnimationShowcase: Story = {
  args: {
    text: 'Watch the magic happen!'
  },
  parameters: {
    docs: {
      description: {
        story: 'This story showcases the full animation effect. The text starts with random characters and gradually reveals the final message.'
      }
    }
  }
}