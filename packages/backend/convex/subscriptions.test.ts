import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'
import { createTestUser } from '@v1/test-utils/convex'

// Mock the Polar component
vi.mock('@convex-dev/polar', () => ({
  Polar: vi.fn().mockImplementation(() => ({
    api: () => ({
      changeCurrentSubscription: vi.fn(),
      cancelCurrentSubscription: vi.fn(),
      listAllProducts: vi.fn()
    }),
    checkoutApi: () => ({
      generateCheckoutLink: vi.fn(),
      generateCustomerPortalUrl: vi.fn()
    }),
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active',
      product: { name: 'Pro Plan' }
    }),
    cancelSubscription: vi.fn().mockResolvedValue(true)
  }))
}))

describe('Subscriptions', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    t = convexTest(schema)
  })

  describe('getUserInfo function', () => {
    it('should return user info for authenticated user with email', async () => {
      const alice = createTestUser(t, {
        subject: 'test-alice-subscription',
        email: 'alice@example.com'
      })

      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      // The getUserInfo function is used internally by polar
      // We can test it indirectly by testing subscription functions
      const user = await alice.query(api.users.getUser)
      expect(user?.email).toBe('alice@example.com')
      expect(user?._id).toBeDefined()
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
      const alice = createTestUser(t, {
        subject: 'test-alice-integration',
        email: 'alice@example.com'
      })

      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      const user = await alice.query(api.users.getUser)
      
      // The subscription should be included in user data
      expect(user?.subscription).toBeDefined()
    })
  })
})