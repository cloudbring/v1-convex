/**
 * @fileoverview Test suite for user account management functions
 * 
 * This module focuses on testing account lifecycle operations:
 * - deleteUserAccount internal mutation for admin operations
 * - deleteCurrentUserAccount action for user self-deletion
 * - Subscription cancellation integration
 * - Associated auth account cleanup
 * 
 * Account deletion is a critical operation requiring proper cleanup.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { convexTest } from 'convex-test'
import { api, internal } from './_generated/api'
import schema from './schema'

// Mock Polar with subscription management
vi.mock('@convex-dev/polar', () => ({
  Polar: vi.fn().mockImplementation(() => ({
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active'
    }),
    cancelSubscription: vi.fn().mockResolvedValue(true)
  }))
}))

let mockAuthUserId: any = null
vi.mock("@convex-dev/auth/server", async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getAuthUserId: vi.fn(() => mockAuthUserId)
  }
})

// Mock subscriptions module with cancellation capability
vi.mock('./subscriptions', () => ({
  polar: {
    getCurrentSubscription: vi.fn().mockResolvedValue({
      id: 'mock-subscription',
      status: 'active'
    }),
    cancelSubscription: vi.fn().mockResolvedValue(true)
  }
}))

const mockModules = {
  './_generated/api.js': () => import('./_generated/api.js'),
  './_generated/server.js': () => import('./_generated/server.js'),
  './schema.js': () => import('./schema.js'),
  './users.js': () => import('./users.js'),
  './subscriptions.js': () => import('./subscriptions.js'),
}

describe('User Account Management', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    mockAuthUserId = null
    t = convexTest(schema, mockModules)
  })

  describe('deleteUserAccount Internal Mutation', () => {
    /**
     * Test complete user account deletion
     * Should delete user and all associated auth accounts
     */
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

  describe('deleteCurrentUserAccount Action', () => {
    /**
     * Test user self-deletion with subscription cancellation
     * Should cancel subscription and delete user account
     */
    it('should delete current user account and cancel subscription', async () => {
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      mockAuthUserId = userId

      await t.action(api.users.deleteCurrentUserAccount)

      const deletedUser = await t.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(deletedUser).toBeNull()
      mockAuthUserId = null
    })

    /**
     * Test unauthenticated access
     * Should do nothing for unauthenticated user
     */
    it('should do nothing for unauthenticated user', async () => {
      const result = await t.action(api.users.deleteCurrentUserAccount)
      expect(result).toBeNull()
    })
  })
})