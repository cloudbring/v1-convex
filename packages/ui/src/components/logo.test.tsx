/**
 * @fileoverview Test suite for Logo component
 * 
 * This module tests the Logo SVG component:
 * - Default rendering with proper SVG structure
 * - Custom width and height props
 * - Class name merging and styling
 * - Additional prop forwarding
 * 
 * The Logo component represents the brand identity across the application.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@v1/test-utils'
import { Logo } from './logo'

describe('Logo Component', () => {
  /**
   * Test basic Logo rendering
   * Should render SVG with default dimensions and styling
   */
  it('should render Logo with default props', () => {
    render(<Logo data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    expect(logo).toBeInTheDocument()
    expect(logo.tagName).toBe('svg')
    expect(logo).toHaveAttribute('width', '40')
    expect(logo).toHaveAttribute('height', '40')
    expect(logo).toHaveAttribute('viewBox', '0 0 24 24')
  })

  /**
   * Test custom width and height
   * Should apply custom dimensions when provided
   */
  it('should apply custom width and height', () => {
    render(<Logo width={60} height={60} data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('width', '60')
    expect(logo).toHaveAttribute('height', '60')
  })

  /**
   * Test custom className application
   * Should merge custom classes with default text-primary
   */
  it('should apply custom className', () => {
    render(<Logo className="custom-logo-class" data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    expect(logo).toHaveClass('text-primary', 'custom-logo-class')
  })

  /**
   * Test additional props forwarding
   * Should forward additional props to SVG element
   */
  it('should forward additional props to SVG', () => {
    render(
      <Logo 
        data-testid="logo" 
        aria-label="Company logo"
        role="img"
        id="main-logo"
      />
    )
    
    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('aria-label', 'Company logo')
    expect(logo).toHaveAttribute('role', 'img')
    expect(logo).toHaveAttribute('id', 'main-logo')
  })

  /**
   * Test SVG structure and content
   * Should contain the expected SVG path element
   */
  it('should contain SVG path element', () => {
    render(<Logo data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    const path = logo.querySelector('path')
    
    expect(path).toBeInTheDocument()
    expect(path).toHaveAttribute('fill', 'currentColor')
    expect(path).toHaveAttribute('fill-rule', 'evenodd')
    expect(path).toHaveAttribute('clip-rule', 'evenodd')
  })

  /**
   * Test SVG accessibility
   * Should have proper attributes for accessibility
   */
  it('should have proper SVG accessibility attributes', () => {
    render(<Logo data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    expect(logo).toHaveAttribute('fill', 'none')
  })

  /**
   * Test Logo component interface
   * Should accept LogoProps interface correctly
   */
  it('should handle LogoProps interface', () => {
    const logoProps = {
      width: 80,
      height: 80,
      className: 'test-class',
      'data-custom': 'custom-value'
    }
    
    render(<Logo {...logoProps} data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('width', '80')
    expect(logo).toHaveAttribute('height', '80')
    expect(logo).toHaveAttribute('data-custom', 'custom-value')
  })

  /**
   * Test default dimensions when props are undefined
   * Should fall back to default values for undefined width/height
   */
  it('should use defaults for undefined dimensions', () => {
    render(<Logo width={undefined} height={undefined} data-testid="logo" />)
    
    const logo = screen.getByTestId('logo')
    expect(logo).toHaveAttribute('width', '40')
    expect(logo).toHaveAttribute('height', '40')
  })
})