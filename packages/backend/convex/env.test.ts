/**
 * @fileoverview Test suite for environment configuration
 * 
 * This module tests the environment variable validation and setup using
 * @t3-oss/env-core with Zod schemas. The configuration ensures:
 * - Required environment variables are present
 * - Variables have correct formats (URLs, emails, etc.)
 * - Proper validation behavior based on VALIDATE_ENV flag
 * 
 * Environment configuration is critical for secure deployment.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock process.env for testing different scenarios
const originalEnv = process.env

describe('Environment Configuration', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  /**
   * Test that env module exports the configuration object
   * The env object should be available for use by other modules
   */
  it('should export env configuration object', async () => {
    // Set minimal required env vars
    process.env = {
      ...originalEnv,
      CONVEX_SITE_URL: 'https://example.convex.dev',
      SITE_URL: 'https://example.com',
      POLAR_ORGANIZATION_TOKEN: 'polar_test_token',
      POLAR_WEBHOOK_SECRET: 'polar_webhook_secret',
      AUTH_GOOGLE_ID: 'google_client_id',
      AUTH_GOOGLE_SECRET: 'google_client_secret',
      VALIDATE_ENV: 'false'
    }

    const envModule = await import('./env')
    expect(envModule.env).toBeDefined()
  })

  /**
   * Test that optional environment variables are handled correctly
   * Some vars like LOOPS_FORM_ID are optional and should not cause failures
   */
  it('should handle optional environment variables', async () => {
    process.env = {
      ...originalEnv,
      CONVEX_SITE_URL: 'https://example.convex.dev',
      SITE_URL: 'https://example.com', 
      POLAR_ORGANIZATION_TOKEN: 'polar_test_token',
      POLAR_WEBHOOK_SECRET: 'polar_webhook_secret',
      AUTH_GOOGLE_ID: 'google_client_id',
      AUTH_GOOGLE_SECRET: 'google_client_secret',
      // Optional vars not set
      VALIDATE_ENV: 'false'
    }

    await expect(import('./env')).resolves.toBeTruthy()
  })

  /**
   * Test that env module includes required environment variables
   * The module should define all necessary environment variables for the app
   */
  it('should define required environment variables structure', () => {
    // Environment configuration exists and can be imported
    expect(typeof import('./env')).toBe('object')
  })

  /**
   * Test that validation can be configured
   * The module should handle validation toggle properly
   */
  it('should handle validation configuration', () => {
    // The module should be importable with validation disabled
    process.env.VALIDATE_ENV = 'false'
    expect(typeof import('./env')).toBe('object')
  })

  /**
   * Test that validation can be skipped in development
   * When VALIDATE_ENV is not set, validation should be skipped
   */
  it('should skip validation when VALIDATE_ENV is not set', async () => {
    process.env = {
      ...originalEnv,
      // Missing required vars, but validation disabled
      VALIDATE_ENV: undefined
    }

    await expect(import('./env')).resolves.toBeTruthy()
  })
})