import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'
import { createTestUser } from '../../test-utils/src/convex-helpers'

// Mock getAuthUserId to control authentication in tests
let mockAuthUserId: any = null
vi.mock("@convex-dev/auth/server", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getAuthUserId: vi.fn(() => mockAuthUserId)
  }
})

// Mock the Polar component completely
vi.mock('@convex-dev/polar', () => ({
  Polar: vi.fn().mockImplementation(() => ({
    api: vi.fn(() => ({
      changeCurrentSubscription: vi.fn().mockResolvedValue({ success: true }),
      cancelCurrentSubscription: vi.fn().mockResolvedValue({ success: true }),
      listAllProducts: vi.fn().mockResolvedValue([])
    })),
    checkoutApi: vi.fn(() => ({
      generateCheckoutLink: vi.fn().mockResolvedValue('https://checkout.example.com'),
      generateCustomerPortalUrl: vi.fn().mockResolvedValue('https://portal.example.com')
    })),
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active',
      product: { name: 'Pro Plan' }
    }),
    cancelSubscription: vi.fn().mockResolvedValue(true)
  }))
}))

// Mock the subscriptions module to avoid Polar initialization issues
vi.mock('./subscriptions', () => ({
  polar: {
    api: () => ({
      changeCurrentSubscription: vi.fn().mockResolvedValue({ success: true }),
      cancelCurrentSubscription: vi.fn().mockResolvedValue({ success: true }),
      listAllProducts: vi.fn().mockResolvedValue([])
    }),
    checkoutApi: () => ({
      generateCheckoutLink: vi.fn().mockResolvedValue('https://checkout.example.com'),
      generateCustomerPortalUrl: vi.fn().mockResolvedValue('https://portal.example.com')
    }),
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active',
      product: { name: 'Pro Plan' }
    }),
    cancelSubscription: vi.fn().mockResolvedValue(true)
  },
  changeCurrentSubscription: vi.fn().mockResolvedValue({ success: true }),
  cancelCurrentSubscription: vi.fn().mockResolvedValue({ success: true }),
  listAllProducts: vi.fn().mockResolvedValue([]),
  generateCheckoutLink: vi.fn().mockResolvedValue('https://checkout.example.com'),
  generateCustomerPortalUrl: vi.fn().mockResolvedValue('https://portal.example.com')
}))

describe('Subscriptions', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    // Reset authentication mock before each test
    mockAuthUserId = null
    
    // Pass modules object with generated files
    const mockModules = {
      './_generated/api.js': () => import('./_generated/api.js'),
      './_generated/server.js': () => import('./_generated/server.js'),
      './schema.js': () => import('./schema.js'),
      './users.js': () => import('./users.js'),
      './subscriptions.js': () => import('./subscriptions.js'),
    }
    t = convexTest(schema, mockModules)
  })

  describe('getUserInfo function', () => {
    it('should return user info for authenticated user with email', async () => {
      // Create user in database first
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alicetest', // Valid username
          isAnonymous: false
        })
      })

      // Set authentication to point to this user
      mockAuthUserId = userId

      // The getUserInfo function is used internally by polar
      // We can test it indirectly by testing subscription functions
      const user = await t.query(api.users.getUser)
      expect(user?.email).toBe('alice@example.com')
      expect(user?._id).toBeDefined()
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should handle user without email', async () => {
      const alice = createTestUser(t, {
        subject: 'test-alice-no-email'
      })

      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          // No email provided
          isAnonymous: false
        })
      })

      const user = await alice.query(api.users.getUser)
      expect(user?.email).toBeUndefined()
    })
  })

  describe('subscription API functions', () => {
    it('should be available for import', () => {
      // Test that all exported functions are available
      expect(api.subscriptions?.listAllProducts).toBeDefined()
      expect(api.subscriptions?.changeCurrentSubscription).toBeDefined()
      expect(api.subscriptions?.cancelCurrentSubscription).toBeDefined()
      expect(api.subscriptions?.generateCheckoutLink).toBeDefined()
      expect(api.subscriptions?.generateCustomerPortalUrl).toBeDefined()
    })
  })

  describe('subscription integration', () => {
    it('should work with user queries', async () => {
      // Create user in database first
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alicetest', // Valid username
          isAnonymous: false
        })
      })

      // Set authentication to point to this user
      mockAuthUserId = userId

      const user = await t.query(api.users.getUser)
      
      // The subscription should be included in user data
      expect(user?.subscription).toBeDefined()
      
      // Reset mock
      mockAuthUserId = null
    })
  })
})