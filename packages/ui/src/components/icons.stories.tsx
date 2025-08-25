import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { Icons } from './icons'

const meta: Meta<typeof Icons> = {
  title: 'Components/Icons',
  component: () => null, // This is a collection, not a single component
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A collection of Lucide React icons used throughout the application. Provides consistent iconography and easy access to commonly used icons.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// All available icons showcase
export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-8 p-4">
      <div className="flex flex-col items-center gap-2">
        <Icons.SignOut className="w-8 h-8" />
        <span className="text-sm font-medium">SignOut</span>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">Icons.SignOut</code>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Icons.Copy className="w-8 h-8" />
        <span className="text-sm font-medium">Copy</span>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">Icons.Copy</code>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Icons.Check className="w-8 h-8" />
        <span className="text-sm font-medium">Check</span>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">Icons.Check</code>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <Icons.Loader className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">Loader</span>
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">Icons.Loader</code>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    expect(canvas.getByText('SignOut')).toBeInTheDocument()
    expect(canvas.getByText('Copy')).toBeInTheDocument()
    expect(canvas.getByText('Check')).toBeInTheDocument()
    expect(canvas.getByText('Loader')).toBeInTheDocument()
  }
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold">Small (16px)</h3>
        <div className="flex gap-4 items-center">
          <Icons.SignOut className="w-4 h-4" />
          <Icons.Copy className="w-4 h-4" />
          <Icons.Check className="w-4 h-4" />
          <Icons.Loader className="w-4 h-4" />
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-semibold">Default (24px)</h3>
        <div className="flex gap-4 items-center">
          <Icons.SignOut className="w-6 h-6" />
          <Icons.Copy className="w-6 h-6" />
          <Icons.Check className="w-6 h-6" />
          <Icons.Loader className="w-6 h-6" />
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-semibold">Large (32px)</h3>
        <div className="flex gap-4 items-center">
          <Icons.SignOut className="w-8 h-8" />
          <Icons.Copy className="w-8 h-8" />
          <Icons.Check className="w-8 h-8" />
          <Icons.Loader className="w-8 h-8" />
        </div>
      </div>
      
      <div>
        <h3 className="mb-4 text-sm font-semibold">Extra Large (48px)</h3>
        <div className="flex gap-4 items-center">
          <Icons.SignOut className="w-12 h-12" />
          <Icons.Copy className="w-12 h-12" />
          <Icons.Check className="w-12 h-12" />
          <Icons.Loader className="w-12 h-12" />
        </div>
      </div>
    </div>
  )
}

// Color variations
export const Colors: Story = {
  render: () => (
    <div className="grid grid-cols-5 gap-4">
      <div className="flex flex-col gap-2 items-center">
        <Icons.Check className="w-8 h-8 text-gray-900" />
        <span className="text-xs">Default</span>
      </div>
      
      <div className="flex flex-col gap-2 items-center">
        <Icons.Check className="w-8 h-8 text-blue-600" />
        <span className="text-xs">Primary</span>
      </div>
      
      <div className="flex flex-col gap-2 items-center">
        <Icons.Check className="w-8 h-8 text-green-600" />
        <span className="text-xs">Success</span>
      </div>
      
      <div className="flex flex-col gap-2 items-center">
        <Icons.Check className="w-8 h-8 text-red-600" />
        <span className="text-xs">Danger</span>
      </div>
      
      <div className="flex flex-col gap-2 items-center">
        <Icons.Check className="w-8 h-8 text-yellow-600" />
        <span className="text-xs">Warning</span>
      </div>
    </div>
  )
}

// Usage examples
export const UsageExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold">In Buttons</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Icons.Copy className="w-4 h-4" />
            Copy
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            <Icons.Check className="w-4 h-4" />
            Confirm
          </button>
          
          <button className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            <Icons.SignOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
      
      <div>
        <h3 className="mb-3 text-sm font-semibold">Loading States</h3>
        <div className="flex gap-4 items-center">
          <button className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded" disabled>
            <Icons.Loader className="w-4 h-4 animate-spin" />
            Loading...
          </button>
          
          <div className="flex items-center gap-2 text-sm">
            <Icons.Loader className="w-4 h-4 animate-spin text-blue-600" />
            Processing request...
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="mb-3 text-sm font-semibold">Status Indicators</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Icons.Check className="w-4 h-4 text-green-600" />
            <span>Task completed successfully</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Icons.Copy className="w-4 h-4 text-blue-600" />
            <span>Content copied to clipboard</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Icons.SignOut className="w-4 h-4 text-red-600" />
            <span>User signed out</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Interactive states
export const InteractiveStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold">Hover Effects</h3>
        <div className="flex gap-2">
          <Icons.Copy className="w-8 h-8 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" />
          <Icons.Check className="w-8 h-8 text-gray-600 hover:text-green-600 cursor-pointer transition-colors" />
          <Icons.SignOut className="w-8 h-8 text-gray-600 hover:text-red-600 cursor-pointer transition-colors" />
        </div>
      </div>
      
      <div>
        <h3 className="mb-3 text-sm font-semibold">Scale on Hover</h3>
        <div className="flex gap-2">
          <Icons.Copy className="w-8 h-8 text-blue-600 cursor-pointer transition-transform hover:scale-110" />
          <Icons.Check className="w-8 h-8 text-green-600 cursor-pointer transition-transform hover:scale-110" />
          <Icons.SignOut className="w-8 h-8 text-red-600 cursor-pointer transition-transform hover:scale-110" />
        </div>
      </div>
      
      <div>
        <h3 className="mb-3 text-sm font-semibold">Animated Loader</h3>
        <div className="flex gap-4 items-center">
          <Icons.Loader className="w-6 h-6 animate-spin text-blue-600" />
          <Icons.Loader className="w-8 h-8 animate-spin text-green-600" />
          <Icons.Loader className="w-10 h-10 animate-spin text-purple-600" />
        </div>
      </div>
    </div>
  )
}

// Icon grid with labels
export const IconGrid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 max-w-md">
      {Object.entries(Icons).map(([name, IconComponent]) => (
        <div key={name} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50">
          <IconComponent className="w-6 h-6 text-gray-700" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            <code className="text-xs text-gray-500">Icons.{name}</code>
          </div>
        </div>
      ))}
    </div>
  )
}