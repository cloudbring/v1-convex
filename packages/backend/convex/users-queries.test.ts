/**
 * @fileoverview Test suite for user query functions
 * 
 * This module focuses specifically on testing user query operations:
 * - getUser query with various authentication states
 * - User data retrieval with subscription integration
 * - Image URL generation for user avatars
 * - Unauthenticated access handling
 * 
 * Queries are read-only operations that fetch user data from the database.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

// Mock the Polar component completely
vi.mock('@convex-dev/polar', () => ({
  Polar: vi.fn().mockImplementation(() => ({
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active',
      product: { name: 'Pro Plan' }
    })
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
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active',
      product: { name: 'Pro Plan' }
    })
  }
}))

const mockModules = {
  './_generated/api.js': () => import('./_generated/api.js'),
  './_generated/server.js': () => import('./_generated/server.js'),
  './schema.js': () => import('./schema.js'),
  './users.js': () => import('./users.js'),
  './subscriptions.js': () => import('./subscriptions.js'),
}

describe('User Query Functions', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    // Reset authentication mock before each test
    mockAuthUserId = null
    t = convexTest(schema, mockModules)
    
    // Apply Blob mock for Node.js compatibility
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

  describe('getUser Query', () => {
    /**
     * Test unauthenticated user access
     * Should return null when no user is authenticated
     */
    it('should return null for unauthenticated user', async () => {
      const result = await t.query(api.users.getUser)
      expect(result).toBeNull()
    })

    /**
     * Test authenticated user data retrieval
     * Should return complete user object with subscription data
     */
    it('should return user data with subscription info for authenticated user', async () => {
      // Create a user in the database
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alicetest',
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

    /**
     * Test user with image avatar
     * Should return image URL when user has an uploaded image
     */
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
})