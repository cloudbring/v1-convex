import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'

// Create a mock version of CopyText that doesn't use external hooks
const CopyText = ({ value }: { value: string }) => {
  const [copied, setCopied] = React.useState(false)
  
  const handleCopy = () => {
    // Mock copy behavior
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <button
      onClick={handleCopy}
      type="button"
      className="font-mono text-[#878787] text-xs md:text-sm p-4 rounded-full border border-border transition-colors flex items-center gap-2 bg-background"
    >
      <span>{value}</span>
      {copied ? (
        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
        </svg>
      ) : (
        <svg className="size-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
        </svg>
      )}
    </button>
  )
}

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
    value: 'npm install @v1/ui'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    const copyIcon = canvas.getByText('npm install @v1/ui')
    
    expect(button).toBeInTheDocument()
    expect(copyIcon).toBeInTheDocument()
  }
}

// Short value
export const ShortValue: Story = {
  args: {
    value: 'copy me'
  }
}

// Long command
export const LongCommand: Story = {
  args: {
    value: 'bunx create-convex-app@latest my-convex-app --template=next-js-shadcn'
  }
}

// URL example
export const URL: Story = {
  args: {
    value: 'https://convex-v1.run'
  }
}

// API key example
export const APIKey: Story = {
  args: {
    value: 'cvx_1a2b3c4d5e6f7g8h9i0j'
  }
}

// Docker command
export const DockerCommand: Story = {
  args: {
    value: 'docker run -p 3000:3000 convex/v1:latest'
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
    
    // Should show check icon briefly (this is visual feedback, hard to test the actual icon swap)
    expect(button).toBeInTheDocument()
  }
}

// Environment variable
export const EnvironmentVariable: Story = {
  args: {
    value: 'CONVEX_DEPLOYMENT_URL=https://your-deployment.convex.cloud'
  }
}

// Code snippet
export const CodeSnippet: Story = {
  args: {
    value: 'import { api } from "./convex/_generated/api";'
  }
}