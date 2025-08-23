import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect, waitFor } from '@storybook/test'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from './dialog'
import { Button } from './button'
import { Input } from './input'

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A modal dialog component built on Radix UI Dialog primitive with customizable content, header, and footer sections.'
      }
    }
  },
  tags: ['autodocs']
}

export default meta
type Story = StoryObj<typeof meta>

// Basic dialog
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a basic dialog with a title and description.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>Dialog content goes here.</p>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open Dialog' })
    
    expect(trigger).toBeInTheDocument()
    
    // Open dialog
    await userEvent.click(trigger)
    
    // Wait for dialog to appear
    await waitFor(async () => {
      const dialog = canvas.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })
    
    // Check dialog content
    expect(canvas.getByText('Dialog Title')).toBeInTheDocument()
    expect(canvas.getByText('This is a basic dialog with a title and description.')).toBeInTheDocument()
  }
}

// Form dialog
export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <Input
              id="name"
              defaultValue="Pedro Duarte"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="username" className="text-right">
              Username
            </label>
            <Input
              id="username"
              defaultValue="@peduarte"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Edit Profile' })
    
    await userEvent.click(trigger)
    
    await waitFor(async () => {
      const nameInput = canvas.getByDisplayValue('Pedro Duarte')
      const usernameInput = canvas.getByDisplayValue('@peduarte')
      
      expect(nameInput).toBeInTheDocument()
      expect(usernameInput).toBeInTheDocument()
      
      // Test form interaction
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'New Name')
      expect(nameInput).toHaveValue('New Name')
    })
  }
}

// Confirmation dialog
export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete Account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive">Delete Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Delete Account' })
    
    await userEvent.click(trigger)
    
    await waitFor(async () => {
      expect(canvas.getByText('Are you absolutely sure?')).toBeInTheDocument()
      expect(canvas.getByText(/This action cannot be undone/)).toBeInTheDocument()
      
      const cancelBtn = canvas.getByRole('button', { name: 'Cancel' })
      const deleteBtn = canvas.getByRole('button', { name: 'Delete Account' })
      
      expect(cancelBtn).toBeInTheDocument()
      expect(deleteBtn).toBeInTheDocument()
    })
  }
}

// Close dialog test
export const CloseDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open & Close</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Closable Dialog</DialogTitle>
          <DialogDescription>
            You can close this dialog using the X button, Cancel button, or ESC key.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Open & Close' })
    
    await userEvent.click(trigger)
    
    await waitFor(async () => {
      const dialog = canvas.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      
      // Test close with Cancel button
      const cancelBtn = canvas.getByRole('button', { name: 'Cancel' })
      await userEvent.click(cancelBtn)
    })
    
    // Dialog should be closed now
    await waitFor(async () => {
      expect(canvas.queryByRole('dialog')).not.toBeInTheDocument()
    })
  }
}

// Custom width dialog
export const CustomWidth: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Wide Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Wide Dialog</DialogTitle>
          <DialogDescription>
            This dialog has custom width styling applied.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>This is a wider dialog that can accommodate more content.</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Left Column</h4>
              <p className="text-sm text-muted-foreground">
                Content in the left column of the wide dialog.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Right Column</h4>
              <p className="text-sm text-muted-foreground">
                Content in the right column of the wide dialog.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Accessibility test
export const AccessibilityTest: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button aria-describedby="dialog-help">
          Accessible Dialog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle id="dialog-title">
            Accessible Dialog Title
          </DialogTitle>
          <DialogDescription id="dialog-description">
            This dialog demonstrates proper accessibility features including ARIA labels and focus management.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input placeholder="Focus should be managed properly" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole('button', { name: 'Accessible Dialog' })
    
    await userEvent.click(trigger)
    
    await waitFor(async () => {
      const dialog = canvas.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
      
      // Check for proper ARIA attributes
      const title = canvas.getByRole('heading', { name: 'Accessible Dialog Title' })
      const description = canvas.getByText(/This dialog demonstrates proper accessibility/)
      
      expect(title).toBeInTheDocument()
      expect(description).toBeInTheDocument()
    })
  }
}