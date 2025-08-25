/**
 * @fileoverview Test suite for user image management functions
 * 
 * This module focuses on testing user image-related operations:
 * - updateUserImage mutation for setting profile images
 * - removeUserImage mutation for clearing profile images  
 * - Proper handling of storage IDs and file cleanup
 * - Authentication requirements for image operations
 * 
 * Image management involves Convex file storage integration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

// Mock Polar and auth modules
vi.mock('@convex-dev/polar', () => ({
  Polar: vi.fn().mockImplementation(() => ({}))
}))

let mockAuthUserId: any = null
vi.mock("@convex-dev/auth/server", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getAuthUserId: vi.fn(() => mockAuthUserId)
  }
})

vi.mock('./subscriptions', () => ({ polar: {} }))

const mockModules = {
  './_generated/api.js': () => import('./_generated/api.js'),
  './_generated/server.js': () => import('./_generated/server.js'),
  './schema.js': () => import('./schema.js'),
  './users.js': () => import('./users.js'),
  './subscriptions.js': () => import('./subscriptions.js'),
}

describe('User Image Management', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
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

  describe('updateUserImage Mutation', () => {
    /**
     * Test successful image update
     * Should associate image with user profile
     */
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

      mockAuthUserId = userId

      await t.mutation(api.users.updateUserImage, { imageId })

      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.imageId).toBe(imageId)
      mockAuthUserId = null
    })

    /**
     * Test unauthenticated access
     * Should do nothing for unauthenticated user
     */
    it('should do nothing for unauthenticated user', async () => {
      const imageId = await t.run(async (ctx) => {
        const blob = new Blob(['test'], { type: 'image/png' })
        return await ctx.storage.store(blob)
      })

      const result = await t.mutation(api.users.updateUserImage, { imageId })
      expect(result).toBeNull()
    })
  })

  describe('removeUserImage Mutation', () => {
    /**
     * Test successful image removal
     * Should clear imageId from user profile
     */
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

      mockAuthUserId = userId

      await t.mutation(api.users.removeUserImage)

      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.imageId).toBeUndefined()
      mockAuthUserId = null
    })

    /**
     * Test unauthenticated access
     * Should do nothing for unauthenticated user
     */
    it('should do nothing for unauthenticated user', async () => {
      const result = await t.mutation(api.users.removeUserImage)
      expect(result).toBeNull()
    })
  })
})