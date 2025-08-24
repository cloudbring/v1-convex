/// <reference types="@testing-library/jest-dom" />
/// <reference types="vitest/globals" />

declare global {
  namespace Vi {
    interface JestAssertion<T = unknown> extends jest.Matchers<void, T> {}
  }
}

export type {};
