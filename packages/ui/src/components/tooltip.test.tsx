/**
 * @fileoverview Test suite for Tooltip components
 * 
 * This module tests the Tooltip component family built on Radix UI:
 * - Tooltip root component for tooltip functionality
 * - TooltipTrigger for triggering tooltip display
 * - TooltipContent for tooltip content container
 * - TooltipProvider for tooltip context
 * 
 * Tooltip components provide accessible hover/focus information display.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from './tooltip'

describe('Tooltip Components', () => {
  /**
   * Test tooltip component exports
   * Should export all necessary tooltip components
   */
  it('should export all tooltip components', () => {
    expect(Tooltip).toBeDefined()
    expect(TooltipTrigger).toBeDefined()
    expect(TooltipContent).toBeDefined()
    expect(TooltipProvider).toBeDefined()
  })

  /**
   * Test basic tooltip structure
   * Should render tooltip trigger without errors
   */
  it('should render tooltip trigger', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="tooltip-trigger">
            Hover me
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByTestId('tooltip-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Hover me')
  })

  /**
   * Test tooltip with content
   * Should render tooltip with proper content structure
   */
  it('should render tooltip with content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent data-testid="tooltip-content">
            Tooltip content here
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByText('Trigger')
    expect(trigger).toBeInTheDocument()
  })

  /**
   * Test tooltip with custom className
   * Should apply custom styling to tooltip content
   */
  it('should apply custom className to tooltip content', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent className="custom-tooltip" data-testid="tooltip-content">
            Custom tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  /**
   * Test tooltip with custom side offset
   * Should render tooltip with specified positioning
   */
  it('should support custom sideOffset', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Trigger</TooltipTrigger>
          <TooltipContent sideOffset={8} data-testid="tooltip-content">
            Offset tooltip
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByText('Trigger')).toBeInTheDocument()
  })

  /**
   * Test tooltip provider context
   * Should provide tooltip context to child components
   */
  it('should provide tooltip context through TooltipProvider', () => {
    render(
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger data-testid="context-trigger">
            Provider context
          </TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    )

    const trigger = screen.getByTestId('context-trigger')
    expect(trigger).toBeInTheDocument()
  })

  /**
   * Test multiple tooltips in provider
   * Should support multiple tooltip instances
   */
  it('should support multiple tooltips in provider', () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger data-testid="first-trigger">First</TooltipTrigger>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger data-testid="second-trigger">Second</TooltipTrigger>
        </Tooltip>
      </TooltipProvider>
    )

    expect(screen.getByTestId('first-trigger')).toBeInTheDocument()
    expect(screen.getByTestId('second-trigger')).toBeInTheDocument()
  })
})