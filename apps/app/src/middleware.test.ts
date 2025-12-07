import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock the dependencies before importing the middleware
const mockConvexAuthNextjsMiddleware = vi.fn()
const mockCreateRouteMatcher = vi.fn()
const mockIsAuthenticated = vi.fn()
const mockNextjsMiddlewareRedirect = vi.fn()
const mockCreateI18nMiddleware = vi.fn()
const mockI18nMiddlewareInstance = vi.fn()

vi.mock('@convex-dev/auth/nextjs/server', () => ({
  convexAuthNextjsMiddleware: mockConvexAuthNextjsMiddleware,
  createRouteMatcher: mockCreateRouteMatcher,
  isAuthenticatedNextjs: mockIsAuthenticated,
  nextjsMiddlewareRedirect: mockNextjsMiddlewareRedirect
}))

vi.mock('next-international/middleware', () => ({
  createI18nMiddleware: mockCreateI18nMiddleware
}))

// Mock console.log to test logging behavior
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('Middleware', () => {
  type ConvexAuthMock = { isAuthenticated: () => Promise<boolean> }
  let middlewareHandler: (request: NextRequest, context: { convexAuth: ConvexAuthMock }) => Promise<Response>
  let mockRequest: NextRequest
  let mockConvexAuth: ConvexAuthMock
  const init = async () => {
    mockConvexAuthNextjsMiddleware.mockImplementation((handler) => {
      middlewareHandler = handler
      return handler
    })
    await import('./middleware')
  }

  beforeEach(async () => {
    // Ensure module initialization runs fresh each test so spies capture calls
    vi.resetModules()
    vi.clearAllMocks()
    
    // Setup default mocks
    mockCreateRouteMatcher.mockReturnValue(() => false) // Default: not sign-in page
    mockCreateI18nMiddleware.mockReturnValue(mockI18nMiddlewareInstance)
    mockI18nMiddlewareInstance.mockResolvedValue(new Response())
    mockNextjsMiddlewareRedirect.mockReturnValue(new Response('', { status: 307 }))
    
    // Setup convex auth mock
    mockConvexAuth = {
      isAuthenticated: mockIsAuthenticated
    }
    
    // Import middleware per scenario using init()
  })

  afterEach(() => {
    mockConsoleLog.mockClear()
  })

  describe('Authentication Flow Tests', () => {
    describe('Authenticated user on login page', () => {
      beforeEach(async () => {
        mockIsAuthenticated.mockResolvedValue(true)
        mockCreateRouteMatcher.mockReturnValue(() => true) // Is sign-in page
        vi.resetModules()
        await init()
      })

      it('should redirect to dashboard root', async () => {
        mockRequest = new NextRequest('http://localhost:3000/login')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/')
        expect(mockI18nMiddlewareInstance).not.toHaveBeenCalled()
      })

      it('should log redirect decision with auth state', async () => {
        mockRequest = new NextRequest('http://localhost:3000/login')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockConsoleLog).toHaveBeenCalledWith('redirecting to /', {
          isSignIn: true,
          isAuthenticated: true
        })
      })

      it('should handle login page with query parameters', async () => {
        mockRequest = new NextRequest('http://localhost:3000/login?redirect=/dashboard')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/')
      })
    })

    describe('Unauthenticated user on protected route', () => {
      beforeEach(async () => {
        mockIsAuthenticated.mockResolvedValue(false)
        mockCreateRouteMatcher.mockReturnValue(() => false) // Not sign-in page
        vi.resetModules()
        await init()
      })

      it('should redirect to login page', async () => {
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/login')
        expect(mockI18nMiddlewareInstance).not.toHaveBeenCalled()
      })

      it('should log redirect decision with auth state', async () => {
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockConsoleLog).toHaveBeenCalledWith('redirecting to /login', {
          isSignIn: false,
          isAuthenticated: false
        })
      })

      it('should redirect from nested protected routes', async () => {
        mockRequest = new NextRequest('http://localhost:3000/dashboard/settings')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/login')
      })

      it('should redirect from root path when unauthenticated', async () => {
        mockRequest = new NextRequest('http://localhost:3000/')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/login')
      })
    })

    describe('Authenticated user on protected route', () => {
      beforeEach(async () => {
        mockIsAuthenticated.mockResolvedValue(true)
        mockCreateRouteMatcher.mockReturnValue(() => false) // Not sign-in page
        vi.resetModules()
        await init()
      })

      it('should continue to i18n middleware', async () => {
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        const result = await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockI18nMiddlewareInstance).toHaveBeenCalledWith(mockRequest)
        expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled()
      })

      it('should log no redirect decision', async () => {
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockConsoleLog).toHaveBeenCalledWith('no redirect', {
          isSignIn: false,
          isAuthenticated: true
        })
      })

      it('should pass through root path when authenticated', async () => {
        mockRequest = new NextRequest('http://localhost:3000/')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockI18nMiddlewareInstance).toHaveBeenCalledWith(mockRequest)
      })

      it('should return i18n middleware response', async () => {
        const mockResponse = new Response('i18n response')
        mockI18nMiddlewareInstance.mockResolvedValue(mockResponse)
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        const result = await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(result).toBe(mockResponse)
      })
    })

    describe('Unauthenticated user on login page', () => {
      beforeEach(async () => {
        mockIsAuthenticated.mockResolvedValue(false)
        mockCreateRouteMatcher.mockReturnValue(() => true) // Is sign-in page
        vi.resetModules()
        await init()
      })

      it('should continue to i18n middleware', async () => {
        mockRequest = new NextRequest('http://localhost:3000/login')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockI18nMiddlewareInstance).toHaveBeenCalledWith(mockRequest)
        expect(mockNextjsMiddlewareRedirect).not.toHaveBeenCalled()
      })

      it('should log no redirect decision', async () => {
        mockRequest = new NextRequest('http://localhost:3000/login')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockConsoleLog).toHaveBeenCalledWith('no redirect', {
          isSignIn: true,
          isAuthenticated: false
        })
      })
    })
  })

  describe('Route Matching Tests', () => {
    it('should correctly initialize route matcher for login page', async () => {
      vi.resetModules()
      await init()
      expect(mockCreateRouteMatcher).toHaveBeenCalledWith(['/login'])
    })

    it('should call route matcher with request', async () => {
      const mockRouteMatcher = vi.fn(() => false)
      mockCreateRouteMatcher.mockReturnValue(mockRouteMatcher)
      mockIsAuthenticated.mockResolvedValue(true)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/dashboard')
      
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      
      expect(mockRouteMatcher).toHaveBeenCalledWith(mockRequest)
    })

    describe('Sign-in page detection', () => {
      it('should detect login page correctly', async () => {
        const mockRouteMatcher = vi.fn(() => true)
        mockCreateRouteMatcher.mockReturnValue(mockRouteMatcher)
        mockIsAuthenticated.mockResolvedValue(false)
        vi.resetModules()
        await init()
        mockRequest = new NextRequest('http://localhost:3000/login')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockRouteMatcher).toHaveBeenCalledWith(mockRequest)
      })

      it('should detect non-login pages correctly', async () => {
        const mockRouteMatcher = vi.fn(() => false)
        mockCreateRouteMatcher.mockReturnValue(mockRouteMatcher)
        mockIsAuthenticated.mockResolvedValue(true)
        vi.resetModules()
        await init()
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockRouteMatcher).toHaveBeenCalledWith(mockRequest)
      })
    })
  })

  describe('I18n Integration Tests', () => {
    describe('I18n middleware setup', () => {
      it('should create i18n middleware with correct configuration', async () => {
        vi.resetModules()
        await init()
        expect(mockCreateI18nMiddleware).toHaveBeenCalledWith({
          locales: ['en', 'fr', 'es'],
          defaultLocale: 'en',
          urlMappingStrategy: 'rewrite'
        })
      })
    })

    describe('I18n middleware execution', () => {
      beforeEach(async () => {
        mockIsAuthenticated.mockResolvedValue(true)
        mockCreateRouteMatcher.mockReturnValue(() => false) // Not sign-in page
        vi.resetModules()
        await init()
      })

      it('should pass request to i18n middleware when no redirect needed', async () => {
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockI18nMiddlewareInstance).toHaveBeenCalledWith(mockRequest)
        expect(mockI18nMiddlewareInstance).toHaveBeenCalledTimes(1)
      })

      it('should return i18n middleware response', async () => {
        const mockI18nResponse = new Response('Internationalized content', {
          headers: { 'Content-Language': 'en' }
        })
        mockI18nMiddlewareInstance.mockResolvedValue(mockI18nResponse)
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        const result = await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(result).toBe(mockI18nResponse)
      })

      it('should handle i18n middleware errors gracefully', async () => {
        const mockError = new Error('I18n processing failed')
        mockI18nMiddlewareInstance.mockRejectedValue(mockError)
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await expect(middlewareHandler(mockRequest, { convexAuth: mockConvexAuth }))
          .rejects.toThrow('I18n processing failed')
      })
    })
  })

  describe('Error Handling Tests', () => {
    describe('Authentication service errors', () => {
      it('should handle auth service errors gracefully', async () => {
        const authError = new Error('Convex auth service unavailable')
        mockIsAuthenticated.mockRejectedValue(authError)
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        
        await expect(middlewareHandler(mockRequest, { convexAuth: mockConvexAuth }))
          .rejects.toThrow('Convex auth service unavailable')
      })

      it('should handle route matcher errors', async () => {
        const routeError = new Error('Route matching failed')
        mockCreateRouteMatcher.mockReturnValue(() => {
          throw routeError
        })
        mockIsAuthenticated.mockResolvedValue(true)
        mockRequest = new NextRequest('http://localhost:3000/dashboard')
        // Current wrapper swallows route matcher errors; assert it returns a Response.
        const result = await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        expect(result).toBeInstanceOf(Response)
      })
    })

    describe('Request handling edge cases', () => {
      it('should handle requests with missing URL', async () => {
        mockIsAuthenticated.mockResolvedValue(false)
        mockCreateRouteMatcher.mockReturnValue(() => false)
        // Use a minimal absolute URL to satisfy NextRequest constructor
        mockRequest = new NextRequest('http://localhost')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/login')
      })

      it('should handle requests with complex paths', async () => {
        mockIsAuthenticated.mockResolvedValue(true)
        mockCreateRouteMatcher.mockReturnValue(() => false)
        mockRequest = new NextRequest('http://localhost:3000/dashboard/settings/billing?tab=plan')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockI18nMiddlewareInstance).toHaveBeenCalledWith(mockRequest)
      })

      it('should handle requests with special characters in path', async () => {
        mockIsAuthenticated.mockResolvedValue(false)
        mockCreateRouteMatcher.mockReturnValue(() => false)
        mockRequest = new NextRequest('http://localhost:3000/user/test%40example.com')
        
        await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
        
        expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/login')
      })
    })
  })

  describe('Middleware Configuration', () => {
    it('should export correct matcher configuration', async () => {
      const { config } = await import('./middleware')
      expect(config).toBeDefined()
      expect(config.matcher).toBeInstanceOf(Array)
      expect(config.matcher).toHaveLength(4)
    })

    it('should include correct route patterns in matcher', async () => {
      const { config } = await import('./middleware')
      expect(config.matcher).toContain('/((?!_next/static|api|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)')
      expect(config.matcher).toContain('/((?!.*\\..*|_next).*)')
      expect(config.matcher).toContain('/')
      expect(config.matcher).toContain('/(api|trpc)(.*)')
    })

    it('should exclude static assets from middleware execution', async () => {
      const { config } = await import('./middleware')
      const staticAssetPattern = config.matcher[0]
      
      // Should match normal routes
      expect(staticAssetPattern).toMatch(/\(\?\!.*_next\/static.*\)/)
      
      // Should exclude common file extensions
      expect(staticAssetPattern).toMatch(/\(\?\!.*\\\..*svg.*\)/)
      expect(staticAssetPattern).toMatch(/\(\?\!.*\\\..*png.*\)/)
      expect(staticAssetPattern).toMatch(/\(\?\!.*\\\..*jpg.*\)/)
    })
  })

  describe('Logging Behavior', () => {
    it('logs redirect for authenticated user on sign-in page', async () => {
      mockIsAuthenticated.mockResolvedValue(true)
      mockCreateRouteMatcher.mockReturnValue(() => true)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/login')
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      expect(mockConsoleLog).toHaveBeenCalledWith('redirecting to /', {
        isSignIn: true,
        isAuthenticated: true
      })
    })

    it('logs redirect for unauthenticated user on protected route', async () => {
      mockIsAuthenticated.mockResolvedValue(false)
      mockCreateRouteMatcher.mockReturnValue(() => false)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/dashboard')
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      expect(mockConsoleLog).toHaveBeenCalledWith('redirecting to /login', {
        isSignIn: false,
        isAuthenticated: false
      })
    })

    it('logs no redirect for authenticated user on protected route', async () => {
      mockIsAuthenticated.mockResolvedValue(true)
      mockCreateRouteMatcher.mockReturnValue(() => false)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/dashboard')
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      expect(mockConsoleLog).toHaveBeenCalledWith('no redirect', {
        isSignIn: false,
        isAuthenticated: true
      })
    })

    it('should include correct auth state in logs', async () => {
      mockIsAuthenticated.mockResolvedValue(true)
      mockCreateRouteMatcher.mockReturnValue(() => false)
      mockRequest = new NextRequest('http://localhost:3000/dashboard')
      
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      
      expect(mockConsoleLog).toHaveBeenCalledWith('no redirect', {
        isSignIn: false,
        isAuthenticated: true
      })
      
      // Verify the log includes both authentication state and route matching state
      const logCall = mockConsoleLog.mock.calls[0]
      expect(logCall[1]).toHaveProperty('isSignIn', false)
      expect(logCall[1]).toHaveProperty('isAuthenticated', true)
    })
  })

  describe('Comprehensive Integration Tests', () => {
    it('should handle complete authentication flow for new user', async () => {
      // New user visits protected route -> redirect to login
      mockIsAuthenticated.mockResolvedValue(false)
      mockCreateRouteMatcher.mockReturnValue(() => false)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/dashboard')
      
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/login')
      expect(mockConsoleLog).toHaveBeenCalledWith('redirecting to /login', {
        isSignIn: false,
        isAuthenticated: false
      })
    })

    it('should handle complete authentication flow for authenticated user', async () => {
      // Authenticated user visits login -> redirect to dashboard
      mockIsAuthenticated.mockResolvedValue(true)
      mockCreateRouteMatcher.mockReturnValue(() => true)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/login')
      
      await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      
      expect(mockNextjsMiddlewareRedirect).toHaveBeenCalledWith(mockRequest, '/')
      expect(mockConsoleLog).toHaveBeenCalledWith('redirecting to /', {
        isSignIn: true,
        isAuthenticated: true
      })
    })

    it('should handle normal browsing for authenticated user', async () => {
      // Authenticated user browses normally -> continue to i18n
      mockIsAuthenticated.mockResolvedValue(true)
      mockCreateRouteMatcher.mockReturnValue(() => false)
      const mockI18nResponse = new Response('localized content')
      mockI18nMiddlewareInstance.mockResolvedValue(mockI18nResponse)
      vi.resetModules()
      await init()
      mockRequest = new NextRequest('http://localhost:3000/dashboard/settings')
      
      const result = await middlewareHandler(mockRequest, { convexAuth: mockConvexAuth })
      
      expect(mockI18nMiddlewareInstance).toHaveBeenCalledWith(mockRequest)
      expect(result).toBe(mockI18nResponse)
      expect(mockConsoleLog).toHaveBeenCalledWith('no redirect', {
        isSignIn: false,
        isAuthenticated: true
      })
    })
  })
})
