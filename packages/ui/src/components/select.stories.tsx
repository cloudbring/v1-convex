import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from 'storybook/internal/test'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from './select'

const onValueChange = fn()

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A select component built on Radix UI for choosing from a list of options with full keyboard navigation support.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled'
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'The default selected value'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Basic select
export const Default: Story = {
  render: (args) => (
    <Select onValueChange={onValueChange} {...args}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')
    
    expect(trigger).toBeInTheDocument()
    expect(canvas.getByText('Select a fruit')).toBeInTheDocument()
  }
}

// Select with default value
export const WithDefaultValue: Story = {
  args: {
    defaultValue: 'banana'
  },
  render: (args) => (
    <Select onValueChange={onValueChange} {...args}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="orange">Orange</SelectItem>
        <SelectItem value="grape">Grape</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Grouped select
export const WithGroups: Story = {
  render: () => (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Choose a programming language" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frontend</SelectLabel>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="typescript">TypeScript</SelectItem>
          <SelectItem value="react">React</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Backend</SelectLabel>
          <SelectItem value="node">Node.js</SelectItem>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="go">Go</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

// Disabled select
export const Disabled: Story = {
  args: {
    disabled: true
  },
  render: (args) => (
    <Select onValueChange={onValueChange} {...args}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Disabled select" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('combobox')
    
    expect(trigger).toBeDisabled()
  }
}

// Long list of options
export const WithManyOptions: Story = {
  render: () => (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 10 }, (_, i) => (
          <SelectItem key={i} value={`country-${i}`}>
            Country {i + 1}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-start">
      <div>
        <label className="text-sm font-medium mb-2 block">Small</label>
        <Select onValueChange={onValueChange}>
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue placeholder="Small" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small1">Option 1</SelectItem>
            <SelectItem value="small2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Default</label>
        <Select onValueChange={onValueChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default1">Option 1</SelectItem>
            <SelectItem value="default2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="text-sm font-medium mb-2 block">Large</label>
        <Select onValueChange={onValueChange}>
          <SelectTrigger className="w-64 h-12 text-lg">
            <SelectValue placeholder="Large" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="large1">Option 1</SelectItem>
            <SelectItem value="large2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}