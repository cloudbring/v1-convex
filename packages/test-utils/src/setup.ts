import { vi } from 'vitest'
import { createElement } from 'react'

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
    vi.spyOn(window.location, 'assign').mockImplementation(() => {})
    vi.spyOn(window.location, 'replace').mockImplementation(() => {})
    vi.spyOn(window.location, 'reload').mockImplementation(() => {})
  }

  // Mock localStorage
  const mockStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
  }
  
  Object.defineProperty(global, 'localStorage', { value: { ...mockStorage } })
  Object.defineProperty(global, 'sessionStorage', { value: { ...mockStorage } })

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
    notFound: vi.fn()
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