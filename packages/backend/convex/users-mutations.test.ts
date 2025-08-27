/**
 * @fileoverview Test suite for user mutation functions
 * 
 * This module focuses on testing user mutation operations:
 * - updateUsername mutation with validation
 * - generateUploadUrl for file uploads
 * - updateUserImage and removeUserImage operations
 * - Authentication requirements for mutations
 * 
 * Mutations modify user data and require proper authentication.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api } from './_generated/api'
import schema from './schema'

// Mock the Polar component completely
vi.mock('@convex-dev/polar', () => ({
  Polar: vi.fn().mockImplementation(() => ({}))
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

// Mock the subscriptions module
vi.mock('./subscriptions', () => ({ polar: {} }))

const mockModules = {
  './_generated/api.js': () => import('./_generated/api.js'),
  './_generated/server.js': () => import('./_generated/server.js'),
  './schema.js': () => import('./schema.js'),
  './users.js': () => import('./users.js'),
  './subscriptions.js': () => import('./subscriptions.js'),
}

describe('User Mutation Functions', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    mockAuthUserId = null
    t = convexTest(schema, mockModules)
  })

  describe('updateUsername Mutation', () => {
    /**
     * Test successful username update
     * Should update username for authenticated user
     */
    it('should update username for authenticated user', async () => {
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      mockAuthUserId = userId

      await t.mutation(api.users.updateUsername, {
        username: 'alicenew'
      })

      const updatedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.username).toBe('alicenew')
      mockAuthUserId = null
    })

    /**
     * Test username validation
     * Should reject invalid usernames per validation rules
     */
    it('should throw error for invalid username', async () => {
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      mockAuthUserId = userId

      await expect(
        t.mutation(api.users.updateUsername, {
          username: 'a' // Too short
        })
      ).rejects.toThrow()
      
      mockAuthUserId = null
    })

    /**
     * Test unauthenticated access
     * Should do nothing for unauthenticated user
     */
    it('should do nothing for unauthenticated user', async () => {
      const result = await t.mutation(api.users.updateUsername, {
        username: 'newusername'
      })

      expect(result).toBeNull()
    })
  })

  describe('generateUploadUrl Mutation', () => {
    /**
     * Test successful upload URL generation
     * Should generate URL for authenticated user
     */
    it('should generate upload URL for authenticated user', async () => {
      const mockId = 'user-123' as any
      mockAuthUserId = mockId

      const uploadUrl = await t.mutation(api.users.generateUploadUrl)
      
      expect(uploadUrl).toBeDefined()
      expect(uploadUrl).toContain('http')
      
      mockAuthUserId = null
    })

    /**
     * Test unauthenticated access
     * Should throw error for unauthenticated user
     */
    it('should throw error for unauthenticated user', async () => {
      await expect(
        t.mutation(api.users.generateUploadUrl)
      ).rejects.toThrow('User not found')
    })
  })
})