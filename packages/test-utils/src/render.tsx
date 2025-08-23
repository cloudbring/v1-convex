import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mock providers that components might need
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  )
}

/**
 * Custom render function that includes common providers
 */
export function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const user = userEvent.setup()
  
  return {
    user,
    ...rtlRender(ui, { wrapper: AllTheProviders, ...options })
  }
}

/**
 * Render hook for testing custom hooks
 */
export { renderHook } from '@testing-library/react'

/**
 * Re-export everything from React Testing Library
 */
export * from '@testing-library/react'
export { userEvent }

/**
 * Common test utilities
 */
export const testUtils = {

  /**
   * Create mock props for components
   */
  createMockProps: <T extends Record<string, any>>(overrides?: Partial<T>): T => {
    return {
      onClick: vi.fn(),
      onChange: vi.fn(),
      onSubmit: vi.fn(),
      ...overrides
    } as T
  },

  /**
   * Mock Next.js router
   */
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    route: '/',
  }
}