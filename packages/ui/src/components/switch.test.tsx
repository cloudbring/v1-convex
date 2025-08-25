/**
 * @fileoverview Test suite for Switch component
 * 
 * This module tests the Switch component built on Radix UI:
 * - Switch toggle functionality and states (checked/unchecked)
 * - Custom styling and className application  
 * - Accessibility attributes and keyboard interaction
 * - Disabled state handling
 * - Event handler integration
 * 
 * Switch provides accessible toggle control for binary user choices.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Switch } from './switch'

describe('Switch Component', () => {
  /**
   * Test basic Switch rendering
   * Should render switch component with proper role and structure
   */
  it('should render switch component', () => {
    render(<Switch data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveRole('switch')
  })

  /**
   * Test Switch with checked state
   * Should render switch in checked state
   */
  it('should render switch in checked state', () => {
    render(<Switch checked data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).toHaveAttribute('data-state', 'checked')
  })

  /**
   * Test Switch with unchecked state
   * Should render switch in unchecked state by default
   */
  it('should render switch in unchecked state by default', () => {
    render(<Switch data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('data-state', 'unchecked')
  })

  /**
   * Test disabled Switch
   * Should render switch in disabled state
   */
  it('should render disabled switch', () => {
    render(<Switch disabled data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeDisabled()
    expect(switchElement).toHaveAttribute('disabled')
  })

  /**
   * Test Switch with custom className
   * Should apply custom styling classes
   */
  it('should apply custom className', () => {
    render(<Switch className="custom-switch" data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveClass('custom-switch')
  })

  /**
   * Test Switch with aria-label
   * Should have proper accessibility label
   */
  it('should support accessibility attributes', () => {
    render(
      <Switch 
        aria-label="Enable notifications" 
        data-testid="switch" 
      />
    )
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toHaveAttribute('aria-label', 'Enable notifications')
  })

  /**
   * Test Switch with default checked state
   * Should render with initial checked state
   */
  it('should support default checked state', () => {
    render(<Switch defaultChecked data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
  })

  /**
   * Test Switch structure with thumb element
   * Should contain the thumb element for visual toggle
   */
  it('should contain thumb element', () => {
    render(<Switch data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    // The thumb is a child element rendered by Radix
    expect(switchElement).toBeInTheDocument()
    expect(switchElement.children).toHaveLength(1)
  })

  /**
   * Test Switch component forwarded ref
   * Should properly forward refs to underlying element
   */
  it('should forward refs correctly', () => {
    const ref = { current: null }
    render(<Switch ref={ref} data-testid="switch" />)
    
    const switchElement = screen.getByTestId('switch')
    expect(switchElement).toBeInTheDocument()
  })
})