/**
 * @fileoverview Test suite for Icons module
 * 
 * This module tests the icon exports and component availability:
 * - Icon object structure and exports
 * - Individual icon component availability
 * - Lucide React integration
 * 
 * Icons provide consistent iconography across the application.
 */

import { describe, it, expect } from 'vitest'
import { Icons } from './icons'

describe('Icons Module', () => {
  /**
   * Test Icons object structure
   * Should export an object with all expected icon components
   */
  it('should export Icons object with expected icons', () => {
    expect(Icons).toBeDefined()
    expect(typeof Icons).toBe('object')
  })

  /**
   * Test SignOut icon availability
   * Should export SignOut icon component from Lucide
   */
  it('should export SignOut icon', () => {
    expect(Icons.SignOut).toBeDefined()
    expect(typeof Icons.SignOut).toBe('object')
  })

  /**
   * Test Copy icon availability
   * Should export Copy icon component from Lucide
   */
  it('should export Copy icon', () => {
    expect(Icons.Copy).toBeDefined()
    expect(typeof Icons.Copy).toBe('object')
  })

  /**
   * Test Check icon availability
   * Should export Check icon component from Lucide
   */
  it('should export Check icon', () => {
    expect(Icons.Check).toBeDefined()
    expect(typeof Icons.Check).toBe('object')
  })

  /**
   * Test Loader icon availability
   * Should export Loader icon component (mapped from Loader2)
   */
  it('should export Loader icon', () => {
    expect(Icons.Loader).toBeDefined()
    expect(typeof Icons.Loader).toBe('object')
  })

  /**
   * Test all icons are React components
   * Each icon should be a valid React functional component
   */
  it('should export valid React components', () => {
    const iconKeys = Object.keys(Icons) as Array<keyof typeof Icons>
    
    iconKeys.forEach(key => {
      const IconComponent = Icons[key]
      expect(IconComponent).toBeDefined()
    })
  })

  /**
   * Test icon naming consistency
   * Should have consistent naming pattern
   */
  it('should have consistent icon naming', () => {
    const expectedIcons = ['SignOut', 'Copy', 'Check', 'Loader']
    
    expectedIcons.forEach(iconName => {
      expect(Icons).toHaveProperty(iconName)
    })
    
    expect(Object.keys(Icons)).toEqual(expect.arrayContaining(expectedIcons))
  })
})