/**
 * @fileoverview Test suite for Select components
 * 
 * This module tests the Select component family built on Radix UI:
 * - Select root component for dropdown select functionality
 * - SelectTrigger for opening select options
 * - SelectContent for options container
 * - SelectItem for individual options
 * - SelectValue for displaying selected value
 * 
 * Select components provide accessible dropdown selection interface.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { 
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel
} from './select'

describe('Select Components', () => {
  /**
   * Test select component exports
   * Should export all necessary select components
   */
  it('should export all select components', () => {
    expect(Select).toBeDefined()
    expect(SelectTrigger).toBeDefined()
    expect(SelectContent).toBeDefined()
    expect(SelectItem).toBeDefined()
    expect(SelectValue).toBeDefined()
    expect(SelectGroup).toBeDefined()
    expect(SelectLabel).toBeDefined()
  })

  /**
   * Test basic select rendering
   * Should render select trigger with placeholder
   */
  it('should render select trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select an option..." />
        </SelectTrigger>
      </Select>
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('role', 'combobox')
  })

  /**
   * Test select with options
   * Should render select with selectable options
   */
  it('should render select with options', () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Choose..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
          <SelectItem value="option3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('Choose...')).toBeInTheDocument()
  })

  /**
   * Test select with custom styling
   * Should apply custom className to select trigger
   */
  it('should apply custom className to select trigger', () => {
    render(
      <Select>
        <SelectTrigger className="custom-select" data-testid="select-trigger">
          <SelectValue placeholder="Custom Select" />
        </SelectTrigger>
      </Select>
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toHaveClass('custom-select')
  })

  /**
   * Test select with grouped options
   * Should render select with option groups and labels
   */
  it('should render select with grouped options', () => {
    render(
      <Select>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group 1</SelectLabel>
            <SelectItem value="g1-option1">Group 1 Option 1</SelectItem>
            <SelectItem value="g1-option2">Group 1 Option 2</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Group 2</SelectLabel>
            <SelectItem value="g2-option1">Group 2 Option 1</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeInTheDocument()
  })

  /**
   * Test disabled select
   * Should render disabled select trigger
   */
  it('should render disabled select', () => {
    render(
      <Select disabled>
        <SelectTrigger data-testid="select-trigger">
          <SelectValue placeholder="Disabled Select" />
        </SelectTrigger>
      </Select>
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeDisabled()
  })

  /**
   * Test select with default value
   * Should render select with pre-selected value
   */
  it('should render select with default value', () => {
    render(
      <Select defaultValue="default-option">
        <SelectTrigger data-testid="select-trigger">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default-option">Default Option</SelectItem>
          <SelectItem value="other-option">Other Option</SelectItem>
        </SelectContent>
      </Select>
    )

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeInTheDocument()
  })
})