/**
 * @fileoverview Test suite for Dialog components
 * Tests Dialog family: root, trigger, content, header/footer, title/description, close.
 * Built on Radix UI providing accessible modal functionality with animations.
 */

import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '../../../test-utils/src/render'
import { 
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter,
  DialogTitle, DialogDescription, DialogClose
} from './dialog'

describe('Dialog Components', () => {
  /** Test component exports and basic trigger rendering */
  it('should export all components and render trigger', () => {
    expect(Dialog).toBeDefined()
    expect(DialogTrigger).toBeDefined()
    expect(DialogContent).toBeDefined()
    expect(DialogHeader).toBeDefined()
    expect(DialogFooter).toBeDefined()
    expect(DialogTitle).toBeDefined()
    expect(DialogDescription).toBeDefined()
    expect(DialogClose).toBeDefined()

    render(
      <Dialog>
        <DialogTrigger data-testid="dialog-trigger">Open Dialog</DialogTrigger>
      </Dialog>
    )

    const trigger = screen.getByTestId('dialog-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Open Dialog')
  })

  /** Test dialog opens and renders content */
  it('should open dialog and render content', async () => {
    const { user } = render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent data-testid="dialog-content">
          <DialogTitle>Test Title</DialogTitle>
          <DialogDescription>Test Description</DialogDescription>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open'))

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Test Title')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
    })
  })

  /** Test dialog header and footer with custom styling */
  it('should render header and footer with custom styling', () => {
    render(
      <div>
        <DialogHeader className="custom-header" data-testid="dialog-header">
          <h2>Header Title</h2>
        </DialogHeader>
        <DialogFooter className="custom-footer" data-testid="dialog-footer">
          <button>Cancel</button>
          <button>Confirm</button>
        </DialogFooter>
      </div>
    )

    const header = screen.getByTestId('dialog-header')
    expect(header).toHaveClass('custom-header')
    expect(header).toHaveTextContent('Header Title')

    const footer = screen.getByTestId('dialog-footer')
    expect(footer).toHaveClass('custom-footer')
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  /** Test dialog close functionality */
  it('should close dialog when close button is clicked', async () => {
    const { user } = render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Closable Dialog</DialogTitle>
          <DialogClose data-testid="close-button">Close</DialogClose>
        </DialogContent>
      </Dialog>
    )

    await user.click(screen.getByText('Open Dialog'))
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

    await user.click(screen.getByTestId('close-button'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})