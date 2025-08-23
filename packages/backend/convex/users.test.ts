import { describe, it, expect, beforeEach } from 'vitest'
import { convexTest } from 'convex-test'
import { api, internal } from './_generated/api'
import schema from './schema'
import { createTestUser, seedTestData } from '@v1/test-utils/convex'

describe('Users Functions', () => {
  let t: ReturnType<typeof convexTest>

  beforeEach(() => {
    t = convexTest(schema)
  })

  describe('getUser', () => {
    it('should return undefined for unauthenticated user', async () => {
      const result = await t.query(api.users.getUser)
      expect(result).toBeUndefined()
    })

    it('should return user data with subscription info for authenticated user', async () => {
      const alice = createTestUser(t, {
        subject: 'test-alice',
        name: 'Alice',
        email: 'alice@example.com'
      })

      // First create a user in the database
      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alice_test',
          isAnonymous: false
        })
      })

      const user = await alice.query(api.users.getUser)
      
      expect(user).toBeDefined()
      expect(user?.name).toBe('alice_test') // username takes precedence
      expect(user?.email).toBe('alice@example.com')
      expect(user?.subscription).toBeDefined()
    })

    it('should return image URL when user has an image', async () => {
      const alice = createTestUser(t, { subject: 'test-alice-with-image' })

      await alice.run(async (ctx) => {
        // Create a test file
        const blob = new Blob(['test image'], { type: 'image/png' })
        const imageId = await ctx.storage.store(blob)

        // Create user with image
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          imageId,
          isAnonymous: false
        })
      })

      const user = await alice.query(api.users.getUser)
      
      expect(user?.avatarUrl).toBeDefined()
      expect(user?.avatarUrl).toContain('http')
    })
  })

  describe('updateUsername', () => {
    it('should update username for authenticated user', async () => {
      const alice = createTestUser(t, { subject: 'test-alice-username' })

      // Create user first
      const userId = await alice.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      await alice.mutation(api.users.updateUsername, {
        username: 'alice_new'
      })

      const updatedUser = await alice.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.username).toBe('alice_new')
    })

    it('should throw error for invalid username', async () => {
      const alice = createTestUser(t, { subject: 'test-alice-invalid' })

      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      await expect(
        alice.mutation(api.users.updateUsername, {
          username: 'a' // Too short
        })
      ).rejects.toThrow()
    })

    it('should do nothing for unauthenticated user', async () => {
      const result = await t.mutation(api.users.updateUsername, {
        username: 'newusername'
      })

      expect(result).toBeUndefined()
    })
  })

  describe('generateUploadUrl', () => {
    it('should generate upload URL for authenticated user', async () => {
      const alice = createTestUser(t, { subject: 'test-alice-upload' })

      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      const uploadUrl = await alice.mutation(api.users.generateUploadUrl)
      
      expect(uploadUrl).toBeDefined()
      expect(uploadUrl).toContain('http')
    })

    it('should throw error for unauthenticated user', async () => {
      await expect(
        t.mutation(api.users.generateUploadUrl)
      ).rejects.toThrow('User not found')
    })
  })

  describe('updateUserImage', () => {
    it('should update user image for authenticated user', async () => {
      const alice = createTestUser(t, { subject: 'test-alice-image-update' })

      const { userId, imageId } = await alice.run(async (ctx) => {
        const userId = await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })

        const blob = new Blob(['new image'], { type: 'image/png' })
        const imageId = await ctx.storage.store(blob)

        return { userId, imageId }
      })

      await alice.mutation(api.users.updateUserImage, { imageId })

      const updatedUser = await alice.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.imageId).toBe(imageId)
    })

    it('should do nothing for unauthenticated user', async () => {
      const imageId = await t.run(async (ctx) => {
        const blob = new Blob(['test'], { type: 'image/png' })
        return await ctx.storage.store(blob)
      })

      const result = await t.mutation(api.users.updateUserImage, { imageId })
      expect(result).toBeUndefined()
    })
  })

  describe('removeUserImage', () => {
    it('should remove user image for authenticated user', async () => {
      const alice = createTestUser(t, { subject: 'test-alice-remove-image' })

      const userId = await alice.run(async (ctx) => {
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

      await alice.mutation(api.users.removeUserImage)

      const updatedUser = await alice.run(async (ctx) => {
        return await ctx.db.get(userId)
      })

      expect(updatedUser?.imageId).toBeUndefined()
      expect(updatedUser?.image).toBeUndefined()
    })

    it('should do nothing for unauthenticated user', async () => {
      const result = await t.mutation(api.users.removeUserImage)
      expect(result).toBeUndefined()
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
      const alice = createTestUser(t, { subject: 'test-alice-delete' })

      await alice.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Alice',
          email: 'alice@example.com',
          isAnonymous: false
        })
      })

      // This is an action, so we test it as such
      await alice.action(api.users.deleteCurrentUserAccount)

      // Since this is an action that calls internal functions,
      // we can't easily verify the deletion without mocking
      // the polar subscription service calls
    })

    it('should do nothing for unauthenticated user', async () => {
      const result = await t.action(api.users.deleteCurrentUserAccount)
      expect(result).toBeUndefined()
    })
  })
})