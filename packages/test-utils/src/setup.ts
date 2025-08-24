import { createElement } from 'react'
import { vi } from "vitest";

/**
 * Global test setup utilities
 */

/**
 * Mock window APIs commonly needed in tests
 */
export function setupGlobalMocks() {
  // Mock crypto API
// Safer crypto mocking: polyfill if missing, otherwise spy on existing methods
const mockCrypto = {
  randomUUID: () => 'mock-uuid',
  getRandomValues: (arr: Uint8Array) => arr.fill(1),
  subtle: { digest: vi.fn().mockResolvedValue(new ArrayBuffer(0)) }
} as any

if (!globalThis.crypto) {
  // Define a configurable crypto when it's completely missing
  Object.defineProperty(globalThis, 'crypto', {
    value: mockCrypto,
    configurable: true
  })
} else {
  // Spy or override individual methods
  if (typeof globalThis.crypto.randomUUID === 'function') {
    vi.spyOn(globalThis.crypto, 'randomUUID').mockImplementation(mockCrypto.randomUUID)
  } else {
    ;(globalThis.crypto as any).randomUUID = mockCrypto.randomUUID
  }

  if (typeof globalThis.crypto.getRandomValues === 'function') {
    vi.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation(mockCrypto.getRandomValues)
  } else {
    ;(globalThis.crypto as any).getRandomValues = mockCrypto.getRandomValues
  }

  // Ensure subtle exists, then spy or override its digest
  ;(globalThis.crypto as any).subtle ??= {}
  if (typeof (globalThis.crypto as any).subtle.digest === 'function') {
    vi.spyOn((globalThis.crypto as any).subtle, 'digest').mockImplementation(mockCrypto.subtle.digest)
  } else {
    ;(globalThis.crypto as any).subtle.digest = mockCrypto.subtle.digest
  }
}

  // Mock window.location methods safely
  if (typeof window !== 'undefined' && window.location) {
    try {
      vi.spyOn(window.location, "assign").mockImplementation(() => {});
    } catch (e) {
      // Property might already be mocked or non-configurable
    }
    try {
      vi.spyOn(window.location, "replace").mockImplementation(() => {});
    } catch (e) {
      // Property might already be mocked or non-configurable
    }
    try {
      vi.spyOn(window.location, "reload").mockImplementation(() => {});
    } catch (e) {
      // Property might already be mocked or non-configurable
    }
  }

  // Mock localStorage / sessionStorage with independent, stateful instances
  const createStorageMock = () => {
    const store = new Map<string, string>()
    return {
      getItem: vi.fn((k: string) => (store.has(k) ? store.get(k)! : null)),
      setItem: vi.fn((k: string, v: string) => { store.set(String(k), String(v)) }),
      removeItem: vi.fn((k: string) => { store.delete(k) }),
      clear: vi.fn(() => { store.clear() }),
      key: vi.fn((i: number) => Array.from(store.keys())[Number(i)] ?? null),
      get length() { return store.size }
    }
  }
  const mockLocalStorage = createStorageMock()
  const mockSessionStorage = createStorageMock()
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    configurable: true,
    writable: true
  })
  Object.defineProperty(globalThis, 'sessionStorage', {
    value: mockSessionStorage,
    configurable: true,
    writable: true
  })
  // Mock fetch
  global.fetch = vi.fn()

  // Mock console methods for cleaner test output
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn()
  }
}

/**
 * Setup fake timers for time-dependent tests
 */
export function setupFakeTimers() {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2024-01-01'))
}

/**
 * Cleanup fake timers
 */
export function cleanupFakeTimers() {
  vi.useRealTimers()
}

/**
 * Mock Next.js modules
 */
export function setupNextJsMocks() {
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/'
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    notFound: () => {
      const err: any = new Error('NEXT_NOT_FOUND')
      err.digest = 'NEXT_NOT_FOUND'
      throw err
    }
  }))
  vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) =>
      createElement('img', { src, alt, ...props })
  }))

  vi.mock('next/link', () => ({
    default: ({ children, ...props }: any) =>
      createElement('a', { ...props }, children)
  }))
}

/**
 * Mock Convex client
 */
export function setupConvexMocks() {
  vi.mock('convex/react', () => ({
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useAction: vi.fn(),
    ConvexProvider: ({ children }: any) => children,
    ConvexReactClient: vi.fn()
  }))
}

/**
 * Reset all mocks between tests
 */
export function resetMocks() {
  vi.clearAllMocks()
  vi.resetAllMocks()
  localStorage.clear()
  sessionStorage.clear()
}