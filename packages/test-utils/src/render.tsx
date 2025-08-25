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
  const result = rtlRender(ui, { wrapper: AllTheProviders, ...options });
  
  // Create userEvent instance after render
  const user = userEvent.setup();
  
  return {
    ...result,
    user,
  };
}

/**
 * Render hook for testing custom hooks
 */
export { renderHook } from '@testing-library/react'

/**
 * Re-export everything EXCEPT render from React Testing Library
 */
export {
  act,
  cleanup,
  configure,
  fireEvent,
  getConfig,
  getDefaultNormalizer,
  getRoles,
  isInaccessible,
  logRoles,
  queries,
  queryHelpers,
  within,
  getQueriesForElement,
  buildQueries,
  getElementError,
  getMultipleElementsFoundError,
  makeFindQuery,
  makeGetAllQuery,
  makeSingleQuery,
  queryAllByAttribute,
  queryByAttribute,
  wrapAllByQueryWithSuggestion,
  wrapSingleQueryWithSuggestion,
  waitFor,
  waitForElementToBeRemoved,
  getNodeText,
  createEvent,
  screen,
  logDOM,
  prettyDOM,
  prettyFormat,
  getSuggestedQuery,
  // Query exports
  findAllByLabelText,
  findByLabelText,
  getAllByLabelText,
  getByLabelText,
  queryAllByLabelText,
  queryByLabelText,
  findAllByPlaceholderText,
  findByPlaceholderText,
  getAllByPlaceholderText,
  getByPlaceholderText,
  queryAllByPlaceholderText,
  queryByPlaceholderText,
  findAllByText,
  findByText,
  getAllByText,
  getByText,
  queryAllByText,
  queryByText,
  findAllByDisplayValue,
  findByDisplayValue,
  getAllByDisplayValue,
  getByDisplayValue,
  queryAllByDisplayValue,
  queryByDisplayValue,
  findAllByAltText,
  findByAltText,
  getAllByAltText,
  getByAltText,
  queryAllByAltText,
  queryByAltText,
  findAllByTitle,
  findByTitle,
  getAllByTitle,
  getByTitle,
  queryAllByTitle,
  queryByTitle,
  findAllByRole,
  findByRole,
  getAllByRole,
  getByRole,
  queryAllByRole,
  queryByRole,
  findAllByTestId,
  findByTestId,
  getAllByTestId,
  getByTestId,
  queryAllByTestId,
  queryByTestId,
} from '@testing-library/react'
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