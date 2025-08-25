/**
 * @fileoverview Test suite for UI utility functions
 * 
 * This module tests core utility functions used throughout the UI package:
 * - callAll function for combining multiple event handlers
 * - cn function for conditional class name merging with Tailwind CSS
 * 
 * These utilities are fundamental to component composition and styling.
 */

import { describe, it, expect, vi } from 'vitest'
import { callAll, cn } from './index'

describe('Utility Functions', () => {
  describe('callAll', () => {
    /**
     * Test that callAll executes all provided functions
     * This is essential for combining multiple event handlers
     */
    it('should call all provided functions with arguments', () => {
      const fn1 = vi.fn()
      const fn2 = vi.fn()
      const fn3 = vi.fn()
      
      const combined = callAll(fn1, fn2, fn3)
      combined('arg1', 'arg2')
      
      expect(fn1).toHaveBeenCalledWith('arg1', 'arg2')
      expect(fn2).toHaveBeenCalledWith('arg1', 'arg2')
      expect(fn3).toHaveBeenCalledWith('arg1', 'arg2')
    })

    /**
     * Test handling of undefined functions
     * Should safely skip undefined handlers without errors
     */
    it('should handle undefined functions gracefully', () => {
      const fn1 = vi.fn()
      const fn3 = vi.fn()
      
      const combined = callAll(fn1, undefined, fn3)
      
      expect(() => combined('test')).not.toThrow()
      expect(fn1).toHaveBeenCalledWith('test')
      expect(fn3).toHaveBeenCalledWith('test')
    })

    /**
     * Test empty function list
     * Should return a function that does nothing
     */
    it('should handle empty function list', () => {
      const combined = callAll()
      expect(() => combined('test')).not.toThrow()
    })
  })

  describe('cn (className utility)', () => {
    /**
     * Test basic class name merging
     * Should combine multiple class names into a single string
     */
    it('should merge class names', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toContain('class1')
      expect(result).toContain('class2') 
      expect(result).toContain('class3')
    })

    /**
     * Test conditional class names
     * Should only include classes that evaluate to truthy
     */
    it('should handle conditional class names', () => {
      const result = cn('base', true && 'conditional', false && 'excluded')
      expect(result).toContain('base')
      expect(result).toContain('conditional')
      expect(result).not.toContain('excluded')
    })

    /**
     * Test Tailwind CSS class conflict resolution
     * Should merge conflicting Tailwind classes properly
     */
    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-4 py-2', 'px-6')
      // Should resolve px conflict, keeping later px-6
      expect(result).toContain('px-6')
      expect(result).toContain('py-2')
      expect(result).not.toMatch(/px-4/)
    })

    /**
     * Test empty input handling
     * Should return empty string for no classes
     */
    it('should handle empty inputs', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
})