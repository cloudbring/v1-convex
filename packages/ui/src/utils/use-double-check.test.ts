/**
 * @fileoverview Test suite for useDoubleCheck hook
 * 
 * This module tests the double-check confirmation pattern hook:
 * - Initial state management
 * - Button props generation with event handlers
 * - Keyboard interaction handling (Escape key)
 * - Click prevention on first click, allowing on second
 * 
 * This hook is commonly used for destructive actions requiring confirmation.
 */

import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDoubleCheck } from './use-double-check'

describe('useDoubleCheck Hook', () => {
  /**
   * Test initial hook state
   * Should start with doubleCheck as false
   */
  it('should initialize with doubleCheck as false', () => {
    const { result } = renderHook(() => useDoubleCheck())
    
    expect(result.current.doubleCheck).toBe(false)
    expect(typeof result.current.getButtonProps).toBe('function')
  })

  /**
   * Test first click behavior
   * Should prevent default and set doubleCheck to true
   */
  it('should set doubleCheck to true on first click', () => {
    const { result } = renderHook(() => useDoubleCheck())
    const mockEvent = { preventDefault: vi.fn() }
    
    const buttonProps = result.current.getButtonProps()
    
    act(() => {
      buttonProps.onClick?.(mockEvent as any)
    })
    
    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.doubleCheck).toBe(true)
  })

  /**
   * Test second click behavior
   * Should not prevent default when doubleCheck is true
   */
  it('should allow action on second click', () => {
    const { result } = renderHook(() => useDoubleCheck())
    const mockEvent = { preventDefault: vi.fn() }
    
    // First click to enable double check
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onClick?.(mockEvent as any)
    })
    
    expect(result.current.doubleCheck).toBe(true)
    
    // When doubleCheck is true, onClick should not preventDefault
    const buttonProps = result.current.getButtonProps()
    const secondMockEvent = { preventDefault: vi.fn() }
    
    act(() => {
      buttonProps.onClick?.(secondMockEvent as any)
    })
    
    // Should not call preventDefault on second click
    expect(secondMockEvent.preventDefault).not.toHaveBeenCalled()
  })

  /**
   * Test onBlur behavior
   * Should reset doubleCheck to false when button loses focus
   */
  it('should reset doubleCheck on blur', () => {
    const { result } = renderHook(() => useDoubleCheck())
    
    // Enable double check
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onClick?.({ preventDefault: vi.fn() } as any)
    })
    
    expect(result.current.doubleCheck).toBe(true)
    
    // Blur should reset
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onBlur?.({} as any)
    })
    
    expect(result.current.doubleCheck).toBe(false)
  })

  /**
   * Test Escape key handling
   * Should reset doubleCheck to false when Escape is pressed
   */
  it('should reset doubleCheck on Escape key', () => {
    const { result } = renderHook(() => useDoubleCheck())
    
    // Enable double check
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onClick?.({ preventDefault: vi.fn() } as any)
    })
    
    expect(result.current.doubleCheck).toBe(true)
    
    // Escape key should reset
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onKeyUp?.({ key: 'Escape' } as any)
    })
    
    expect(result.current.doubleCheck).toBe(false)
  })

  /**
   * Test other key presses
   * Should not reset doubleCheck for non-Escape keys
   */
  it('should not reset on other keys', () => {
    const { result } = renderHook(() => useDoubleCheck())
    
    // Enable double check
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onClick?.({ preventDefault: vi.fn() } as any)
    })
    
    expect(result.current.doubleCheck).toBe(true)
    
    // Other keys should not reset
    act(() => {
      const buttonProps = result.current.getButtonProps()
      buttonProps.onKeyUp?.({ key: 'Enter' } as any)
    })
    
    expect(result.current.doubleCheck).toBe(true)
  })

  /**
   * Test custom props integration
   * Should merge custom handlers with hook-generated handlers
   */
  it('should merge custom event handlers', () => {
    const { result } = renderHook(() => useDoubleCheck())
    const customClick = vi.fn()
    const customBlur = vi.fn()
    const customKeyUp = vi.fn()
    
    const buttonProps = result.current.getButtonProps({
      onClick: customClick,
      onBlur: customBlur,
      onKeyUp: customKeyUp,
    })
    
    // Test that custom handlers are called
    act(() => {
      buttonProps.onClick?.({ preventDefault: vi.fn() } as any)
      buttonProps.onBlur?.({} as any)
      buttonProps.onKeyUp?.({ key: 'Enter' } as any)
    })
    
    expect(customClick).toHaveBeenCalled()
    expect(customBlur).toHaveBeenCalled()
    expect(customKeyUp).toHaveBeenCalled()
  })
})