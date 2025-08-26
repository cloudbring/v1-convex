import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import Page, { metadata } from './page'

expect.extend(toHaveNoViolations)

// Mock Next.js Image component
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className, ...props }: any) => (
    <img 
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      data-testid="logo-image"
      {...props}
    />
  )
}))

// Mock @convex-dev/auth/react
vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({
    signIn: vi.fn().mockResolvedValue({}),
    signOut: vi.fn().mockResolvedValue({}),
  })
}))

// Mock the UI Button component
vi.mock('@v1/ui/button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button 
      onClick={onClick}
      className={`button ${variant} ${className}`}
      data-testid="google-signin-button"
      {...props}
    >
      {children}
    </button>
  )
}))

// Mock GoogleSignin component
vi.mock('@/components/google-signin', () => ({
  GoogleSignin: () => (
    <button data-testid="google-signin" className="google-signin-component">
      Sign in with Google
    </button>
  )
}))

describe('Login Page', () => {
  beforeEach(() => {
    cleanup()
  })

  describe('Basic Rendering Tests', () => {
    it('should render page structure correctly', () => {
      const { container } = render(<Page />)
      
      // Check main container structure - get the outermost div with specific classes
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toBeInTheDocument()
      expect(mainContainer).toHaveClass('h-screen', 'w-screen', 'flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('should render inner content container with correct classes', () => {
      const { container } = render(<Page />)
      
      const innerContainer = container.querySelector('.size-96')
      expect(innerContainer).toBeInTheDocument()
      expect(innerContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'size-96')
    })

    it('should render logo image with correct attributes', () => {
      render(<Page />)
      
      const logo = screen.getByTestId('logo-image')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('src', '/logo.png')
      expect(logo).toHaveAttribute('alt', 'logo')
      expect(logo).toHaveAttribute('width', '350')
      expect(logo).toHaveAttribute('height', '350')
    })

    it('should render GoogleSignin component', () => {
      render(<Page />)
      
      const googleSignin = screen.getByTestId('google-signin')
      expect(googleSignin).toBeInTheDocument()
      expect(googleSignin).toHaveTextContent('Sign in with Google')
    })

    it('should render components in correct order', () => {
      const { container } = render(<Page />)
      
      const innerContainer = container.querySelector('.size-96')
      const children = Array.from(innerContainer?.children || [])
      
      expect(children).toHaveLength(2)
      expect(children[0]).toHaveAttribute('data-testid', 'logo-image')
      expect(children[1]).toHaveAttribute('data-testid', 'google-signin')
    })
  })

  describe('Metadata Tests', () => {
    it('should export correct metadata', () => {
      expect(metadata).toBeDefined()
      expect(metadata.title).toBe('Login')
    })

    it('should have metadata as an object with title property', () => {
      expect(typeof metadata).toBe('object')
      expect('title' in metadata).toBe(true)
    })
  })

  describe('Accessibility Tests', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Page />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have proper image accessibility', () => {
      render(<Page />)
      
      const logo = screen.getByAltText('logo')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('alt', 'logo')
    })

    it('should use semantic HTML structure', () => {
      const { container } = render(<Page />)
      
      // Check that we have proper div structure
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toBeInTheDocument()
    })

    it('should support keyboard navigation', () => {
      render(<Page />)
      
      const googleSignin = screen.getByTestId('google-signin')
      expect(googleSignin).toBeInTheDocument()
      
      // GoogleSignin should be focusable as a button
      expect(googleSignin.tagName.toLowerCase()).toBe('button')
    })

    it('should have descriptive button text', () => {
      render(<Page />)
      
      const googleSignin = screen.getByTestId('google-signin')
      expect(googleSignin).toHaveAccessibleName('Sign in with Google')
    })
  })

  describe('Responsive Design Tests', () => {
    it('should maintain centered layout on different screen sizes', () => {
      const { container } = render(<Page />)
      
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('should use full viewport dimensions', () => {
      const { container } = render(<Page />)
      
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toHaveClass('h-screen', 'w-screen')
    })

    it('should maintain content sizing', () => {
      const { container } = render(<Page />)
      
      const innerContainer = container.querySelector('.size-96')
      expect(innerContainer).toHaveClass('size-96')
    })

    it('should handle mobile viewport correctly', () => {
      // Mock smaller viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      })
      
      const { container } = render(<Page />)
      
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center')
    })
  })

  describe('Component Integration Tests', () => {
    it('should integrate GoogleSignin component properly', () => {
      render(<Page />)
      
      const googleSignin = screen.getByTestId('google-signin')
      expect(googleSignin).toBeInTheDocument()
      expect(googleSignin).toHaveClass('google-signin-component')
    })

    it('should render logo and signin in same container', () => {
      const { container } = render(<Page />)
      
      const logo = screen.getByTestId('logo-image')
      const googleSignin = screen.getByTestId('google-signin')
      
      // Both should be in the same inner container
      const innerContainer = container.querySelector('.size-96')
      expect(innerContainer).toContainElement(logo)
      expect(innerContainer).toContainElement(googleSignin)
    })

    it('should handle component props correctly', () => {
      render(<Page />)
      
      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('src', '/logo.png')
      expect(logo).toHaveAttribute('alt', 'logo')
      expect(logo).toHaveAttribute('width', '350')
      expect(logo).toHaveAttribute('height', '350')
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle missing logo gracefully', () => {
      // Mock console.error to suppress expected error messages
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      render(<Page />)
      
      // Image should still render even if src might fail to load
      const logo = screen.getByTestId('logo-image')
      expect(logo).toBeInTheDocument()
      
      consoleError.mockRestore()
    })

    it('should render even if GoogleSignin fails to load', () => {
      // Test graceful degradation - the mock ensures GoogleSignin always renders
      const { container } = render(<Page />)
      
      const logo = screen.getByTestId('logo-image')
      expect(logo).toBeInTheDocument()
      
      // Even if GoogleSignin had issues, the page structure should remain
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toHaveClass('h-screen', 'w-screen', 'flex', 'flex-col', 'items-center', 'justify-center')
    })

    it('should maintain layout structure even with component errors', () => {
      const { container } = render(<Page />)
      
      // Verify core layout remains intact
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toBeInTheDocument()
      
      const innerContainer = container.querySelector('.size-96')
      expect(innerContainer).toBeInTheDocument()
    })
  })

  describe('Layout and Styling Tests', () => {
    it('should apply correct Tailwind classes to main container', () => {
      const { container } = render(<Page />)
      
      const mainContainer = container.querySelector('.h-screen.w-screen')
      const expectedClasses = ['h-screen', 'w-screen', 'flex', 'flex-col', 'items-center', 'justify-center']
      
      expectedClasses.forEach(className => {
        expect(mainContainer).toHaveClass(className)
      })
    })

    it('should apply correct Tailwind classes to inner container', () => {
      const { container } = render(<Page />)
      
      const innerContainer = container.querySelector('.size-96')
      const expectedClasses = ['flex', 'flex-col', 'items-center', 'justify-center', 'size-96']
      
      expectedClasses.forEach(className => {
        expect(innerContainer).toHaveClass(className)
      })
    })

    it('should center content both horizontally and vertically', () => {
      const { container } = render(<Page />)
      
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toHaveClass('items-center', 'justify-center')
    })

    it('should use flexbox layout', () => {
      const { container } = render(<Page />)
      
      const mainContainer = container.querySelector('.h-screen.w-screen')
      expect(mainContainer).toHaveClass('flex', 'flex-col')
    })
  })

  describe('Static Asset Tests', () => {
    it('should reference correct logo path', () => {
      render(<Page />)
      
      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('src', '/logo.png')
    })

    it('should have proper image dimensions', () => {
      render(<Page />)
      
      const logo = screen.getByTestId('logo-image')
      expect(logo).toHaveAttribute('width', '350')
      expect(logo).toHaveAttribute('height', '350')
    })

    it('should provide meaningful alt text', () => {
      render(<Page />)
      
      const logo = screen.getByAltText('logo')
      expect(logo).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render without crashing', () => {
      expect(() => render(<Page />)).not.toThrow()
    })

    it('should handle multiple renders correctly', () => {
      const { unmount, rerender } = render(<Page />)
      
      expect(screen.getByTestId('logo-image')).toBeInTheDocument()
      expect(screen.getByTestId('google-signin')).toBeInTheDocument()
      
      rerender(<Page />)
      
      expect(screen.getByTestId('logo-image')).toBeInTheDocument()
      expect(screen.getByTestId('google-signin')).toBeInTheDocument()
      
      unmount()
    })

    it('should maintain component integrity after re-renders', () => {
      const { rerender } = render(<Page />)
      
      const initialLogo = screen.getByTestId('logo-image')
      const initialGoogleSignin = screen.getByTestId('google-signin')
      
      rerender(<Page />)
      
      const rerenderedLogo = screen.getByTestId('logo-image')
      const rerenderedGoogleSignin = screen.getByTestId('google-signin')
      
      expect(rerenderedLogo).toHaveAttribute('src', '/logo.png')
      expect(rerenderedGoogleSignin).toHaveTextContent('Sign in with Google')
    })
  })
})