import { convexTest } from 'convex-test'
import { vi } from 'vitest'

export type ConvexTestInstance = ReturnType<typeof convexTest>

/**
 * Create a test user with identity for authenticated testing
 */
export function createTestUser(t: ConvexTestInstance, userData?: {
  name?: string
  email?: string
  subject?: string
}) {
  const defaultData = {
    subject: `test-user-${Math.random()}`,
    name: 'Test User',
    email: 'test@example.com',
    ...userData
  }
  
  return t.withIdentity(defaultData)
}

/**
 * Create multiple test users for testing user interactions
 */
export function createTestUsers(t: ConvexTestInstance, count: number = 2) {
  const users = []
  for (let i = 0; i < count; i++) {
    users.push(createTestUser(t, {
      subject: `test-user-${i}`,
      name: `Test User ${i + 1}`,
      email: `test${i + 1}@example.com`
    }))
  }
  return users
}

/**
 * Seed test data for consistent testing
 */
export async function seedTestData(t: ConvexTestInstance) {
  return await t.run(async (ctx) => {
    // Create test users
    const users = []
    for (let i = 0; i < 3; i++) {
      const userId = await ctx.db.insert('users', {
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        username: `testuser${i + 1}`,
        isAnonymous: false
      })
      users.push(userId)
    }
    
    return { users }
  })
}

/**
 * Clean up test data after tests
 */
export async function cleanTestData(t: ConvexTestInstance) {
  return await t.run(async (ctx) => {
    // Clean up test users
    const users = await ctx.db.query('users').collect()
    for (const user of users) {
      if (user.email?.includes('test') || user.name?.includes('Test')) {
        await ctx.db.delete(user._id)
      }
    }
  })
}

/**
 * Create test storage file
 */
export async function createTestFile(t: ConvexTestInstance, content = 'test file content') {
  return await t.run(async (ctx) => {
    const blob = new Blob([content], { type: 'text/plain' })
    return await ctx.storage.store(blob)
  })
}

/**
 * Mock external services for testing
 */
export const mockServices = {
  email: {
    send: vi.fn().mockResolvedValue({ success: true }),
  },
  storage: {
    upload: vi.fn().mockResolvedValue('mock-storage-id'),
    delete: vi.fn().mockResolvedValue(true),
  }
}