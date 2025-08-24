import { describe, it, expect } from 'vitest'
import { render, screen } from '@v1/test-utils/render'
import { Input } from './input'

describe('Input Component', () => {
  it('renders with default type text', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('renders with specified type', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })

  it('renders password type correctly', () => {
    render(<Input type="password" />)
    const input = screen.getByLabelText('', { selector: 'input[type="password"]' })
    expect(input).toHaveAttribute('type', 'password')
  })

  it('applies default classes', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass(
      'flex',
      'h-10',
      'w-full',
      'rounded-md',
      'border',
      'border-input',
      'bg-background',
      'px-3',
      'py-2',
      'text-sm'
    )
  })

  it('applies custom className in addition to default classes', () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('custom-class')
    expect(input).toHaveClass('h-10', 'w-full') // Default classes should still be applied
  })

  it('forwards all HTML input attributes', () => {
    render(
      <Input
        placeholder="Enter text"
        value="test value"
        readOnly
        disabled
        required
        aria-label="Test input"
        data-testid="test-input"
      />
    )
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('placeholder', 'Enter text')
    expect(input).toHaveValue('test value')
    expect(input).toBeDisabled()
    expect(input).toBeRequired()
    expect(input).toHaveAttribute('aria-label', 'Test input')
    expect(input).toHaveAttribute('data-testid', 'test-input')
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    
    expect(input).toBeDisabled()
    expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
  })

  it('handles controlled input correctly', async () => {
    const { user } = render(<Input value="initial" onChange={() => {}} />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveValue('initial')
    
    // Try to type (won't change value since it's controlled)
    await user.type(input, 'new')
    expect(input).toHaveValue('initial') // Value should remain the same
  })

  it('handles uncontrolled input correctly', async () => {
    const { user } = render(<Input defaultValue="initial" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveValue('initial')
    
    // Clear and type new value
    await user.clear(input)
    await user.type(input, 'new value')
    expect(input).toHaveValue('new value')
  })

  it('forwards ref correctly', () => {
    let ref: HTMLInputElement | null = null
    
    render(
      <Input
        ref={(el) => {
          ref = el
        }}
      />
    )
    
    expect(ref).toBeInstanceOf(HTMLInputElement)
  })

  it('handles focus and blur events', async () => {
    const { user } = render(<Input />)
    const input = screen.getByRole('textbox')
    
    // Focus the input
    await user.click(input)
    expect(input).toHaveFocus()
    
    // Blur the input
    await user.tab()
    expect(input).not.toHaveFocus()
  })

  it('displays placeholder text', () => {
    render(<Input placeholder="Type here..." />)
    const input = screen.getByPlaceholderText('Type here...')
    expect(input).toBeInTheDocument()
  })

  it('handles different input types correctly', () => {
    const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url'] as const
    
    inputTypes.forEach((type) => {
      const { unmount } = render(<Input type={type} data-testid={`${type}-input`} />)
      const input = screen.getByTestId(`${type}-input`)
      expect(input).toHaveAttribute('type', type)
      unmount()
    })
  })

  it('supports file input type', () => {
    render(<Input type="file" />)
    const input = screen.getByLabelText('', { selector: 'input[type="file"]' })
    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveClass('file:border-0', 'file:bg-transparent')
  })

  it('has proper accessibility classes for focus states', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    )
  })

  it('has proper placeholder styling classes', () => {
    render(<Input placeholder="Placeholder" />)
    const input = screen.getByRole('textbox')
    
    expect(input).toHaveClass('placeholder:text-muted-foreground')
  })
})