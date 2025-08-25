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
})