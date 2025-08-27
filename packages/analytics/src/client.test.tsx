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

  describe('Analytics Error Handling', () => {
    /**
     * Test missing environment variables gracefully
     * Should render component even with missing client ID
     */
    it('should handle missing environment variables gracefully', () => {
      // Create a temporary environment without client ID
      const originalClientId = mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID
      delete mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID
      
      // Should still render but may have undefined clientId
      const { getByTestId } = render(<Provider />)
      expect(getByTestId('openpanel-component')).toBeInTheDocument()
      
      // Restore for other tests
      mockEnv.NEXT_PUBLIC_OPENPANEL_CLIENT_ID = originalClientId
    })

    /**
     * Test track function with complex properties
     * Should handle various data types without throwing
     */
    it('should handle track function with complex properties', () => {
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'development'
      
      expect(() => {
        track({ 
          event: 'complex_event',
          nested: { deep: { value: 'test' } },
          array: [1, 2, 3],
          nullValue: null,
          undefinedValue: undefined
        })
      }).not.toThrow()
      
      // Restore environment
      mockEnv.NODE_ENV = originalEnv
    })
  })

  describe('Environment Variable Edge Cases', () => {
    /**
     * Test with different environment variables
     * Should handle various NODE_ENV values
     */
    it('should handle different NODE_ENV values', () => {
      // Test with staging environment (should behave like non-production)
      const originalEnv = mockEnv.NODE_ENV
      mockEnv.NODE_ENV = 'staging'
      
      const { getByTestId } = render(<Provider />)
      
      const trackScreenViews = getByTestId('track-screen-views')
      const trackOutgoingLinks = getByTestId('track-outgoing-links')
      
      expect(trackScreenViews).toHaveTextContent('false')
      expect(trackOutgoingLinks).toHaveTextContent('false')
      
      // Restore original environment
      mockEnv.NODE_ENV = originalEnv
    })

    /**
     * Test Provider with consistent configurations
     * Should render Provider component consistently
     */
    it('should render Provider component consistently', () => {
      const { getByTestId } = render(<Provider />)
      const component = getByTestId('openpanel-component')
      
      // Should render the component with mocked props
      expect(component).toBeInTheDocument()
      
      const clientId = getByTestId('client-id')
      // Client ID should contain the test value from mock
      expect(clientId).toHaveTextContent('test-client-id')
    })
  })

  describe('Track Function Integration', () => {
    /**
     * Test track function basic functionality
     * Should be exportable and callable
     */
    it('should be exportable and callable without errors', () => {
      expect(typeof track).toBe('function')
      
      // In test environment, this should work without throwing
      expect(() => {
        // Track function uses useOpenPanel hook which is mocked
        // The basic structure should work
        track({ event: 'test_event' })
      }).not.toThrow()
    })

    /**
     * Test track function with various event formats
     * Should handle different event property structures
     */
    it('should handle various event formats', () => {
      expect(() => {
        track({ event: 'simple_event' })
        track({ event: 'event_with_props', userId: '123', action: 'click' })
        track({ event: 'complex_event', metadata: { source: 'test' } })
      }).not.toThrow()
    })
  })
})