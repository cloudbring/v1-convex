import { describe, it, expect } from 'vitest'
import { username } from './validators'

describe('Username Validator', () => {
  it('should accept valid usernames', () => {
    const validUsernames = [
      'user123',
      'testuser',
      'abc',
      'USER',
      'User123',
      'a1b2c3'
    ]

    validUsernames.forEach(name => {
      const result = username.safeParse(name)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(name.toLowerCase())
      }
    })
  })

  it('should reject usernames that are too short', () => {
    const result = username.safeParse('ab')
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain('least 3')
  })

  it('should reject usernames that are too long', () => {
    const longUsername = 'a'.repeat(33)
    const result = username.safeParse(longUsername)
    expect(result.success).toBe(false)
    expect(result.error?.errors[0]?.message).toContain('most 32')
  })

  it('should reject usernames with special characters', () => {
    const invalidUsernames = [
      'user@name',
      'user-name',
      'user_name',
      'user.name',
      'user name',
      'user#123',
      'user$'
    ]

    invalidUsernames.forEach(name => {
      const result = username.safeParse(name)
      expect(result.success).toBe(false)
      expect(result.error?.errors[0]?.message).toContain('alphanumeric')
    })
  })

  it('should trim whitespace from usernames', () => {
    const result = username.safeParse('  testuser  ')
    expect(result.success).toBe(true)
    expect(result.data).toBe('testuser')
  })

  it('should convert usernames to lowercase', () => {
    const result = username.safeParse('TestUser123')
    expect(result.success).toBe(true)
    expect(result.data).toBe('testuser123')
  })

  it('should reject empty strings', () => {
    const result = username.safeParse('')
    expect(result.success).toBe(false)
  })

  it('should reject null and undefined', () => {
    expect(username.safeParse(null).success).toBe(false)
    expect(username.safeParse(undefined).success).toBe(false)
  })
})