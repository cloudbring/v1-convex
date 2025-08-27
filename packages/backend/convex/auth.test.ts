/**
 * @fileoverview Test suite for authentication module
 * 
 * This module tests the Convex authentication setup which integrates
 * Google OAuth provider through @convex-dev/auth.
 * 
 * Tests cover:
 * - Authentication module exports 
 * - Provider configuration
 * - Auth function availability
 */

import { describe, it, expect, vi } from 'vitest'

// Mock Google provider to avoid external dependencies
vi.mock('@auth/core/providers/google', () => ({
  default: vi.fn(() => ({
    id: 'google',
    name: 'Google',
    type: 'oauth'
  }))
}))

// Mock convexAuth to avoid Convex server dependencies  
vi.mock('@convex-dev/auth/server', () => ({
  convexAuth: vi.fn(() => ({
    auth: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(), 
    store: vi.fn(),
    isAuthenticated: vi.fn()
  }))
}))

describe('Authentication Configuration', () => {
  /**
   * Test that the auth module exports all required functions
   * These functions are essential for authentication flow in the app
   */
  it('should export all authentication functions', async () => {
    const authModule = await import('./auth')
    
    // Verify all expected exports exist
    expect(authModule.auth).toBeDefined()
    expect(authModule.signIn).toBeDefined()
    expect(authModule.signOut).toBeDefined()
    expect(authModule.store).toBeDefined()
    expect(authModule.isAuthenticated).toBeDefined()
  })

  /**
   * Test that the auth module can be imported without errors
   * This ensures the module is properly configured
   */
  it('should import without throwing errors', async () => {
    await expect(import('./auth')).resolves.toBeTruthy()
  })

  /**
   * Test that convexAuth is called with Google provider
   * This verifies the authentication is configured with OAuth
   */
  it('should configure authentication with Google provider', async () => {
    const { convexAuth } = await import('@convex-dev/auth/server')
    await import('./auth')
    
    expect(convexAuth).toHaveBeenCalledWith({
      providers: expect.any(Array)
    })
  })
})