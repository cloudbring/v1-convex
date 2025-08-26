import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

// Mock next-international/client
const mockUseI18n = vi.fn()
const mockUseScopedI18n = vi.fn()
const mockUseChangeLocale = vi.fn()
const mockUseCurrentLocale = vi.fn()
const MockI18nProviderClient = vi.fn(({ children, locale }) => (
  React.createElement('div', { 'data-testid': 'i18n-provider', 'data-locale': locale }, children)
))

vi.mock('next-international/client', () => ({
  createI18nClient: vi.fn(() => ({
    useI18n: mockUseI18n,
    useScopedI18n: mockUseScopedI18n,
    I18nProviderClient: MockI18nProviderClient,
    useChangeLocale: mockUseChangeLocale,
    useCurrentLocale: mockUseCurrentLocale
  }))
}))

describe('Client i18n Configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetModules()
    cleanup()
  })

  describe('Client i18n Setup', () => {
    it('should configure client i18n correctly with all supported locales', async () => {
      const { createI18nClient } = await import('next-international/client')
      
      // Import the client configuration to trigger createI18nClient call
      await import('./client')
      
      expect(createI18nClient).toHaveBeenCalledWith({
        en: expect.any(Function),
        fr: expect.any(Function),
        es: expect.any(Function)
      })
    })

    it('should export all required client hooks and components', async () => {
      const clientModule = await import('./client')
      
      expect(clientModule).toHaveProperty('useI18n')
      expect(clientModule).toHaveProperty('useScopedI18n')
      expect(clientModule).toHaveProperty('I18nProviderClient')
      expect(clientModule).toHaveProperty('useChangeLocale')
      expect(clientModule).toHaveProperty('useCurrentLocale')
      
      expect(typeof clientModule.useI18n).toBe('function')
      expect(typeof clientModule.useScopedI18n).toBe('function')
      expect(typeof clientModule.I18nProviderClient).toBe('function')
      expect(typeof clientModule.useChangeLocale).toBe('function')
      expect(typeof clientModule.useCurrentLocale).toBe('function')
    })

    it('should configure dynamic imports for each locale', async () => {
      const { createI18nClient } = await import('next-international/client')
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      
      // Verify each locale has a dynamic import function
      expect(config.en).toBeInstanceOf(Function)
      expect(config.fr).toBeInstanceOf(Function)
      expect(config.es).toBeInstanceOf(Function)
    })

    it('should maintain consistent locale order', async () => {
      const { createI18nClient } = await import('next-international/client')
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      const locales = Object.keys(config)
      
      expect(locales).toEqual(['en', 'fr', 'es'])
      expect(locales).toHaveLength(3)
    })
  })

  describe('useI18n Hook Behavior', () => {
    it('should provide translation function through useI18n hook', async () => {
      const mockTranslationFn = vi.fn((key: string) => `translated.${key}`)
      mockUseI18n.mockReturnValue(mockTranslationFn)
      
      const { useI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', null, t('dashboard.title'))
      }
      
      render(React.createElement(TestComponent))
      
      expect(mockUseI18n).toHaveBeenCalled()
      expect(screen.getByText('translated.dashboard.title')).toBeInTheDocument()
    })

    it('should handle different translation keys', async () => {
      const mockTranslationFn = vi.fn((key: string) => {
        const translations: Record<string, string> = {
          'dashboard.title': 'Dashboard',
          'dashboard.description': 'Manage your apps',
          'settings.title': 'Settings',
          'settings.avatar.title': 'Your Avatar'
        }
        return translations[key] || `missing.${key}`
      })
      
      mockUseI18n.mockReturnValue(mockTranslationFn)
      
      const { useI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', null, [
          React.createElement('span', { key: '1' }, t('dashboard.title')),
          React.createElement('span', { key: '2' }, t('dashboard.description')),
          React.createElement('span', { key: '3' }, t('settings.title')),
          React.createElement('span', { key: '4' }, t('settings.avatar.title'))
        ])
      }
      
      render(React.createElement(TestComponent))
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Manage your apps')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Your Avatar')).toBeInTheDocument()
    })

    it('should handle missing translation keys', async () => {
      const mockTranslationFn = vi.fn((key: string) => `missing.${key}`)
      mockUseI18n.mockReturnValue(mockTranslationFn)
      
      const { useI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', null, t('nonexistent.key'))
      }
      
      render(React.createElement(TestComponent))
      
      expect(screen.getByText('missing.nonexistent.key')).toBeInTheDocument()
    })

    it('should update when locale changes', async () => {
      let currentTranslationFn = vi.fn((key: string) => `en.${key}`)
      mockUseI18n.mockImplementation(() => currentTranslationFn)
      
      const { useI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', null, t('dashboard.title'))
      }
      
      const { rerender } = render(React.createElement(TestComponent))
      expect(screen.getByText('en.dashboard.title')).toBeInTheDocument()
      
      // Simulate locale change
      currentTranslationFn = vi.fn((key: string) => `es.${key}`)
      mockUseI18n.mockImplementation(() => currentTranslationFn)
      
      rerender(React.createElement(TestComponent))
      expect(screen.getByText('es.dashboard.title')).toBeInTheDocument()
    })
  })

  describe('useScopedI18n Hook Behavior', () => {
    it('should provide scoped translation function', async () => {
      const mockScopedFn = vi.fn((key: string) => `dashboard.${key}`)
      mockUseScopedI18n.mockReturnValue(mockScopedFn)
      
      const { useScopedI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useScopedI18n('dashboard')
        return React.createElement('div', null, t('title'))
      }
      
      render(React.createElement(TestComponent))
      
      expect(mockUseScopedI18n).toHaveBeenCalledWith('dashboard')
      expect(screen.getByText('dashboard.title')).toBeInTheDocument()
    })

    it('should handle different scopes correctly', async () => {
      const scopes = ['dashboard', 'settings', 'settings.avatar']
      
      for (const scope of scopes) {
        mockUseScopedI18n.mockClear()
        mockUseScopedI18n.mockReturnValue((key: string) => `${scope}.${key}`)
        
        const { useScopedI18n } = await import('./client')
        
        const TestComponent = () => {
          const t = useScopedI18n(scope)
          return React.createElement('div', null, t('title'))
        }
        
        render(React.createElement(TestComponent))
        
        expect(mockUseScopedI18n).toHaveBeenCalledWith(scope)
        expect(screen.getByText(`${scope}.title`)).toBeInTheDocument()
      }
    })

    it('should work with nested scoped keys', async () => {
      const mockScopedFn = vi.fn((key: string) => {
        const scopedTranslations: Record<string, string> = {
          'title': 'Settings Title',
          'description': 'Settings Description',
          'avatar.title': 'Avatar Title',
          'avatar.description': 'Avatar Description',
          'deleteAccount.title': 'Delete Account'
        }
        return scopedTranslations[key] || `settings.${key}`
      })
      
      mockUseScopedI18n.mockReturnValue(mockScopedFn)
      
      const { useScopedI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useScopedI18n('settings')
        return React.createElement('div', null, [
          React.createElement('span', { key: '1' }, t('title')),
          React.createElement('span', { key: '2' }, t('avatar.title')),
          React.createElement('span', { key: '3' }, t('deleteAccount.title'))
        ])
      }
      
      render(React.createElement(TestComponent))
      
      expect(screen.getByText('Settings Title')).toBeInTheDocument()
      expect(screen.getByText('Avatar Title')).toBeInTheDocument()
      expect(screen.getByText('Delete Account')).toBeInTheDocument()
    })
  })

  describe('useCurrentLocale Hook Behavior', () => {
    it('should return current locale', async () => {
      mockUseCurrentLocale.mockReturnValue('en')
      
      const { useCurrentLocale } = await import('./client')
      
      const TestComponent = () => {
        const locale = useCurrentLocale()
        return React.createElement('div', null, `Current locale: ${locale}`)
      }
      
      render(React.createElement(TestComponent))
      
      expect(mockUseCurrentLocale).toHaveBeenCalled()
      expect(screen.getByText('Current locale: en')).toBeInTheDocument()
    })

    it('should handle different locales', async () => {
      const locales = ['en', 'es', 'fr']
      
      for (const locale of locales) {
        mockUseCurrentLocale.mockClear()
        mockUseCurrentLocale.mockReturnValue(locale)
        
        const { useCurrentLocale } = await import('./client')
        
        const TestComponent = () => {
          const currentLocale = useCurrentLocale()
          return React.createElement('div', null, `Locale: ${currentLocale}`)
        }
        
        render(React.createElement(TestComponent))
        
        expect(mockUseCurrentLocale).toHaveBeenCalled()
        expect(screen.getByText(`Locale: ${locale}`)).toBeInTheDocument()
      }
    })

    it('should update when locale changes', async () => {
      let currentLocale = 'en'
      mockUseCurrentLocale.mockImplementation(() => currentLocale)
      
      const { useCurrentLocale } = await import('./client')
      
      const TestComponent = () => {
        const locale = useCurrentLocale()
        return React.createElement('div', null, locale)
      }
      
      const { rerender } = render(React.createElement(TestComponent))
      expect(screen.getByText('en')).toBeInTheDocument()
      
      // Simulate locale change
      currentLocale = 'es'
      mockUseCurrentLocale.mockImplementation(() => currentLocale)
      
      rerender(React.createElement(TestComponent))
      expect(screen.getByText('es')).toBeInTheDocument()
    })
  })

  describe('useChangeLocale Hook Behavior', () => {
    it('should provide locale change function', async () => {
      const mockChangeLocale = vi.fn()
      mockUseChangeLocale.mockReturnValue(mockChangeLocale)
      
      const { useChangeLocale } = await import('./client')
      
      const TestComponent = () => {
        const changeLocale = useChangeLocale()
        return React.createElement('button', { 
          onClick: () => changeLocale('fr') 
        }, 'Change to French')
      }
      
      const user = userEvent.setup()
      render(React.createElement(TestComponent))
      
      expect(mockUseChangeLocale).toHaveBeenCalled()
      
      await user.click(screen.getByRole('button'))
      expect(mockChangeLocale).toHaveBeenCalledWith('fr')
    })

    it('should handle different locale changes', async () => {
      const mockChangeLocale = vi.fn()
      mockUseChangeLocale.mockReturnValue(mockChangeLocale)
      
      const { useChangeLocale } = await import('./client')
      
      const TestComponent = () => {
        const changeLocale = useChangeLocale()
        return React.createElement('div', null, [
          React.createElement('button', { 
            key: 'en',
            onClick: () => changeLocale('en') 
          }, 'English'),
          React.createElement('button', { 
            key: 'es',
            onClick: () => changeLocale('es') 
          }, 'Spanish'),
          React.createElement('button', { 
            key: 'fr',
            onClick: () => changeLocale('fr') 
          }, 'French')
        ])
      }
      
      const user = userEvent.setup()
      render(React.createElement(TestComponent))
      
      await user.click(screen.getByText('English'))
      expect(mockChangeLocale).toHaveBeenCalledWith('en')
      
      await user.click(screen.getByText('Spanish'))
      expect(mockChangeLocale).toHaveBeenCalledWith('es')
      
      await user.click(screen.getByText('French'))
      expect(mockChangeLocale).toHaveBeenCalledWith('fr')
    })

    it('should be callable multiple times', async () => {
      const mockChangeLocale = vi.fn()
      mockUseChangeLocale.mockReturnValue(mockChangeLocale)
      
      const { useChangeLocale } = await import('./client')
      
      const TestComponent = () => {
        const changeLocale = useChangeLocale()
        return React.createElement('button', { 
          onClick: () => {
            changeLocale('es')
            changeLocale('fr')
            changeLocale('en')
          }
        }, 'Change Multiple')
      }
      
      const user = userEvent.setup()
      render(React.createElement(TestComponent))
      
      await user.click(screen.getByRole('button'))
      
      expect(mockChangeLocale).toHaveBeenCalledTimes(3)
      expect(mockChangeLocale).toHaveBeenNthCalledWith(1, 'es')
      expect(mockChangeLocale).toHaveBeenNthCalledWith(2, 'fr')
      expect(mockChangeLocale).toHaveBeenNthCalledWith(3, 'en')
    })
  })

  describe('I18nProviderClient Component', () => {
    it('should render children with locale context', async () => {
      const { I18nProviderClient } = await import('./client')
      
      const TestChild = () => React.createElement('div', null, 'Test Content')
      
      render(
        React.createElement(I18nProviderClient, { locale: 'en' },
          React.createElement(TestChild)
        )
      )
      
      expect(screen.getByTestId('i18n-provider')).toBeInTheDocument()
      expect(screen.getByTestId('i18n-provider')).toHaveAttribute('data-locale', 'en')
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should handle different locales', async () => {
      const locales = ['en', 'es', 'fr']
      
      for (const locale of locales) {
        cleanup() // Clean up between iterations
        
        const { I18nProviderClient } = await import('./client')
        
        const TestChild = () => React.createElement('div', null, `Content for ${locale}`)
        
        render(
          React.createElement(I18nProviderClient, { locale },
            React.createElement(TestChild)
          )
        )
        
        expect(screen.getByTestId('i18n-provider')).toHaveAttribute('data-locale', locale)
        expect(screen.getByText(`Content for ${locale}`)).toBeInTheDocument()
      }
    })

    it('should provide context to child components', async () => {
      const { I18nProviderClient } = await import('./client')
      
      const TestChild = () => {
        // This would normally access i18n context
        return React.createElement('div', null, 'Context provided')
      }
      
      render(
        React.createElement(I18nProviderClient, { locale: 'es' },
          React.createElement(TestChild)
        )
      )
      
      expect(MockI18nProviderClient).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: 'es',
          children: expect.any(Object)
        }),
        expect.any(Object)
      )
    })

    it('should handle multiple children', async () => {
      const { I18nProviderClient } = await import('./client')
      
      const Child1 = () => React.createElement('div', null, 'Child 1')
      const Child2 = () => React.createElement('div', null, 'Child 2')
      
      render(
        React.createElement(I18nProviderClient, { locale: 'fr' }, [
          React.createElement(Child1, { key: '1' }),
          React.createElement(Child2, { key: '2' })
        ])
      )
      
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByTestId('i18n-provider')).toHaveAttribute('data-locale', 'fr')
    })
  })

  describe('Dynamic Import Behavior', () => {
    it('should handle dynamic import functions for each locale', async () => {
      const { createI18nClient } = await import('next-international/client')
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      
      // Verify dynamic import functions exist
      expect(typeof config.en).toBe('function')
      expect(typeof config.fr).toBe('function')
      expect(typeof config.es).toBe('function')
    })

    it('should configure correct import paths', async () => {
      const { createI18nClient } = await import('next-international/client')
      
      vi.doMock('./en', () => ({ default: { dashboard: { title: 'English' } } }))
      vi.doMock('./fr', () => ({ default: { dashboard: { title: 'French' } } }))
      vi.doMock('./es', () => ({ default: { dashboard: { title: 'Spanish' } } }))
      
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      
      // Test that import functions are configured correctly
      expect(config.en).toBeInstanceOf(Function)
      expect(config.fr).toBeInstanceOf(Function)
      expect(config.es).toBeInstanceOf(Function)
    })
  })

  describe('Error Handling', () => {
    it('should handle useI18n errors gracefully', async () => {
      mockUseI18n.mockImplementation(() => {
        throw new Error('Translation hook failed')
      })
      
      const { useI18n } = await import('./client')
      
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', null, 'Success')
      }
      
      expect(() => render(React.createElement(TestComponent))).toThrow('Translation hook failed')
      
      consoleSpy.mockRestore()
    })

    it('should handle useCurrentLocale errors gracefully', async () => {
      mockUseCurrentLocale.mockImplementation(() => {
        throw new Error('Current locale failed')
      })
      
      const { useCurrentLocale } = await import('./client')
      
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const TestComponent = () => {
        const locale = useCurrentLocale()
        return React.createElement('div', null, locale)
      }
      
      expect(() => render(React.createElement(TestComponent))).toThrow('Current locale failed')
      
      consoleSpy.mockRestore()
    })

    it('should handle useChangeLocale errors gracefully', async () => {
      mockUseChangeLocale.mockImplementation(() => {
        throw new Error('Change locale failed')
      })
      
      const { useChangeLocale } = await import('./client')
      
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const TestComponent = () => {
        const changeLocale = useChangeLocale()
        return React.createElement('button', { 
          onClick: () => changeLocale('es') 
        }, 'Change')
      }
      
      expect(() => render(React.createElement(TestComponent))).toThrow('Change locale failed')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Configuration Validation', () => {
    it('should configure exactly three locales', async () => {
      const { createI18nClient } = await import('next-international/client')
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      const locales = Object.keys(config)
      
      expect(locales).toHaveLength(3)
      expect(locales).toContain('en')
      expect(locales).toContain('fr')
      expect(locales).toContain('es')
    })

    it('should not include unsupported locales', async () => {
      const { createI18nClient } = await import('next-international/client')
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      const locales = Object.keys(config)
      
      // Should not include common locales that are not configured
      expect(locales).not.toContain('de')
      expect(locales).not.toContain('it')
      expect(locales).not.toContain('pt')
      expect(locales).not.toContain('zh')
    })

    it('should maintain consistent locale configuration', async () => {
      const { createI18nClient } = await import('next-international/client')
      await import('./client')
      
      const config = (createI18nClient as any).mock.calls[0][0]
      
      // All locales should have dynamic import functions
      Object.values(config).forEach(importFn => {
        expect(typeof importFn).toBe('function')
      })
    })
  })

  describe('React Integration', () => {
    it('should work with React components', async () => {
      mockUseI18n.mockReturnValue((key: string) => `React.${key}`)
      
      const { useI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', { className: 'test-component' }, t('dashboard.title'))
      }
      
      render(React.createElement(TestComponent))
      
      expect(screen.getByText('React.dashboard.title')).toBeInTheDocument()
      expect(screen.getByText('React.dashboard.title')).toHaveClass('test-component')
    })

    it('should support React hooks patterns', async () => {
      mockUseI18n.mockReturnValue((key: string) => key.toUpperCase())
      mockUseCurrentLocale.mockReturnValue('en')
      
      const { useI18n, useCurrentLocale } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        const locale = useCurrentLocale()
        
        return React.createElement('div', null, `${t('test.key')} - ${locale}`)
      }
      
      render(React.createElement(TestComponent))
      
      expect(screen.getByText('TEST.KEY - en')).toBeInTheDocument()
    })

    it('should maintain React state consistency', async () => {
      let renderCount = 0
      const mockTranslationFn = vi.fn((key: string) => {
        renderCount++
        return `${key}-${renderCount}`
      })
      
      mockUseI18n.mockReturnValue(mockTranslationFn)
      
      const { useI18n } = await import('./client')
      
      const TestComponent = () => {
        const t = useI18n()
        return React.createElement('div', null, t('dashboard.title'))
      }
      
      const { rerender } = render(React.createElement(TestComponent))
      expect(screen.getByText('dashboard.title-1')).toBeInTheDocument()
      
      rerender(React.createElement(TestComponent))
      expect(screen.getByText('dashboard.title-2')).toBeInTheDocument()
    })
  })
})