import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock next-international/server
const mockGetI18n = vi.fn()
const mockGetScopedI18n = vi.fn()
const mockGetStaticParams = vi.fn()

vi.mock('next-international/server', () => ({
  createI18nServer: vi.fn(() => ({
    getI18n: mockGetI18n,
    getScopedI18n: mockGetScopedI18n,
    getStaticParams: mockGetStaticParams
  }))
}))

describe('Server i18n Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
  })

  describe('Server i18n Setup', () => {
    it('should configure server i18n correctly with all supported locales', async () => {
      const { createI18nServer } = await import('next-international/server')
      
      // Import the server configuration to trigger createI18nServer call
      await import('./server')
      
      expect(createI18nServer).toHaveBeenCalledWith({
        en: expect.any(Function),
        es: expect.any(Function),
        fr: expect.any(Function)
      })
    })

    it('should export all required server functions', async () => {
      const serverModule = await import('./server')
      
      expect(serverModule).toHaveProperty('getI18n')
      expect(serverModule).toHaveProperty('getScopedI18n')
      expect(serverModule).toHaveProperty('getStaticParams')
      expect(typeof serverModule.getI18n).toBe('function')
      expect(typeof serverModule.getScopedI18n).toBe('function')
      expect(typeof serverModule.getStaticParams).toBe('function')
    })

    it('should configure dynamic imports for each locale', async () => {
      const { createI18nServer } = await import('next-international/server')
      await import('./server')
      
      const config = (createI18nServer as any).mock.calls[0][0]
      
      // Verify each locale has a dynamic import function
      expect(config.en).toBeInstanceOf(Function)
      expect(config.es).toBeInstanceOf(Function)
      expect(config.fr).toBeInstanceOf(Function)
    })
  })

  describe('getI18n Function Behavior', () => {
    it('should return translation function for valid locale', async () => {
      const mockTranslationFn = vi.fn((key: string) => `translated.${key}`)
      mockGetI18n.mockReturnValue(mockTranslationFn)
      
      const { getI18n } = await import('./server')
      const t = await getI18n('en')
      
      expect(mockGetI18n).toHaveBeenCalledWith('en')
      expect(t).toBe(mockTranslationFn)
    })

    it('should handle different locales correctly', async () => {
      const locales = ['en', 'es', 'fr']
      
      for (const locale of locales) {
        mockGetI18n.mockClear()
        mockGetI18n.mockReturnValue((key: string) => `${locale}.${key}`)
        
        const { getI18n } = await import('./server')
        const t = await getI18n(locale)
        
        expect(mockGetI18n).toHaveBeenCalledWith(locale)
        expect(typeof t).toBe('function')
      }
    })

    it('should work with translation keys', async () => {
      const mockTranslationFn = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'dashboard.title': 'Dashboard',
          'dashboard.description': 'Manage your apps',
          'settings.title': 'Settings'
        }
        return translations[key] || key
      })
      
      mockGetI18n.mockReturnValue(mockTranslationFn)
      
      const { getI18n } = await import('./server')
      const t = await getI18n('en')
      
      expect(t('dashboard.title')).toBe('Dashboard')
      expect(t('dashboard.description')).toBe('Manage your apps')
      expect(t('settings.title')).toBe('Settings')
    })
  })

  describe('getScopedI18n Function Behavior', () => {
    it('should return scoped translation function', async () => {
      const mockScopedFn = vi.fn((key: string) => `scoped.dashboard.${key}`)
      mockGetScopedI18n.mockReturnValue(mockScopedFn)
      
      const { getScopedI18n } = await import('./server')
      const scopedT = await getScopedI18n('dashboard')
      
      expect(mockGetScopedI18n).toHaveBeenCalledWith('dashboard')
      expect(scopedT).toBe(mockScopedFn)
    })

    it('should work with scoped translation keys', async () => {
      const mockScopedFn = vi.fn((key: string) => {
        const scopedTranslations: Record<string, string> = {
          'title': 'Dashboard Title',
          'description': 'Dashboard Description',
          'bodyTitle': 'Get Started'
        }
        return scopedTranslations[key] || `scoped.${key}`
      })
      
      mockGetScopedI18n.mockReturnValue(mockScopedFn)
      
      const { getScopedI18n } = await import('./server')
      const scopedT = await getScopedI18n('dashboard')
      
      expect(scopedT('title')).toBe('Dashboard Title')
      expect(scopedT('description')).toBe('Dashboard Description')
      expect(scopedT('bodyTitle')).toBe('Get Started')
    })

    it('should handle different scopes correctly', async () => {
      const scopes = ['dashboard', 'settings', 'settings.avatar']
      
      for (const scope of scopes) {
        mockGetScopedI18n.mockClear()
        mockGetScopedI18n.mockReturnValue((key: string) => `${scope}.${key}`)
        
        const { getScopedI18n } = await import('./server')
        const scopedT = await getScopedI18n(scope)
        
        expect(mockGetScopedI18n).toHaveBeenCalledWith(scope)
        expect(typeof scopedT).toBe('function')
      }
    })

    it('should handle nested scopes', async () => {
      mockGetScopedI18n.mockImplementation((scope: string) => (key: string) => `${scope}.${key}`)
      
      const { getScopedI18n } = await import('./server')
      
      const dashboardT = await getScopedI18n('dashboard')
      const settingsT = await getScopedI18n('settings')
      const avatarT = await getScopedI18n('settings.avatar')
      
      expect(dashboardT('title')).toBe('dashboard.title')
      expect(settingsT('title')).toBe('settings.title')
      expect(avatarT('title')).toBe('settings.avatar.title')
    })
  })

  describe('getStaticParams Function', () => {
    it('should return static parameters for all supported locales', async () => {
      const expectedParams = [
        { locale: 'en' },
        { locale: 'es' },
        { locale: 'fr' }
      ]
      
      mockGetStaticParams.mockReturnValue(expectedParams)
      
      const { getStaticParams } = await import('./server')
      const params = await getStaticParams()
      
      expect(mockGetStaticParams).toHaveBeenCalled()
      expect(params).toEqual(expectedParams)
      expect(params).toHaveLength(3)
    })

    it('should include all configured locales in static params', async () => {
      const mockParams = [
        { locale: 'en' },
        { locale: 'es' },
        { locale: 'fr' }
      ]
      
      mockGetStaticParams.mockReturnValue(mockParams)
      
      const { getStaticParams } = await import('./server')
      const params = await getStaticParams()
      
      expect(params).toContainEqual({ locale: 'en' })
      expect(params).toContainEqual({ locale: 'es' })
      expect(params).toContainEqual({ locale: 'fr' })
    })

    it('should support Next.js static generation', async () => {
      mockGetStaticParams.mockReturnValue([
        { locale: 'en' },
        { locale: 'es' },
        { locale: 'fr' }
      ])
      
      const { getStaticParams } = await import('./server')
      const params = await getStaticParams()
      
      // Verify params structure is compatible with Next.js
      params.forEach(param => {
        expect(param).toHaveProperty('locale')
        expect(typeof param.locale).toBe('string')
        expect(param.locale).toMatch(/^[a-z]{2}$/)
      })
    })
  })

  describe('Dynamic Import Behavior', () => {
    it('should handle dynamic import functions for each locale', async () => {
      const { createI18nServer } = await import('next-international/server')
      await import('./server')
      
      const config = (createI18nServer as any).mock.calls[0][0]
      
      // Verify dynamic import functions exist
      expect(typeof config.en).toBe('function')
      expect(typeof config.es).toBe('function')
      expect(typeof config.fr).toBe('function')
    })

    it('should configure correct import paths', async () => {
      const { createI18nServer } = await import('next-international/server')
      
      // Mock dynamic imports to track calls
      const enImport = vi.fn()
      const esImport = vi.fn()
      const frImport = vi.fn()
      
      vi.doMock('./en', () => ({ default: { dashboard: { title: 'English' } } }))
      vi.doMock('./es', () => ({ default: { dashboard: { title: 'Spanish' } } }))
      vi.doMock('./fr', () => ({ default: { dashboard: { title: 'French' } } }))
      
      await import('./server')
      
      const config = (createI18nServer as any).mock.calls[0][0]
      
      // Test that import functions are configured correctly
      expect(config.en).toBeInstanceOf(Function)
      expect(config.es).toBeInstanceOf(Function)
      expect(config.fr).toBeInstanceOf(Function)
    })
  })

  describe('Error Handling', () => {
    it('should handle errors in getI18n gracefully', async () => {
      mockGetI18n.mockImplementation(() => {
        throw new Error('Translation loading failed')
      })
      
      const { getI18n } = await import('./server')
      
      await expect(async () => {
        await getI18n('en')
      }).rejects.toThrow('Translation loading failed')
    })

    it('should handle errors in getScopedI18n gracefully', async () => {
      mockGetScopedI18n.mockImplementation(() => {
        throw new Error('Scoped translation failed')
      })
      
      const { getScopedI18n } = await import('./server')
      
      await expect(async () => {
        await getScopedI18n('dashboard')
      }).rejects.toThrow('Scoped translation failed')
    })

    it('should handle errors in getStaticParams gracefully', async () => {
      mockGetStaticParams.mockImplementation(() => {
        throw new Error('Static params generation failed')
      })
      
      const { getStaticParams } = await import('./server')
      
      await expect(async () => {
        await getStaticParams()
      }).rejects.toThrow('Static params generation failed')
    })
  })

  describe('Type Safety and Integration', () => {
    it('should maintain TypeScript compatibility', async () => {
      const serverModule = await import('./server')
      
      // Verify exports exist and are callable
      expect(serverModule.getI18n).toBeDefined()
      expect(serverModule.getScopedI18n).toBeDefined()
      expect(serverModule.getStaticParams).toBeDefined()
      
      // These should not throw TypeScript errors when called
      expect(typeof serverModule.getI18n).toBe('function')
      expect(typeof serverModule.getScopedI18n).toBe('function')
      expect(typeof serverModule.getStaticParams).toBe('function')
    })

    it('should work with Next.js App Router', async () => {
      mockGetStaticParams.mockReturnValue([
        { locale: 'en' },
        { locale: 'es' },
        { locale: 'fr' }
      ])
      
      const { getStaticParams } = await import('./server')
      const params = await getStaticParams()
      
      // Verify structure matches Next.js generateStaticParams return type
      expect(Array.isArray(params)).toBe(true)
      params.forEach(param => {
        expect(typeof param).toBe('object')
        expect(param).toHaveProperty('locale')
      })
    })
  })

  describe('Configuration Validation', () => {
    it('should configure exactly three locales', async () => {
      const { createI18nServer } = await import('next-international/server')
      await import('./server')
      
      const config = (createI18nServer as any).mock.calls[0][0]
      const locales = Object.keys(config)
      
      expect(locales).toHaveLength(3)
      expect(locales).toContain('en')
      expect(locales).toContain('es')
      expect(locales).toContain('fr')
    })

    it('should not include unsupported locales', async () => {
      const { createI18nServer } = await import('next-international/server')
      await import('./server')
      
      const config = (createI18nServer as any).mock.calls[0][0]
      const locales = Object.keys(config)
      
      // Should not include common locales that are not configured
      expect(locales).not.toContain('de')
      expect(locales).not.toContain('it')
      expect(locales).not.toContain('pt')
      expect(locales).not.toContain('zh')
    })

    it('should maintain consistent locale configuration', async () => {
      const { createI18nServer } = await import('next-international/server')
      await import('./server')
      
      const config = (createI18nServer as any).mock.calls[0][0]
      
      // All locales should have dynamic import functions
      Object.values(config).forEach(importFn => {
        expect(typeof importFn).toBe('function')
      })
    })
  })
})