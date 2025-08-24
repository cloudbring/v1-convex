import {
  type RenderOptions,
  render as rtlRender,
} from "@testing-library/react";
import userEvent from '@testing-library/user-event'
import type React from "react";
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
  options?: Omit<RenderOptions, "wrapper">,
) {
  return {
    user: userEvent,
    ...rtlRender(ui, { wrapper: AllTheProviders, ...options }),
  };
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
    const defaultProps = {
      onClick: vi.fn(),
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    };

    return {
      ...defaultProps,
      ...overrides,
    } as unknown as T;
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