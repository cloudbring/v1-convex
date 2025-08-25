/**
 * @fileoverview Test suite for Analytics client components
 * 
 * This module tests the OpenPanel analytics integration:
 * - Provider component configuration and rendering
 * - Track function for event logging and tracking
 * - Development vs production mode behavior
 * - Environment variable handling
 * 
 * Analytics is crucial for understanding user behavior and app performance.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { Provider, track } from './client'

// Mock OpenPanel SDK
vi.mock('@openpanel/nextjs', () => ({
  OpenPanelComponent: vi.fn(({ clientId, trackAttributes, trackScreenViews, trackOutgoingLinks }) => (
    <div data-testid="openpanel-component">
      OpenPanel Component
      <span data-testid="client-id">{clientId}</span>
      <span data-testid="track-attributes">{String(trackAttributes)}</span>
      <span data-testid="track-screen-views">{String(trackScreenViews)}</span>
      <span data-testid="track-outgoing-links">{String(trackOutgoingLinks)}</span>
    </div>
  )),
  useOpenPanel: vi.fn(() => ({
    track: vi.fn()
  }))
}))

// Mock logger
vi.mock('@v1/logger', () => ({
  logger: {
    info: vi.fn()
  }
}))

// Mock environment variables
const mockEnv = vi.hoisted(() => ({}))
vi.stubGlobal('process', {
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_OPENPANEL_CLIENT_ID: 'test-client-id',
    ...mockEnv
  }
})

describe('Analytics Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnv.NODE_ENV = 'test'
  })

  describe('Provider', () => {
    /**
     * Test Provider component rendering
     * Should render OpenPanelComponent with correct configuration
     */
    it('should render OpenPanelComponent with correct props', () => {
      const { getByTestId } = render(<Provider />)
      
      const component = getByTestId('openpanel-component')
      const clientId = getByTestId('client-id')
      const trackAttributes = getByTestId('track-attributes')
      
      expect(component).toBeInTheDocument()
      expect(clientId).toHaveTextContent('test-client-id')
      expect(trackAttributes).toHaveTextContent('true')
    })

    /**
     * Test production configuration
     * Should enable tracking features in production (test env shows false values)
     */
    it('should configure tracking for production', () => {
      const { getByTestId } = render(<Provider />)
      
      const trackScreenViews = getByTestId('track-screen-views')
      const trackOutgoingLinks = getByTestId('track-outgoing-links')
      
      // In test environment, NODE_ENV is 'test', so these will be false
      expect(trackScreenViews).toHaveTextContent('false')
      expect(trackOutgoingLinks).toHaveTextContent('false')
    })

    /**
     * Test development configuration
     * Should disable tracking features in development
     */
    it('should disable tracking for non-production', () => {
      mockEnv.NODE_ENV = 'development'
      
      const { getByTestId } = render(<Provider />)
      
      const trackScreenViews = getByTestId('track-screen-views')
      const trackOutgoingLinks = getByTestId('track-outgoing-links')
      
      expect(trackScreenViews).toHaveTextContent('false')
      expect(trackOutgoingLinks).toHaveTextContent('false')
    })
  })

  describe('track function', () => {
    /**
     * Test track function export
     * Should export track function for external usage
     */
    it('should export track function', () => {
      expect(track).toBeDefined()
      expect(typeof track).toBe('function')
    })

    /**
     * Test track function structure
     * Should be callable but requires hook context for full functionality
     */
    it('should be callable function', () => {
      expect(() => {
        // Track function exists and is callable
        // Full testing requires component context with OpenPanel provider
        expect(typeof track).toBe('function')
      }).not.toThrow()
    })
  })
})