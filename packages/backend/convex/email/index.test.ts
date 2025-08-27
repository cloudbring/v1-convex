import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { sendEmail, type SendEmailOptions } from './index'

// Mock environment variables
vi.mock('../env', () => ({
  env: {
    RESEND_API_KEY: 'test-api-key',
    RESEND_SENDER_EMAIL_AUTH: 'Test App <test@example.com>'
  }
}))

/**
 * Test suite for email/index.ts - Email service integration
 * 
 * This module tests the Resend email service integration functionality.
 * Tests cover email sending, response parsing, error handling, and
 * various edge cases for the sendEmail function.
 * 
 * @see {@link ../email/index.ts} - Source file
 */
describe('Email Service Integration (email/index.ts)', () => {
  // Mock fetch globally for all tests
  const mockFetch = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = mockFetch
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendEmail Function', () => {
    it('should send email successfully with minimal options', async () => {
      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email-123' })
      })

      const options: SendEmailOptions = {
        to: 'user@example.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>'
      }

      const result = await sendEmail(options)

      expect(mockFetch).toHaveBeenCalledWith('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Test App <test@example.com>',
          to: 'user@example.com',
          subject: 'Test Subject',
          html: '<p>Test content</p>'
        })
      })

      expect(result).toEqual({
        status: 'success',
        data: { success: true, data: { id: 'email-123' } }
      })
    })

    it('should send email with multiple recipients', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email-456' })
      })

      const options: SendEmailOptions = {
        to: ['user1@example.com', 'user2@example.com'],
        subject: 'Test Subject',
        html: '<p>Test content</p>',
        text: 'Test content'
      }

      await sendEmail(options)

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.to).toEqual(['user1@example.com', 'user2@example.com'])
      expect(body.text).toBe('Test content')
    })

    it('should use default sender when env is not set', async () => {
      // Test the fallback logic by temporarily mocking undefined env
      vi.resetModules()
      
      // Mock env with undefined RESEND_SENDER_EMAIL_AUTH
      vi.doMock('../env', () => ({
        env: {
          RESEND_API_KEY: 'test-api-key',
          RESEND_SENDER_EMAIL_AUTH: undefined
        }
      }))

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'email-789' })
      })

      // Import fresh module with new env mock
      const emailModule = await import('./index?t=' + Date.now())
      await emailModule.sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      const callArgs = mockFetch.mock.calls[0][1]
      const body = JSON.parse(callArgs.body)

      expect(body.from).toBe('Convex SaaS <onboarding@resend.dev>')
      
      vi.resetModules()
    })
  })

  describe('Error Handling', () => {
    it('should handle API error with structured error response', async () => {
      const errorResponse = {
        name: 'BadRequest',
        message: 'Invalid recipient email',
        statusCode: 400
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse)
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(sendEmail({
        to: 'invalid-email',
        subject: 'Test',
        html: '<p>Test</p>'
      })).rejects.toThrow('Error sending email: Invalid recipient email')

      expect(consoleSpy).toHaveBeenCalledWith(errorResponse)
      consoleSpy.mockRestore()
    })

    it('should handle unknown error response', async () => {
      const unknownError = {
        name: 'UnknownError',
        message: 'Unknown Error',
        statusCode: 500,
        cause: new Error('Network failure')
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(unknownError)
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })).rejects.toThrow('Error sending email: Unknown Error')

      // The error object will be serialized, so check for the main properties
      expect(consoleSpy).toHaveBeenCalledWith(expect.objectContaining({
        name: 'UnknownError',
        message: 'Unknown Error',
        statusCode: 500
      }))
      consoleSpy.mockRestore()
    })

    it('should handle malformed error response', async () => {
      const malformedResponse = {
        unexpected: 'format',
        random: 'data'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve(malformedResponse)
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })).rejects.toThrow('Error sending email')

      expect(consoleSpy).toHaveBeenCalledWith(malformedResponse)
      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })).rejects.toThrow('Network error')
    })
  })

  describe('Response Parsing', () => {
    it('should parse successful response correctly', async () => {
      const successResponse = { id: 'email-success-123' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(successResponse)
      })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      expect(result.status).toBe('success')
      expect(result.data.success).toBe(true)
      expect(result.data.data).toEqual(successResponse)
    })

    it('should handle response with extra fields', async () => {
      const responseWithExtras = {
        id: 'email-extra-123',
        created_at: '2023-01-01T00:00:00Z',
        extra_field: 'should be ignored'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseWithExtras)
      })

      const result = await sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })

      // Should still succeed as long as 'id' is present
      expect(result.status).toBe('success')
      expect(result.data.data.id).toBe('email-extra-123')
    })

    it('should reject successful response without id field', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'sent' }) // Missing 'id'
      })

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(sendEmail({
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      })).rejects.toThrow('Error sending email')

      consoleSpy.mockRestore()
    })
  })

  describe('Type Definitions', () => {
    it('should accept string recipient', () => {
      const options: SendEmailOptions = {
        to: 'single@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
      }
      
      expect(options.to).toBe('single@example.com')
    })

    it('should accept array of recipients', () => {
      const options: SendEmailOptions = {
        to: ['one@example.com', 'two@example.com'],
        subject: 'Test',
        html: '<p>Test</p>'
      }
      
      expect(Array.isArray(options.to)).toBe(true)
      expect(options.to).toHaveLength(2)
    })

    it('should make text field optional', () => {
      const options: SendEmailOptions = {
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>'
        // text is optional
      }
      
      expect(options.text).toBeUndefined()
    })
  })
})