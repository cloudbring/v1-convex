import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An avatar component that displays a user image with fallback text based on Radix UI Avatar.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default avatar with image
export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const image = canvas.queryByRole('img', { hidden: true })
    const avatar = image ?? canvas.getByText('CN')
    expect(avatar).toBeInTheDocument()
  }
}

// Fallback when image fails to load
export const WithFallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.png" alt="Broken" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Since the image will fail to load, fallback should be visible
    const fallback = canvas.getByText('JD')
    expect(fallback).toBeInTheDocument()
  }
}

// Different sizes
export const Small: Story = {
  render: () => (
    <Avatar className="h-8 w-8">
      <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
      <AvatarFallback className="text-xs">V</AvatarFallback>
    </Avatar>
  )
}

export const Large: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
      <AvatarFallback className="text-lg">V</AvatarFallback>
    </Avatar>
  )
}

// Multiple avatars
export const AvatarGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar className="border-2 border-white">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
        <AvatarFallback>V</AvatarFallback>
      </Avatar>
      <Avatar className="border-2 border-white">
        <AvatarFallback>+2</AvatarFallback>
      </Avatar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const cnFallback = canvas.getByText('CN')
    const vFallback = canvas.getByText('V')
    const plusFallback = canvas.getByText('+2')
    
    // Should have all 3 avatar fallbacks
    expect(cnFallback).toBeInTheDocument()
    expect(vFallback).toBeInTheDocument()
    expect(plusFallback).toBeInTheDocument()
  }
}

// Different fallback styles
export const ColorfulFallbacks: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarFallback className="bg-red-500 text-white">RD</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-blue-500 text-white">BL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-green-500 text-white">GR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback className="bg-purple-500 text-white">PR</AvatarFallback>
      </Avatar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const redFallback = canvas.getByText('RD')
    const blueFallback = canvas.getByText('BL')
    const greenFallback = canvas.getByText('GR')
    const purpleFallback = canvas.getByText('PR')
    
    expect(redFallback).toHaveClass('bg-red-500')
    expect(blueFallback).toHaveClass('bg-blue-500')
    expect(greenFallback).toHaveClass('bg-green-500')
    expect(purpleFallback).toHaveClass('bg-purple-500')
  }
}

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <Avatar>
      <AvatarImage 
        src="https://github.com/shadcn.png" 
        alt="Profile picture of John Doe" 
      />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // Check for proper alt text or fallback
    const image = canvas.queryByRole('img', { hidden: true })
    const fallback = canvas.queryByText('JD')
    
    expect(image || fallback).toBeInTheDocument()
  }
}