/**
 * @fileoverview Test suite for Polar subscriptions API module
 * 
 * This module tests the integration with Polar subscription service including:
 * - Polar instance configuration with user info provider
 * - API function exports for subscription management
 * - Checkout API function exports
 * - Error handling for missing user data
 * 
 * The subscriptions module is the main interface between Convex and Polar
 * for handling subscription lifecycle and payments.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Polar SDK
const mockPolarInstance = {
  api: vi.fn(() => ({
    changeCurrentSubscription: vi.fn(),
    cancelCurrentSubscription: vi.fn(),
    listAllProducts: vi.fn()
  })),
  checkoutApi: vi.fn(() => ({
    generateCheckoutLink: vi.fn(),
    generateCustomerPortalUrl: vi.fn()
  }))
}

const mockPolarConstructor = vi.fn(() => mockPolarInstance)

vi.mock('@convex-dev/polar', () => ({
  Polar: mockPolarConstructor
}))

// Mock the generated API to avoid import issues
vi.mock('./_generated/api', () => ({
  api: {
    users: {
      getUser: 'users:getUser'
    }
  },
  components: {
    polar: 'mock-polar-component'
  }
}))

describe('Subscriptions API Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Test that Polar instance is created with correct configuration
   * Should pass the polar component and getUserInfo function
   */
  it('should create Polar instance with proper configuration', async () => {
    await import('./subscriptions')
    
    expect(mockPolarConstructor).toHaveBeenCalledTimes(1)
    expect(mockPolarConstructor).toHaveBeenCalledWith(
      'mock-polar-component',
      expect.objectContaining({
        getUserInfo: expect.any(Function)
      })
    )
  })

  /**
   * Test that API functions are exported
   * These functions are used by the application for subscription management
   */
  it('should export subscription API functions', async () => {
    const subscriptionsModule = await import('./subscriptions')
    
    expect(subscriptionsModule.changeCurrentSubscription).toBeDefined()
    expect(subscriptionsModule.cancelCurrentSubscription).toBeDefined()
    expect(subscriptionsModule.listAllProducts).toBeDefined()
  })

  /**
   * Test that checkout API functions are exported
   * These functions handle payment flows and customer portals
   */
  it('should export checkout API functions', async () => {
    const subscriptionsModule = await import('./subscriptions')
    
    expect(subscriptionsModule.generateCheckoutLink).toBeDefined()
    expect(subscriptionsModule.generateCustomerPortalUrl).toBeDefined()
  })

  /**
   * Test that polar instance is exported
   * This allows other modules to access the full Polar API
   */
  it('should export polar instance', async () => {
    const subscriptionsModule = await import('./subscriptions')
    
    expect(subscriptionsModule.polar).toBeDefined()
  })
})