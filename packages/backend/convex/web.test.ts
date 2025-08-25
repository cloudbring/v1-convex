/**
 * @fileoverview Test suite for web newsletter subscription action
 * 
 * This module tests the Convex action that handles newsletter subscriptions
 * through the Loops.so service. The action:
 * - Validates email and userGroup input
 * - Makes HTTP request to Loops.so API
 * - Returns the API response
 * 
 * This is a critical user-facing feature for newsletter signup.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

// Mock the environment variables
vi.mock('./env', () => ({
  env: {
    LOOPS_FORM_ID: 'test-form-id-12345'
  }
}))

// Mock fetch for testing HTTP requests
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('Newsletter Subscription Action', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Setup convex-test environment
    const mockModules = {
      './_generated/api.js': () => import('./_generated/api.js'),
      './_generated/server.js': () => import('./_generated/server.js'),
      './schema.js': () => import('./schema.js'),
      './web.js': () => import('./web.js'),
      './env.js': () => Promise.resolve({ env: { LOOPS_FORM_ID: 'test-form-id' } })
    }
    t = convexTest(schema, mockModules)
  })

  /**
   * Test successful newsletter subscription
   * Should make API call to Loops.so with correct parameters
   */
  it('should subscribe user to newsletter successfully', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ 
        success: true, 
        id: 'subscription-123' 
      })
    })

    const result = await t.action(api.web.subscribe, {
      email: 'test@example.com',
      userGroup: 'beta-users'
    })

    // Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledWith(
      'https://app.loops.so/api/newsletter-form/test-form-id-12345',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          userGroup: 'beta-users'
        })
      }
    )

    expect(result).toEqual({
      success: true,
      id: 'subscription-123'
    })
  })

  /**
   * Test API error handling
   * Should return error response when Loops.so API fails
   */
  it('should handle API errors gracefully', async () => {
    // Mock error API response
    mockFetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValue({ 
        success: false, 
        message: 'Invalid email address' 
      })
    })

    const result = await t.action(api.web.subscribe, {
      email: 'invalid-email',
      userGroup: 'test-group'
    })

    expect(result).toEqual({
      success: false,
      message: 'Invalid email address'
    })
  })

  /**
   * Test network error handling
   * Should handle fetch failures appropriately
   */
  it('should handle network errors', async () => {
    // Mock network failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(
      t.action(api.web.subscribe, {
        email: 'test@example.com',
        userGroup: 'test-group'
      })
    ).rejects.toThrow('Network error')
  })
})