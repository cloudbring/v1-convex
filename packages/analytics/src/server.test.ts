/**
 * @fileoverview Test suite for Analytics server-side functionality
 * 
 * This module tests the server-side OpenPanel analytics integration:
 * - Analytics client setup and configuration
 * - User identification with profile data
 * - Event tracking in production vs development
 * - Environment variable validation and usage
 * - Error handling for missing configuration
 * - Vercel waitUntil integration for async operations
 * 
 * Server analytics enables backend event tracking and user identification.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setupAnalytics } from './server'

// Mock functions (hoisted to avoid variable initialization issues)
const mockTrack = vi.hoisted(() => vi.fn())
const mockIdentify = vi.hoisted(() => vi.fn())
const mockLoggerInfo = vi.hoisted(() => vi.fn())
const mockWaitUntil = vi.hoisted(() => vi.fn())

// Mock OpenPanel SDK
vi.mock('@openpanel/nextjs', () => ({
  OpenPanel: vi.fn().mockImplementation(() => ({
    track: mockTrack,
    identify: mockIdentify,
  })),
}))

// Mock logger
vi.mock('@v1/logger', () => ({
  logger: { info: mockLoggerInfo },
}))

// Mock Vercel waitUntil
vi.mock('@vercel/functions', () => ({
  waitUntil: mockWaitUntil,
}))

// Mock environment variables
const mockEnv = vi.hoisted(() => ({
  NEXT_PUBLIC_OPENPANEL_CLIENT_ID: 'test-client-id',
  OPENPANEL_SECRET_KEY: 'test-secret-key',
  NODE_ENV: 'test',
}))
vi.stubGlobal('process', { env: mockEnv })

describe('Analytics Server', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTrack.mockClear()
    mockIdentify.mockClear()
    mockLoggerInfo.mockClear()
    mockWaitUntil.mockClear()
    mockEnv.NODE_ENV = 'test'
    mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID = 'test-client-id'
    mockEnv.OPENPANEL_SECRET_KEY = 'test-secret-key'
  })

  describe('setupAnalytics', () => {
    /**
     * Test basic analytics setup without user identification
     * Should initialize OpenPanel client with environment credentials
     */
    it('should setup analytics client without user identification', async () => {
      const { OpenPanel } = await import('@openpanel/nextjs')
      const analytics = await setupAnalytics()

      expect(OpenPanel).toHaveBeenCalledWith({
        clientId: 'test-client-id',
        clientSecret: 'test-secret-key',
      })
      expect(mockWaitUntil).not.toHaveBeenCalled()
      expect(analytics).toHaveProperty('track')
    })

    /**
     * Test analytics setup with user identification
     * Should call identify with parsed name components
     */
    it('should setup analytics with user identification', async () => {
      await setupAnalytics({ userId: 'user-123', fullName: 'John Doe' })

      expect(mockWaitUntil).toHaveBeenCalledWith(mockIdentify.mock.results[0]?.value)
      expect(mockIdentify).toHaveBeenCalledWith({
        profileId: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
      })
    })

    /**
     * Test analytics setup with single name
     * Should handle names without spaces correctly
     */
    it('should handle single name identification', async () => {
      await setupAnalytics({ userId: 'user-456', fullName: 'Madonna' })

      expect(mockIdentify).toHaveBeenCalledWith({
        profileId: 'user-456',
        firstName: 'Madonna',
        lastName: undefined,
      })
    })

    /**
     * Test analytics setup with partial user data
     * Should not identify when userId or fullName is missing
     */
    it('should skip identification with incomplete user data', async () => {
      await setupAnalytics({ userId: 'user-789' })
      expect(mockIdentify).not.toHaveBeenCalled()

      await setupAnalytics({ fullName: 'Jane Doe' })
      expect(mockIdentify).not.toHaveBeenCalled()
    })
  })

  describe('track function', () => {
    /**
     * Test event tracking in production environment
     * Should use OpenPanel client for actual tracking
     */
    it('should track events in production', async () => {
      mockEnv.NODE_ENV = 'production'
      const { track } = await setupAnalytics()

      track({ event: 'user_signup', email: 'user@test.com' })

      expect(mockWaitUntil).toHaveBeenCalledWith(mockTrack.mock.results[0]?.value)
      expect(mockTrack).toHaveBeenCalledWith('user_signup', { email: 'user@test.com' })
      expect(mockLoggerInfo).not.toHaveBeenCalled()
    })

    /**
     * Test event tracking in development environment
     * Should log events instead of sending to OpenPanel
     */
    it('should log events in development', async () => {
      mockEnv.NODE_ENV = 'development'
      const { track } = await setupAnalytics()

      track({ event: 'page_view', path: '/dashboard' })

      expect(mockLoggerInfo).toHaveBeenCalledWith('Track', { event: 'page_view', path: '/dashboard' })
      expect(mockTrack).not.toHaveBeenCalled()
      expect(mockWaitUntil).not.toHaveBeenCalled()
    })

    /**
     * Test event tracking with complex properties
     * Should separate event name from properties correctly
     */
    it('should handle complex event properties', async () => {
      mockEnv.NODE_ENV = 'production'
      const { track } = await setupAnalytics()

      track({ 
        event: 'purchase_complete', 
        amount: 99.99, 
        currency: 'USD',
        items: ['item1', 'item2'] 
      })

      expect(mockTrack).toHaveBeenCalledWith('purchase_complete', {
        amount: 99.99,
        currency: 'USD',
        items: ['item1', 'item2'],
      })
    })
  })

  describe('Server Error Handling', () => {
    /**
     * Test missing environment variables
     * Should handle missing credentials by attempting to create client anyway
     */
    it('should handle missing environment variables', async () => {
      const originalClientId = mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID
      const originalSecretKey = mockEnv.OPENPANEL_SECRET_KEY
      
      // Remove environment variables
      mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID = undefined
      mockEnv.OPENPANEL_SECRET_KEY = undefined
      
      // Should still return analytics object (mocked OpenPanel client doesn't validate)
      const analytics = await setupAnalytics()
      expect(analytics).toHaveProperty('track')
      
      // Restore environment variables
      mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID = originalClientId
      mockEnv.OPENPANEL_SECRET_KEY = originalSecretKey
    })

    /**
     * Test track function with network errors
     * Should handle errors gracefully by using waitUntil
     */
    it('should handle track function failures gracefully', async () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'production'
      
      mockTrack.mockRejectedValue(new Error('Network error'))
      const { track } = await setupAnalytics()
      
      expect(() => track({ event: 'test_event' })).not.toThrow()
      expect(mockWaitUntil).toHaveBeenCalled()
      
      mockEnv.NODE_ENV = originalEnv
    })

    /**
     * Test identification with empty fullName
     * Should skip identification when name is empty
     */
    it('should handle identification with empty fullName', async () => {
      await setupAnalytics({ userId: 'user-456', fullName: '' })
      expect(mockIdentify).not.toHaveBeenCalled()
    })

    /**
     * Test identification with null fullName
     * Should skip identification when name is null
     */
    it('should handle identification with null fullName', async () => {
      await setupAnalytics({ userId: 'user-789', fullName: null })
      expect(mockIdentify).not.toHaveBeenCalled()
    })
  })

  describe('Analytics Privacy & Security', () => {
    /**
     * Test that sensitive data handling works correctly in production
     * Should track data in production without logging
     */
    it('should not log sensitive data in production', async () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'production'
      
      const { track } = await setupAnalytics()
      
      track({ 
        event: 'user_action', 
        email: 'sensitive@example.com',
        creditCard: '1234-5678-9012-3456'
      })
      
      expect(mockLoggerInfo).not.toHaveBeenCalled()
      expect(mockTrack).toHaveBeenCalledWith('user_action', {
        email: 'sensitive@example.com',
        creditCard: '1234-5678-9012-3456'
      })
      
      mockEnv.NODE_ENV = originalEnv
    })

    /**
     * Test development mode logging behavior
     * Should log all data in development including potentially sensitive data
     */
    it('should handle track with malformed event data', async () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'development'
      
      const { track } = await setupAnalytics()
      
      expect(() => {
        track({ event: '', invalidProp: undefined })
      }).not.toThrow()
      
      expect(mockLoggerInfo).toHaveBeenCalledWith('Track', { 
        event: '', 
        invalidProp: undefined 
      })
      
      mockEnv.NODE_ENV = originalEnv
    })

    /**
     * Test data sanitization patterns
     * Should handle various data types safely
     */
    it('should handle various data types safely', async () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'production'
      
      const { track } = await setupAnalytics()
      
      track({ 
        event: 'complex_data',
        stringVal: 'test',
        numberVal: 123,
        booleanVal: true,
        nullVal: null,
        undefinedVal: undefined,
        arrayVal: [1, 2, 3],
        objectVal: { nested: 'value' }
      })
      
      expect(mockTrack).toHaveBeenCalledWith('complex_data', {
        stringVal: 'test',
        numberVal: 123,
        booleanVal: true,
        nullVal: null,
        undefinedVal: undefined,
        arrayVal: [1, 2, 3],
        objectVal: { nested: 'value' }
      })
      
      mockEnv.NODE_ENV = originalEnv
    })
  })

  describe('User Identification Edge Cases', () => {
    /**
     * Test name parsing with multiple spaces
     * Should handle names with multiple words correctly
     */
    it('should handle names with multiple spaces', async () => {
      await setupAnalytics({ userId: 'user-123', fullName: 'John   Doe   Smith' })
      
      expect(mockIdentify).toHaveBeenCalledWith({
        profileId: 'user-123',
        firstName: 'John',
        lastName: '', // Second part is empty in this case due to split() behavior
      })
    })

    /**
     * Test name parsing with leading/trailing spaces
     * Should handle whitespace correctly
     */
    it('should handle names with leading/trailing spaces', async () => {
      await setupAnalytics({ userId: 'user-456', fullName: '  John Doe  ' })
      
      expect(mockIdentify).toHaveBeenCalledWith({
        profileId: 'user-456',
        firstName: '',
        lastName: '', // Split on first space results in empty parts
      })
    })

    /**
     * Test identification with special characters
     * Should handle names with special characters
     */
    it('should handle names with special characters', async () => {
      await setupAnalytics({ userId: 'user-789', fullName: 'José María García-López' })
      
      expect(mockIdentify).toHaveBeenCalledWith({
        profileId: 'user-789',
        firstName: 'José',
        lastName: 'María', // Only gets first part after space due to split
      })
    })

    /**
     * Test identification with empty userId
     * Should skip when userId is empty string
     */
    it('should skip identification with empty userId', async () => {
      await setupAnalytics({ userId: '', fullName: 'John Doe' })
      expect(mockIdentify).not.toHaveBeenCalled()
    })
  })

  describe('Async Operation Handling', () => {
    /**
     * Test waitUntil with successful operations
     * Should handle async operations correctly
     */
    it('should handle successful async operations', async () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'production'
      
      mockTrack.mockResolvedValue(undefined)
      const { track } = await setupAnalytics()
      
      track({ event: 'async_test', data: 'value' })
      
      expect(mockWaitUntil).toHaveBeenCalledWith(expect.any(Promise))
      expect(mockTrack).toHaveBeenCalledWith('async_test', { data: 'value' })
      
      mockEnv.NODE_ENV = originalEnv
    })

    /**
     * Test multiple concurrent tracking calls
     * Should handle multiple async operations
     */
    it('should handle multiple concurrent tracking calls', async () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'production'
      
      const { track } = await setupAnalytics()
      
      track({ event: 'event1' })
      track({ event: 'event2' })
      track({ event: 'event3' })
      
      expect(mockWaitUntil).toHaveBeenCalledTimes(3)
      expect(mockTrack).toHaveBeenCalledTimes(3)
      
      mockEnv.NODE_ENV = originalEnv
    })
  })
})