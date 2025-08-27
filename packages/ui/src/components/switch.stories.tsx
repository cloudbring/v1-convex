import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from '@storybook/test'
import { Switch } from './switch'
import { useState } from 'react'

const onCheckedChange = fn()

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A switch component built on Radix UI for toggling between on and off states with smooth animations.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the switch is checked'
    },
    defaultChecked: {
      control: { type: 'boolean' },
      description: 'Whether the switch is initially checked'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Basic switch
export const Default: Story = {
  args: {
    onCheckedChange
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchElement = canvas.getByRole('switch')
    
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  }
}

// Checked switch
export const Checked: Story = {
  args: {
    checked: true,
    onCheckedChange
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switchElement = canvas.getByRole('switch')
    
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  }
}

// Disabled switches
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch disabled />
        <label className="text-sm">Disabled (unchecked)</label>
      </div>
      <div className="flex items-center gap-2">
        <Switch disabled checked />
        <label className="text-sm">Disabled (checked)</label>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const switches = canvas.getAllByRole('switch')
    
    expect(switches[0]).toBeDisabled()
    expect(switches[1]).toBeDisabled()
    expect(switches[1]).toHaveAttribute('data-state', 'checked')
  }
}

// Interactive example
export const Interactive: Story = {
  render: () => {
    const [checked, setChecked] = useState(false)
    
    return (
      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center gap-2">
          <Switch 
            checked={checked} 
            onCheckedChange={setChecked}
            id="interactive-switch" 
          />
          <label htmlFor="interactive-switch" className="text-sm cursor-pointer">
            Enable notifications
          </label>
        </div>
        <p className="text-sm text-gray-600">
          Switch is currently: {checked ? 'ON' : 'OFF'}
        </p>
      </div>
    )
  }
}

// With labels and descriptions
export const WithLabels: Story = {
  render: () => (
    <div className="flex flex-col gap-6 w-80">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="notifications" className="text-sm font-medium">
            Push Notifications
          </label>
          <p className="text-xs text-gray-500">
            Receive notifications about updates and messages
          </p>
        </div>
        <Switch id="notifications" onCheckedChange={onCheckedChange} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="marketing" className="text-sm font-medium">
            Marketing Emails
          </label>
          <p className="text-xs text-gray-500">
            Get emails about new features and promotions
          </p>
        </div>
        <Switch id="marketing" onCheckedChange={onCheckedChange} />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <label htmlFor="analytics" className="text-sm font-medium">
            Analytics Tracking
          </label>
          <p className="text-xs text-gray-500">
            Help us improve by sharing usage data
          </p>
        </div>
        <Switch id="analytics" defaultChecked onCheckedChange={onCheckedChange} />
      </div>
    </div>
  )
}

// Different sizes (custom styling)
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div className="flex items-center gap-2">
        <Switch className="scale-75" />
        <label className="text-xs">Small</label>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch />
        <label className="text-sm">Default</label>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch className="scale-125" />
        <label className="text-base">Large</label>
      </div>
    </div>
  )
}

// Color variations (using custom CSS)
export const ColorVariations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch defaultChecked className="data-[state=checked]:bg-green-500" />
        <label className="text-sm">Success (Green)</label>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch defaultChecked className="data-[state=checked]:bg-red-500" />
        <label className="text-sm">Danger (Red)</label>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch defaultChecked className="data-[state=checked]:bg-yellow-500" />
        <label className="text-sm">Warning (Yellow)</label>
      </div>
      
      <div className="flex items-center gap-2">
        <Switch defaultChecked className="data-[state=checked]:bg-purple-500" />
        <label className="text-sm">Custom (Purple)</label>
      </div>
    </div>
  )
}