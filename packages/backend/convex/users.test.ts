import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { getAuthUserId } from "@convex-dev/auth/server"
import { api, internal } from './_generated/api'
import schema from './schema'
import { createTestUser } from '../../test-utils/src/convex-helpers'

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

// Mock getAuthUserId to control authentication in tests
let mockAuthUserId: any = null
vi.mock("@convex-dev/auth/server", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getAuthUserId: vi.fn(() => mockAuthUserId)
  }
})

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

// Mock the glob functionality that convex-test expects
const mockModules = {
  './_generated/api.js': () => import('./_generated/api.js'),
  './_generated/server.js': () => import('./_generated/server.js'),
  './schema.js': () => import('./schema.js'),
  './users.js': () => import('./users.js'),
  './subscriptions.js': () => import('./subscriptions.js'),
}

describe('Users Functions', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    // Reset authentication mock before each test
    mockAuthUserId = null
    
    t = convexTest(schema, mockModules)
    
    // Ensure Blob mock is applied for each test
    if (typeof globalThis.Blob !== 'undefined') {
      const OriginalBlob = globalThis.Blob;
      globalThis.Blob = class MockBlob extends OriginalBlob {
        constructor(parts?: BlobPart[], options?: BlobPropertyBag) {
          super(parts || [], options);
        }
        
        async arrayBuffer(): Promise<ArrayBuffer> {
          // Create a simple ArrayBuffer for testing
          const buffer = new ArrayBuffer(8);
          const view = new Uint8Array(buffer);
          for (let i = 0; i < 8; i++) {
            view[i] = i;
          }
          return buffer;
        }
      } as any;
    }
  })

  describe('getUser', () => {
    it('should return undefined for unauthenticated user', async () => {
      const result = await t.query(api.users.getUser)
      // Convex functions that return early with 'return;' may return null in tests
      expect(result).toBeNull()
    })

    it('should return user data with subscription info for authenticated user', async () => {
      // Create a user in the database
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alicetest', // Valid username without underscore
          isAnonymous: false
        })
      })

      // Mock getAuthUserId to return our created user ID
      mockAuthUserId = userId

      const user = await t.query(api.users.getUser)
      
      expect(user).toBeDefined()
      expect(user?.name).toBe('alicetest') // username takes precedence
      expect(user?.email).toBe('alice@example.com')
      expect(user?.subscription).toBeDefined()
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should return image URL when user has an image', async () => {
      // Create user with image
      const userId = await t.run(async (ctx) => {
        // Create a test file
        const blob = new Blob(['test image'], { type: 'image/png' })
        const imageId = await ctx.storage.store(blob)

        // Create user with image
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          imageId,
          isAnonymous: false
        })
      })

      // Mock getAuthUserId to return our created user ID
      mockAuthUserId = userId

      const user = await t.query(api.users.getUser)
      
      expect(user?.avatarUrl).toBeDefined()
      expect(user?.avatarUrl).toContain('http')
      
      // Reset mock
      mockAuthUserId = null
    })
  })

  describe('updateUsername', () => {
    it('should update username for authenticated user', async () => {
      // Create user first
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      // Set authentication to point to this user
      mockAuthUserId = userId

      await t.mutation(api.users.updateUsername, {
        username: 'alicenew' // Valid username without underscore
      })

      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.username).toBe('alicenew')
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should throw error for invalid username', async () => {
      // Create user first
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      // Set authentication to point to this user
      mockAuthUserId = userId

      await expect(
        t.mutation(api.users.updateUsername, {
          username: 'a' // Too short
        })
      ).rejects.toThrow()
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should do nothing for unauthenticated user', async () => {
      const result = await t.mutation(api.users.updateUsername, {
        username: 'newusername'
      })

      expect(result).toBeNull()
    })
  })

  describe('generateUploadUrl', () => {
    it('should generate upload URL for authenticated user', async () => {
      // generateUploadUrl just needs authentication, not a user in DB
      // But let's create a minimal user ID for the mock
      const mockId = 'user-123' as any

      // Set authentication
      mockAuthUserId = mockId

      const uploadUrl = await t.mutation(api.users.generateUploadUrl)
      
      expect(uploadUrl).toBeDefined()
      expect(uploadUrl).toContain('http')
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should throw error for unauthenticated user', async () => {
      await expect(
        t.mutation(api.users.generateUploadUrl)
      ).rejects.toThrow('User not found')
    })
  })

  describe('updateUserImage', () => {
    it('should update user image for authenticated user', async () => {
      const { userId, imageId } = await t.run(async (ctx) => {
        const userId = await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })

        const blob = new Blob(['new image'], { type: 'image/png' })
        const imageId = await ctx.storage.store(blob)

        return { userId, imageId }
      })

      // Set authentication
      mockAuthUserId = userId

      await t.mutation(api.users.updateUserImage, { imageId })

      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.imageId).toBe(imageId)
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should do nothing for unauthenticated user', async () => {
      const imageId = await t.run(async (ctx) => {
        const blob = new Blob(['test'], { type: 'image/png' })
        return await ctx.storage.store(blob)
      })

      const result = await t.mutation(api.users.updateUserImage, { imageId })
      expect(result).toBeNull()
    })
  })

  describe('removeUserImage', () => {
    it('should remove user image for authenticated user', async () => {
      const userId = await t.run(async (ctx) => {
        const blob = new Blob(['image'], { type: 'image/png' })
        const imageId = await ctx.storage.store(blob)

        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          imageId,
          image: 'old-image-url',
          isAnonymous: false
        })
      })

      // Set authentication
      mockAuthUserId = userId

      await t.mutation(api.users.removeUserImage)

      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.imageId).toBeUndefined()
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should do nothing for unauthenticated user', async () => {
      const result = await t.mutation(api.users.removeUserImage)
      expect(result).toBeNull()
    })
  })

  describe('deleteUserAccount', () => {
    it('should delete user and associated auth accounts', async () => {
      const { userId, authAccountId } = await t.run(async (ctx) => {
        const userId = await ctx.db.insert('users', {
          name: 'Test User',
          email: 'test@example.com',
          isAnonymous: false
        })

        const authAccountId = await ctx.db.insert('authAccounts', {
          userId,
          provider: 'google',
          providerAccountId: 'google-123'
        })

        return { userId, authAccountId }
      })

      await t.mutation(internal.users.deleteUserAccount, { userId })

      const deletedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      const deletedAuthAccount = await t.run(async (ctx) => {
        return await ctx.db.get(authAccountId)
      })

      expect(deletedUser).toBeNull()
      expect(deletedAuthAccount).toBeNull()
    })
  })

  describe('deleteCurrentUserAccount', () => {
    it('should delete current user account and cancel subscription', async () => {
      // Create a user in the database first
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      // Set up authentication to point to this user
      mockAuthUserId = userId

      // This is an action, so we test it as such
      await t.action(api.users.deleteCurrentUserAccount)

      // Verify the user was deleted
      const deletedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(deletedUser).toBeNull()
      
      // Reset mock
      mockAuthUserId = null
    })

    it('should do nothing for unauthenticated user', async () => {
      const result = await t.action(api.users.deleteCurrentUserAccount)
      expect(result).toBeNull()
    })
  })
})