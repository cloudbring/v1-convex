import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, fn } from 'storybook/internal/test'
import { UploadInput } from './upload-input'
import { Button } from './button'
import { useState } from 'react'

// Mock functions for upload handlers
const mockGenerateUploadUrl = fn(() => Promise.resolve('https://example.com/upload'))
const mockOnUploadComplete = fn()

const meta: Meta<typeof UploadInput> = {
  title: 'Components/UploadInput',
  component: UploadInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A file upload input component that handles file selection and upload with progress tracking and customizable styling.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    accept: {
      control: { type: 'text' },
      description: 'File types to accept (e.g., "image/*", ".pdf,.doc")'
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the input is required'
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes'
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Basic upload input
export const Default: Story = {
  args: {
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const input = canvas.getByRole('button') // File inputs are treated as buttons
    
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'file')
  }
}

// Image upload only
export const ImageOnly: Story = {
  args: {
    accept: 'image/*',
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Upload Image</label>
      <UploadInput {...args} />
      <p className="text-xs text-gray-500">Only image files are allowed</p>
    </div>
  )
}

// Document upload
export const DocumentOnly: Story = {
  args: {
    accept: '.pdf,.doc,.docx,.txt',
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Upload Document</label>
      <UploadInput {...args} />
      <p className="text-xs text-gray-500">PDF, DOC, DOCX, and TXT files only</p>
    </div>
  )
}

// Required upload
export const Required: Story = {
  args: {
    required: true,
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  render: (args) => (
    <form className="flex flex-col gap-2">
      <label className="text-sm font-medium">Upload File *</label>
      <UploadInput {...args} />
      <p className="text-xs text-gray-500">This field is required</p>
    </form>
  )
}

// Custom styled upload
export const CustomStyled: Story = {
  args: {
    className: 'border-2 border-dashed border-blue-300 p-4 rounded-lg hover:border-blue-400 focus:border-blue-500',
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Custom Styled Upload</label>
      <UploadInput {...args} />
    </div>
  )
}

// Upload with preview
export const WithPreview: Story = {
  render: () => {
    const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, url: string}>>([])
    
    const handleUploadComplete = (files: any[]) => {
      // In a real app, files would contain actual uploaded file data
      const mockFiles = files.map((_, index) => ({
        name: `uploaded-file-${index + 1}.jpg`,
        url: `https://via.placeholder.com/100x100?text=File+${index + 1}`
      }))
      setUploadedFiles(prev => [...prev, ...mockFiles])
      mockOnUploadComplete(files)
    }
    
    return (
      <div className="flex flex-col gap-4 w-80">
        <div>
          <label className="text-sm font-medium mb-2 block">Upload Images</label>
          <UploadInput
            accept="image/*"
            generateUploadUrl={mockGenerateUploadUrl}
            onUploadComplete={handleUploadComplete}
            className="border-2 border-dashed border-gray-300 p-4 rounded-lg"
          />
        </div>
        
        {uploadedFiles.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
            <div className="grid grid-cols-2 gap-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="border rounded p-2 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded mx-auto mb-1"></div>
                  <p className="text-xs truncate">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
}

// Multiple file types
export const MultipleTypes: Story = {
  args: {
    accept: 'image/*,video/*,.pdf,.doc,.docx',
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  render: (args) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Upload Any File Type</label>
      <UploadInput {...args} />
      <p className="text-xs text-gray-500">
        Accepts: Images, Videos, PDF, and Word documents
      </p>
    </div>
  )
}

// Upload button style
export const ButtonStyle: Story = {
  render: () => {
    const [isUploading, setIsUploading] = useState(false)
    
    const handleUploadStart = async () => {
      setIsUploading(true)
      // Simulate upload delay
      setTimeout(() => setIsUploading(false), 2000)
      return mockGenerateUploadUrl()
    }
    
    const handleUploadComplete = (files: any[]) => {
      setIsUploading(false)
      mockOnUploadComplete(files)
    }
    
    return (
      <div className="flex flex-col gap-2 items-start">
        <label className="text-sm font-medium">Button-Style Upload</label>
        <div className="relative">
          <UploadInput
            generateUploadUrl={handleUploadStart}
            onUploadComplete={handleUploadComplete}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Button disabled={isUploading} className="pointer-events-none">
            {isUploading ? (
              <>
                <span className="animate-spin mr-2">⚪</span>
                Uploading...
              </>
            ) : (
              <>📁 Choose File</>
            )}
          </Button>
        </div>
        {!isUploading && (
          <p className="text-xs text-gray-500">Click to select a file</p>
        )}
      </div>
    )
  }
}

// Drag and drop area (visual only - actual DnD would need additional implementation)
export const DragDropArea: Story = {
  args: {
    generateUploadUrl: mockGenerateUploadUrl,
    onUploadComplete: mockOnUploadComplete
  },
  render: (args) => (
    <div className="w-80">
      <label className="text-sm font-medium mb-2 block">Drag & Drop Area</label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <UploadInput
          {...args}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="pointer-events-none">
          <div className="text-4xl mb-2">📁</div>
          <p className="text-sm font-medium mb-1">Drop files here or click to browse</p>
          <p className="text-xs text-gray-500">Supports any file type</p>
        </div>
      </div>
    </div>
  )
}

// Form integration
export const InForm: Story = {
  render: () => {
    const [formData, setFormData] = useState({ title: '', files: [] as any[] })
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Form submitted:', formData)
    }
    
    const handleUploadComplete = (files: any[]) => {
      setFormData(prev => ({ ...prev, files }))
      mockOnUploadComplete(files)
    }
    
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <div>
          <label className="text-sm font-medium mb-1 block">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter title..."
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-1 block">Attachments</label>
          <UploadInput
            generateUploadUrl={mockGenerateUploadUrl}
            onUploadComplete={handleUploadComplete}
            className="w-full border-2 border-dashed border-gray-300 p-3 rounded hover:border-gray-400"
          />
        </div>
        
        <Button type="submit" className="self-start">
          Submit Form
        </Button>
        
        {formData.files.length > 0 && (
          <p className="text-xs text-green-600">
            {formData.files.length} file(s) uploaded
          </p>
        )}
      </form>
    )
  }
}