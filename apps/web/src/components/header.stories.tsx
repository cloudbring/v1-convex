import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { vi } from 'vitest'
import { Header } from './header'

// Mock Next.js components for Storybook
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, ...props }: any) => (
    React.createElement('img', { src, alt, width, height, ...props })
  )
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    React.createElement('a', { href, ...props }, children)
  )
}))

// Mock Convex API
vi.mock('@v1/backend/convex/_generated/api', () => ({
  api: {
    web: {
      subscribe: 'mockSubscribeAction'
    }
  }
}))

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useAction: () => vi.fn()
}))

const meta: Meta<typeof Header> = {
  title: 'Web/Components/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'The main header component for the web app featuring the logo, site name, and newsletter subscription dialog.'
      }
    },
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#000000'
        }
      ]
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Default header
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Check for header element
    const header = canvas.getByRole('banner')
    expect(header).toBeInTheDocument()
    expect(header).toHaveClass('absolute top-0 w-full')
    
    // Check for site name (hidden on mobile)
    const siteName = canvas.getByText('convex-v1.run')
    expect(siteName).toBeInTheDocument()
    expect(siteName).toHaveClass('hidden md:block')
    
    // Check for logo link (get the specific one with the logo image)
    const logoLink = canvas.getByRole('link', { name: 'V1 logo' })
    expect(logoLink).toHaveAttribute('href', '/')
    
    // Check for logo image
    const logo = canvas.getByAltText('V1 logo')
    expect(logo).toBeInTheDocument()
  }
}

// Mobile view (simulated)
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    },
    docs: {
      description: {
        story: 'Header on mobile devices where the site name is hidden and only the logo and subscribe button are visible.'
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Site name should be hidden on mobile
    const siteName = canvas.getByText('convex-v1.run')
    expect(siteName).toHaveClass('hidden md:block')
  }
}

// Desktop view
export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop'
    },
    docs: {
      description: {
        story: 'Header on desktop view showing the full site name alongside the logo and subscribe dialog.'
      }
    }
  }
}

// Header elements test
export const HeaderElements: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Test all header elements
    expect(canvas.getByText('convex-v1.run')).toBeInTheDocument()
    expect(canvas.getByAltText('V1 logo')).toBeInTheDocument()
    expect(canvas.getByText('Get updates')).toBeInTheDocument()
    
    // Test dialog trigger - it's a span with dialog trigger attributes
    const subscribeButton = canvas.getByText('Get updates')
    expect(subscribeButton).toHaveAttribute('aria-haspopup', 'dialog')
  }
}

// Logo accessibility
export const LogoAccessibility: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    const logoLink = canvas.getByRole('link', { name: 'V1 logo' })
    const logoImage = canvas.getByAltText('V1 logo')
    
    expect(logoLink).toHaveAttribute('href', '/')
    expect(logoImage).toHaveAttribute('alt', 'V1 logo')
  }
}

// Subscribe dialog
export const SubscribeDialog: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Check for dialog components
    const subscribeButton = canvas.getByText('Get updates')
    expect(subscribeButton).toBeInTheDocument()
    
    // The button should be a span element (DialogTrigger asChild)
    expect(subscribeButton.tagName).toBe('SPAN')
  }
}

// Header positioning
export const HeaderPositioning: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the header\'s absolute positioning and z-index layering.'
      }
    }
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const header = canvas.getByRole('banner')
    
    expect(header).toHaveClass('absolute')
    expect(header).toHaveClass('top-0')
    expect(header).toHaveClass('w-full')
    expect(header).toHaveClass('z-10')
  }
}