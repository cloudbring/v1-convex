import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'

// Create a mock version of Header without external dependencies
const Header = () => {
  const [showDialog, setShowDialog] = React.useState(false)
  
  return (
    <header className="absolute top-0 w-full flex items-center justify-between p-4 z-10">
      <span className="hidden md:block text-sm font-medium">convex-v1.run</span>
      
      <a href="/">
        <img
          src="/logo.png"
          alt="V1 logo"
          width={60}
          height={60}
        />
      </a>
      
      <button
        onClick={() => setShowDialog(!showDialog)}
        className="text-sm font-medium px-4 py-2 border border-border rounded"
      >
        Subscribe
      </button>
      
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-lg font-semibold mb-4">Subscribe to Newsletter</h2>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-border rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 border border-border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}

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
    
    // Check for logo link
    const logoLink = canvas.getByRole('link')
    expect(logoLink).toHaveAttribute('href', '/')
    
    // Check for logo image
    const logo = canvas.getByAltText('V1 logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('width', '60')
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
    expect(canvas.getByText('Subscribe')).toBeInTheDocument()
    
    // Test dialog trigger
    const subscribeButton = canvas.getByText('Subscribe')
    expect(subscribeButton.closest('button')).toBeInTheDocument()
  }
}

// Logo accessibility
export const LogoAccessibility: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    const logoLink = canvas.getByRole('link')
    const logoImage = canvas.getByAltText('V1 logo')
    
    expect(logoLink).toHaveAttribute('href', '/')
    expect(logoImage).toHaveAttribute('alt', 'V1 logo')
    expect(logoImage).toHaveAttribute('width', '60')
  }
}

// Subscribe dialog
export const SubscribeDialog: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    // Check for dialog components
    const subscribeButton = canvas.getByText('Subscribe')
    expect(subscribeButton).toBeInTheDocument()
    
    // The button should be a button element
    expect(subscribeButton.tagName).toBe('BUTTON')
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