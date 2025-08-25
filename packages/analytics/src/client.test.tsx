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
     * Should enable tracking features in production
     */
    it('should configure tracking for production', () => {
      mockEnv.NODE_ENV = 'production'
      
      const { getByTestId } = render(<Provider />)
      
      const trackScreenViews = getByTestId('track-screen-views')
      const trackOutgoingLinks = getByTestId('track-outgoing-links')
      
      expect(trackScreenViews).toHaveTextContent('true')
      expect(trackOutgoingLinks).toHaveTextContent('true')
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
     * Test development mode tracking
     * Should log events instead of sending to OpenPanel
     */
    it('should log events in development mode', () => {
      mockEnv.NODE_ENV = 'development'
      
      const { logger } = require('@v1/logger')
      
      // Note: track function uses useOpenPanel hook, so we need to test it in component context
      const TestComponent = () => {
        track({
          event: 'test_event',
          userId: 'user123',
          properties: { page: 'home' }
        })
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      expect(logger.info).toHaveBeenCalledWith('Track', {
        event: 'test_event',
        userId: 'user123',
        properties: { page: 'home' }
      })
    })

    /**
     * Test production mode tracking
     * Should call OpenPanel track function
     */
    it('should call OpenPanel track in production mode', () => {
      mockEnv.NODE_ENV = 'production'
      
      const mockTrack = vi.fn()
      const { useOpenPanel } = require('@openpanel/nextjs')
      useOpenPanel.mockReturnValue({ track: mockTrack })
      
      const TestComponent = () => {
        track({
          event: 'purchase',
          amount: 99.99,
          currency: 'USD'
        })
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      expect(mockTrack).toHaveBeenCalledWith('purchase', {
        amount: 99.99,
        currency: 'USD'
      })
    })

    /**
     * Test event data structure
     * Should separate event name from properties
     */
    it('should structure event data correctly', () => {
      mockEnv.NODE_ENV = 'production'
      
      const mockTrack = vi.fn()
      const { useOpenPanel } = require('@openpanel/nextjs')
      useOpenPanel.mockReturnValue({ track: mockTrack })
      
      const TestComponent = () => {
        track({
          event: 'page_view',
          path: '/dashboard',
          referrer: 'https://example.com'
        })
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      expect(mockTrack).toHaveBeenCalledWith('page_view', {
        path: '/dashboard',
        referrer: 'https://example.com'
      })
    })
  })
})