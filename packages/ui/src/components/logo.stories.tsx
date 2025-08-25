import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { Logo } from './logo'

const meta: Meta<typeof Logo> = {
  title: 'Components/Logo',
  component: Logo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A scalable SVG logo component with customizable dimensions and styling. Represents the brand identity across the application.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: { type: 'number', min: 16, max: 200 },
      description: 'Width of the logo in pixels'
    },
    height: {
      control: { type: 'number', min: 16, max: 200 },
      description: 'Height of the logo in pixels'
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes to apply'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Default logo
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const logo = canvasElement.querySelector('svg')
    
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('width', '40')
    expect(logo).toHaveAttribute('height', '40')
  }
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8">
      <div className="flex flex-col items-center gap-2">
        <Logo width={24} height={24} />
        <span className="text-xs text-gray-500">Small (24px)</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo width={40} height={40} />
        <span className="text-xs text-gray-500">Default (40px)</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo width={64} height={64} />
        <span className="text-xs text-gray-500">Large (64px)</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo width={96} height={96} />
        <span className="text-xs text-gray-500">Extra Large (96px)</span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const logos = canvasElement.querySelectorAll('svg')
    
    expect(logos).toHaveLength(4)
    expect(logos[0]).toHaveAttribute('width', '24')
    expect(logos[1]).toHaveAttribute('width', '40')
    expect(logos[2]).toHaveAttribute('width', '64')
    expect(logos[3]).toHaveAttribute('width', '96')
  }
}

// Custom dimensions
export const CustomDimensions: Story = {
  args: {
    width: 80,
    height: 32
  },
  render: (args) => (
    <div className="flex flex-col items-center gap-2">
      <Logo {...args} />
      <span className="text-xs text-gray-500">
        {args.width}x{args.height}px (Wide format)
      </span>
    </div>
  )
}

// Color variations
export const ColorVariations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8 items-center">
      <div className="flex flex-col items-center gap-2">
        <Logo className="text-blue-600" />
        <span className="text-xs text-gray-500">Blue</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="text-green-600" />
        <span className="text-xs text-gray-500">Green</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="text-red-600" />
        <span className="text-xs text-gray-500">Red</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="text-purple-600" />
        <span className="text-xs text-gray-500">Purple</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="text-gray-400" />
        <span className="text-xs text-gray-500">Gray</span>
      </div>
    </div>
  )
}

// On different backgrounds
export const OnDifferentBackgrounds: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="bg-white p-4 rounded border flex flex-col items-center gap-2">
        <Logo className="text-gray-900" />
        <span className="text-xs text-gray-500">Light background</span>
      </div>
      
      <div className="bg-gray-900 p-4 rounded flex flex-col items-center gap-2">
        <Logo className="text-white" />
        <span className="text-xs text-gray-300">Dark background</span>
      </div>
      
      <div className="bg-blue-600 p-4 rounded flex flex-col items-center gap-2">
        <Logo className="text-white" />
        <span className="text-xs text-blue-100">Colored background</span>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded flex flex-col items-center gap-2">
        <Logo className="text-white" />
        <span className="text-xs text-purple-100">Gradient background</span>
      </div>
    </div>
  )
}

// With hover effects
export const WithHoverEffects: Story = {
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <Logo className="transition-transform hover:scale-110 cursor-pointer" />
        <span className="text-xs text-gray-500">Scale on hover</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="transition-colors hover:text-blue-600 cursor-pointer" />
        <span className="text-xs text-gray-500">Color change</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="transition-all hover:rotate-12 hover:scale-105 cursor-pointer" />
        <span className="text-xs text-gray-500">Rotate & scale</span>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Logo className="transition-opacity hover:opacity-70 cursor-pointer" />
        <span className="text-xs text-gray-500">Opacity change</span>
      </div>
    </div>
  )
}

// In navigation context
export const InNavigation: Story = {
  render: () => (
    <div className="bg-gray-50 p-4 rounded">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo width={32} height={32} className="text-blue-600" />
          <span className="font-semibold text-gray-900">Brand Name</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-600 hover:text-gray-900">Home</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
        </div>
      </nav>
    </div>
  )
}

// Accessibility features
export const Accessibility: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Logo 
          width={40} 
          height={40} 
          aria-label="Company logo"
          role="img"
        />
        <span className="text-sm">Logo with aria-label</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Logo 
          width={40} 
          height={40} 
          title="Brand Identity Logo"
        />
        <span className="text-sm">Logo with title attribute</span>
      </div>
    </div>
  )
}