import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from './tooltip'
import { Button } from './button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A tooltip component built on Radix UI that displays helpful information when hovering or focusing on an element.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

// Basic tooltip
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const button = canvas.getByRole('button')
    
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Hover me')
  }
}

// Tooltip with custom content
export const WithCustomContent: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Info</Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-1">
          <p className="font-semibold">User Information</p>
          <p className="text-xs">Click to view detailed profile</p>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// Different positions
export const Positions: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-16 place-items-center min-h-32">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Top</Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p>Tooltip on top</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Right</Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>Tooltip on right</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Bottom</Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Tooltip on bottom</p>
        </TooltipContent>
      </Tooltip>

      <div></div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">Left</Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>Tooltip on left</p>
        </TooltipContent>
      </Tooltip>

      <div></div>
    </div>
  )
}

// With icons and text
export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            ?
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Help & Support</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            ⚙️
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon">
            🔔
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex flex-col gap-1">
            <p className="font-medium">Notifications</p>
            <p className="text-xs">You have 3 new messages</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-red-600 text-white border-red-600">
          <p>⚠️ This action cannot be undone</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Success</Button>
        </TooltipTrigger>
        <TooltipContent className="bg-green-600 text-white border-green-600">
          <p>✅ Operation completed successfully</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// With offset
export const WithOffset: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">No offset</Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={0}>
          <p>Right next to trigger</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Small offset</Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>
          <p>8px from trigger</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Large offset</Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={20}>
          <p>20px from trigger</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

// Multiple tooltips
export const MultipleTooltips: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }, (_, i) => (
        <Tooltip key={i}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              Item {i + 1}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Information about item {i + 1}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}