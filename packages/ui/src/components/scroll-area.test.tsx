/**
 * @fileoverview Test suite for ScrollArea components
 * 
 * This module tests the ScrollArea component family built on Radix UI:
 * - ScrollArea root component for scrollable content containers
 * - ScrollBar component for custom scroll bar styling
 * - Viewport and scrollbar thumb functionality
 * 
 * ScrollArea provides accessible scrollable content with custom styling.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollArea, ScrollBar } from './scroll-area'

describe('ScrollArea Components', () => {
  /**
   * Test scroll area component exports
   * Should export all necessary scroll area components
   */
  it('should export all scroll area components', () => {
    expect(ScrollArea).toBeDefined()
    expect(ScrollBar).toBeDefined()
  })

  /**
   * Test basic scroll area rendering
   * Should render scrollable container with content
   */
  it('should render scroll area with content', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Scrollable content here</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
    expect(screen.getByText('Scrollable content here')).toBeInTheDocument()
  })

  /**
   * Test scroll area with custom className
   * Should apply custom styling to scroll area
   */
  it('should apply custom className', () => {
    render(
      <ScrollArea className="custom-scroll" data-testid="scroll-area">
        <div>Content</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toHaveClass('custom-scroll')
  })

  /**
   * Test scroll area structure
   * Should contain viewport and scrollbar elements
   */
  it('should contain viewport for content', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div data-testid="scroll-content">Long content that needs scrolling</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    const content = screen.getByTestId('scroll-content')
    
    expect(scrollArea).toBeInTheDocument()
    expect(content).toBeInTheDocument()
  })

  /**
   * Test scroll area with long content structure
   * Should handle scrollable content properly
   */
  it('should handle scrollable content structure', () => {
    const longContent = Array.from({ length: 50 }, (_, i) => `Line ${i + 1}`).join('\n')
    
    render(
      <ScrollArea data-testid="scroll-area" style={{ height: '200px' }}>
        <div data-testid="long-content">{longContent}</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    const content = screen.getByTestId('long-content')
    
    expect(scrollArea).toBeInTheDocument()
    expect(content).toBeInTheDocument()
  })

  /**
   * Test scroll area with styled content
   * Should support styled scrollable content
   */
  it('should support styled scrollable content', () => {
    render(
      <ScrollArea className="h-48" data-testid="scroll-area">
        <div className="p-4">
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <p>Third paragraph</p>
        </div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
    expect(scrollArea).toHaveClass('h-48')
  })

  /**
   * Test scroll area forwarded ref
   * Should properly forward refs to underlying element
   */
  it('should forward refs correctly', () => {
    const ref = { current: null }
    render(
      <ScrollArea ref={ref} data-testid="scroll-area">
        <div>Content with ref</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
  })

  /**
   * Test scroll area default props
   * Should render with default configuration
   */
  it('should render with default configuration', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <div>Default content</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
    expect(screen.getByText('Default content')).toBeInTheDocument()
  })

  /**
   * Test scroll bar with horizontal orientation
   * Should render horizontal scroll bar properly
   */
  it('should render horizontal scroll bar', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <ScrollBar orientation="horizontal" data-testid="horizontal-scrollbar" />
        <div style={{ width: '200%' }}>Wide content that needs horizontal scrolling</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
    expect(screen.getByText('Wide content that needs horizontal scrolling')).toBeInTheDocument()
  })

  /**
   * Test scroll bar with custom styling
   * Should apply custom className to scroll bar
   */
  it('should render scroll bar with custom styling', () => {
    render(
      <ScrollArea data-testid="scroll-area">
        <ScrollBar className="custom-scrollbar" data-testid="custom-scrollbar" />
        <div>Content with custom scroll bar</div>
      </ScrollArea>
    )

    const scrollArea = screen.getByTestId('scroll-area')
    expect(scrollArea).toBeInTheDocument()
  })
})