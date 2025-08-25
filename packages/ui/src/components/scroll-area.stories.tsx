import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from 'storybook/internal/test'
import { ScrollArea, ScrollBar } from './scroll-area'

const meta: Meta<typeof ScrollArea> = {
  title: 'Components/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A custom scroll area component built on Radix UI with styled scrollbars and smooth scrolling behavior.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Basic scroll area
export const Default: Story = {
  render: () => (
    <ScrollArea className="h-48 w-80 rounded border">
      <div className="p-4">
        <h3 className="mb-4 text-sm font-medium">Scrollable Content</h3>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="py-2 border-b border-gray-100 last:border-0">
            <p className="text-sm">Item {i + 1} - This is some content that makes the area scrollable</p>
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const scrollArea = canvas.getByText('Item 1 - This is some content that makes the area scrollable').closest('[class*="relative"]')
    
    expect(scrollArea).toBeInTheDocument()
  }
}

// Horizontal scroll
export const Horizontal: Story = {
  render: () => (
    <ScrollArea className="w-80 whitespace-nowrap rounded border">
      <div className="flex p-4 gap-4">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="flex-shrink-0 w-32 h-24 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-sm font-medium">Card {i + 1}</span>
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// Both directions
export const BothDirections: Story = {
  render: () => (
    <ScrollArea className="h-48 w-80 rounded border">
      <div className="p-4">
        <div className="min-w-[600px]">
          <h3 className="mb-4 text-sm font-medium">Content that scrolls both ways</h3>
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="py-2 border-b border-gray-100 last:border-0">
              <p className="text-sm">
                Row {i + 1} - This is a very long line of text that will cause horizontal scrolling when the container is not wide enough to contain it all
              </p>
            </div>
          ))}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="mb-2 text-sm font-medium">Small (160px height)</h4>
        <ScrollArea className="h-40 w-64 rounded border">
          <div className="p-3">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="py-1 text-xs">
                Small item {i + 1}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div>
        <h4 className="mb-2 text-sm font-medium">Medium (240px height)</h4>
        <ScrollArea className="h-60 w-80 rounded border">
          <div className="p-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm">Medium item {i + 1}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div>
        <h4 className="mb-2 text-sm font-medium">Large (320px height)</h4>
        <ScrollArea className="h-80 w-96 rounded border">
          <div className="p-4">
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm">Large item {i + 1} - More content here</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// Rich content
export const RichContent: Story = {
  render: () => (
    <ScrollArea className="h-64 w-96 rounded border">
      <div className="p-6">
        <h2 className="mb-4 text-lg font-bold">Article Title</h2>
        
        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
            tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
            quis nostrud exercitation ullamco laboris.
          </p>
          
          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600">
            "This is a blockquote that demonstrates how rich content can be 
            displayed within a scroll area component."
          </blockquote>
          
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum 
            dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non 
            proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <div className="bg-gray-50 p-4 rounded">
            <h3 className="font-semibold mb-2">Code Example</h3>
            <pre className="text-xs bg-gray-800 text-white p-2 rounded overflow-x-auto">
              <code>{`function example() {
  console.log("Hello, world!");
  return true;
}`}</code>
            </pre>
          </div>
          
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium 
            doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore 
            veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
          
          <ul className="list-disc list-inside space-y-1">
            <li>First bullet point</li>
            <li>Second bullet point</li>
            <li>Third bullet point with more content</li>
          </ul>
          
          <p>
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis 
            praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.
          </p>
        </div>
      </div>
    </ScrollArea>
  )
}

// Custom styling
export const CustomStyling: Story = {
  render: () => (
    <div className="flex gap-6">
      <div>
        <h4 className="mb-2 text-sm font-medium">Dark Theme</h4>
        <ScrollArea className="h-48 w-64 rounded border bg-gray-900">
          <div className="p-4">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="py-2 border-b border-gray-700 last:border-0">
                <p className="text-sm text-white">Dark item {i + 1}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
      
      <div>
        <h4 className="mb-2 text-sm font-medium">Colored Theme</h4>
        <ScrollArea className="h-48 w-64 rounded border bg-blue-50">
          <div className="p-4">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="py-2 border-b border-blue-200 last:border-0">
                <p className="text-sm text-blue-900">Blue item {i + 1}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

// Gallery/Grid layout
export const GridLayout: Story = {
  render: () => (
    <ScrollArea className="h-80 w-96 rounded border">
      <div className="p-4">
        <h3 className="mb-4 text-sm font-medium">Image Gallery</h3>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="bg-gray-100 rounded h-24 flex items-center justify-center">
              <span className="text-xs font-medium">Image {i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}