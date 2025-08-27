import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../../test-utils/src/render'
import { Button, buttonVariants } from './button'

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('applies default variant and size classes', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button')
    
    // Check for base classes
    expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    // Check for default variant and size classes
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    expect(button).toHaveClass('h-10', 'px-4', 'py-2')
  })

  it('applies variant classes correctly', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const
    
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test</Button>)
      const button = screen.getByRole('button')
      
      switch (variant) {
        case 'destructive':
          expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
          break
        case 'outline':
          expect(button).toHaveClass('border', 'border-input', 'bg-background')
          break
        case 'secondary':
          expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
          break
        case 'ghost':
          expect(button).toHaveClass('hover:bg-accent')
          break
        case 'link':
          expect(button).toHaveClass('text-primary', 'underline-offset-4')
          break
        default:
          expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
      }
      
      unmount()
    })
  })

  it('applies size classes correctly', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const
    
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>Test</Button>)
      const button = screen.getByRole('button')
      
      switch (size) {
        case 'sm':
          expect(button).toHaveClass('h-9', 'px-3')
          break
        case 'lg':
          expect(button).toHaveClass('h-11', 'px-8')
          break
        case 'icon':
          expect(button).toHaveClass('h-10', 'w-10')
          break
        default:
          expect(button).toHaveClass('h-10', 'px-4', 'py-2')
      }
      
      unmount()
    })
  })

  it('forwards onClick handler correctly', async () => {
    const onClick = vi.fn()
    const { user } = render(<Button onClick={onClick}>Clickable</Button>)
    const button = screen.getByRole('button')
    
    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is passed', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50')
  })

  it('applies custom className in addition to variant classes', () => {
    render(<Button className="custom-class">Custom Button</Button>)
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('custom-class')
    expect(button).toHaveClass('bg-primary') // Default variant should still be applied
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test')
    expect(link).toHaveTextContent('Link Button')
    expect(link).toHaveClass('bg-primary') // Button classes should be applied to link
  })

  it('forwards ref correctly', () => {
    let ref: HTMLButtonElement | null = null
    
    render(
      <Button
        ref={(el) => {
          ref = el
        }}
      >
        Ref Button
      </Button>
    )
    
    expect(ref).toBeInstanceOf(HTMLButtonElement)
    expect(ref).toHaveTextContent('Ref Button')
  })

  it('handles HTML button attributes', () => {
    render(
      <Button
        type="submit"
        form="test-form"
        aria-label="Submit form"
      >
        Submit
      </Button>
    )
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('form', 'test-form')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })

  describe('buttonVariants function', () => {
    it('generates correct classes for default configuration', () => {
      const classes = buttonVariants()
      expect(classes).toContain('bg-primary')
      expect(classes).toContain('h-10')
      expect(classes).toContain('px-4')
    })

    it('generates correct classes for custom variant and size', () => {
      const classes = buttonVariants({ variant: 'outline', size: 'lg' })
      expect(classes).toContain('border')
      expect(classes).toContain('h-11')
      expect(classes).toContain('px-8')
    })

    it('includes custom className', () => {
      const classes = buttonVariants({ className: 'custom-class' })
      expect(classes).toContain('custom-class')
    })
  })
})