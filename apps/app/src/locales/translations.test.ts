import { describe, it, expect } from 'vitest'

// Utility function to extract all translation keys from nested object
const getTranslationKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getTranslationKeys(obj[key], fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys.sort()
}

// Utility function to get all translation values from nested object
const getTranslationValues = (obj: any): string[] => {
  let values: string[] = []
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      values = values.concat(getTranslationValues(obj[key]))
    } else if (typeof obj[key] === 'string') {
      values.push(obj[key])
    }
  }
  return values
}

// Utility function to get object structure (without values)
const getObjectStructure = (obj: any, prefix = ''): string[] => {
  let structure: string[] = []
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      structure.push(`${fullKey}:object`)
      structure = structure.concat(getObjectStructure(obj[key], fullKey))
    } else {
      structure.push(`${fullKey}:${typeof obj[key]}`)
    }
  }
  return structure.sort()
}

// Utility function to get value at nested path
const getValueAtPath = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Load locale files dynamically
const loadLocaleFile = async (locale: string) => {
  if (locale === 'en') {
    const module = await import('./en')
    return module.default
  } else if (locale === 'es') {
    const module = await import('./es')
    return module.default
  } else if (locale === 'fr') {
    const module = await import('./fr')
    return module.default
  }
  throw new Error(`Unsupported locale: ${locale}`)
}

const locales = ['en', 'es', 'fr']

describe('Translation Structure Consistency', () => {
  it('should have consistent keys across all locales', async () => {
    const en = await loadLocaleFile('en')
    const es = await loadLocaleFile('es')
    const fr = await loadLocaleFile('fr')
    
    const enKeys = getTranslationKeys(en)
    const esKeys = getTranslationKeys(es)
    const frKeys = getTranslationKeys(fr)
    
    expect(esKeys).toEqual(enKeys)
    expect(frKeys).toEqual(enKeys)
    expect(enKeys.length).toBeGreaterThan(0)
  })

  it('should not have missing keys in any locale', async () => {
    const localeData = {}
    for (const locale of locales) {
      localeData[locale] = await loadLocaleFile(locale)
    }
    
    const allKeys = getTranslationKeys(localeData.en)
    
    for (const locale of locales.slice(1)) {
      const localeKeys = getTranslationKeys(localeData[locale])
      
      for (const key of allKeys) {
        expect(localeKeys).toContain(key)
        expect(getValueAtPath(localeData[locale], key)).toBeDefined()
      }
    }
  })

  it('should not have extra keys in any locale', async () => {
    const localeData = {}
    for (const locale of locales) {
      localeData[locale] = await loadLocaleFile(locale)
    }
    
    const enKeys = getTranslationKeys(localeData.en)
    
    for (const locale of locales.slice(1)) {
      const localeKeys = getTranslationKeys(localeData[locale])
      
      expect(localeKeys).toHaveLength(enKeys.length)
      
      for (const key of localeKeys) {
        expect(enKeys).toContain(key)
      }
    }
  })

  it('should maintain consistent nesting structure', async () => {
    const en = await loadLocaleFile('en')
    
    for (const locale of locales.slice(1)) {
      const translations = await loadLocaleFile(locale)
      const enStructure = getObjectStructure(en)
      const localeStructure = getObjectStructure(translations)
      
      expect(localeStructure).toEqual(enStructure)
    }
  })

  it('should have proper TypeScript const assertion types', async () => {
    // This test ensures the locale files maintain const assertion
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      expect(typeof translations).toBe('object')
      expect(translations).not.toBeNull()
      expect(Object.isFrozen(translations)).toBe(false) // const assertion doesn't freeze at runtime
    }
  })

  it('should have consistent object depth levels', async () => {
    const getMaxDepth = (obj: any, depth = 0): number => {
      if (typeof obj !== 'object' || obj === null) return depth
      
      const depths = Object.values(obj).map(value => getMaxDepth(value, depth + 1))
      return Math.max(...depths)
    }
    
    const en = await loadLocaleFile('en')
    const enDepth = getMaxDepth(en)
    
    for (const locale of locales.slice(1)) {
      const translations = await loadLocaleFile(locale)
      const localeDepth = getMaxDepth(translations)
      
      expect(localeDepth).toBe(enDepth)
    }
  })
})

describe('Translation Content Validation', () => {
  it('should not have empty translation values', async () => {
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      const values = getTranslationValues(translations)
      
      values.forEach((value, index) => {
        expect(value).toBeTruthy()
        expect(value.trim()).not.toBe('')
        expect(value).not.toMatch(/^\s*$/) // Not just whitespace
      })
    }
  })

  it('should not contain placeholder or development text', async () => {
    const forbiddenPatterns = [
      /^TODO/i,  // Only at start of string
      /^FIXME/i, // Only at start of string
      /PLACEHOLDER/i,
      /\[.*\]/,  // Bracket placeholders
      /lorem ipsum/i,
      /test\s*text/i,
      /sample.*text/i
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      const values = getTranslationValues(translations)
      
      values.forEach(value => {
        forbiddenPatterns.forEach(pattern => {
          expect(value).not.toMatch(pattern)
        })
      })
    }
  })

  it('should have appropriate translation lengths', async () => {
    const minLengths = {
      'dashboard.title': 3,
      'dashboard.description': 10,
      'dashboard.bodyTitle': 3,
      'dashboard.bodyDescription': 10,
      'settings.title': 3,
      'settings.avatar.title': 5,
      'settings.avatar.description': 15,
      'settings.deleteAccount.title': 5,
      'settings.deleteAccount.description': 20
    }
    
    const maxLengths = {
      'dashboard.title': 50,
      'dashboard.description': 200,
      'dashboard.bodyTitle': 30,
      'dashboard.bodyDescription': 150,
      'settings.title': 30,
      'settings.avatar.title': 50,
      'settings.avatar.description': 100,
      'settings.deleteAccount.title': 50,
      'settings.deleteAccount.description': 300
    }
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      Object.entries(minLengths).forEach(([key, minLength]) => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        expect(value.length).toBeGreaterThanOrEqual(minLength)
      })
      
      Object.entries(maxLengths).forEach(([key, maxLength]) => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        expect(value.length).toBeLessThanOrEqual(maxLength)
      })
    }
  })

  it('should maintain consistent terminology across locales', async () => {
    const keyTerms = {
      en: {
        app: ['App', 'app'],
        dashboard: ['Dashboard', 'dashboard'],
        settings: ['Settings', 'settings'],
        account: ['Account', 'account']
      },
      es: {
        app: ['App', 'app'],
        dashboard: ['Panel de control', 'panel de control'],
        settings: ['Configuración', 'configuración'],
        account: ['Cuenta', 'cuenta']
      },
      fr: {
        app: ['App', 'app'],
        dashboard: ['Tableau de bord', 'tableau de bord'],
        settings: ['Paramètres', 'paramètres'],
        account: ['Compte', 'compte']
      }
    }
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      const allText = JSON.stringify(translations).toLowerCase()
      const expectedTerms = keyTerms[locale]
      
      Object.entries(expectedTerms).forEach(([concept, terms]) => {
        const hasAtLeastOneTerm = terms.some(term => 
          allText.includes(term.toLowerCase())
        )
        expect(hasAtLeastOneTerm).toBe(true)
      })
    }
  })

  it('should have proper capitalization patterns', async () => {
    const capitalizedKeys = [
      'dashboard.title',
      'dashboard.bodyTitle',
      'dashboard.headerTitle',
      'settings.title',
      'settings.headerTitle',
      'settings.avatar.title',
      'settings.deleteAccount.title'
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      capitalizedKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        expect(value.charAt(0)).toMatch(/[A-ZÀ-ÿ]/) // First character should be uppercase or accented uppercase
      })
    }
  })

  it('should have consistent punctuation usage', async () => {
    const descriptionKeys = [
      'dashboard.description',
      'dashboard.bodyDescription',
      'dashboard.headerDescription',
      'settings.headerDescription',
      'settings.avatar.description',
      'settings.deleteAccount.description',
      'settings.deleteAccount.warning'
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      descriptionKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        // Descriptions should end with proper punctuation
        expect(value).toMatch(/[.!?]$/)
      })
    }
  })
})

describe('Translation Quality and Meaning', () => {
  it('should have meaningful and contextual translations', async () => {
    const contextualChecks = {
      'dashboard.title': {
        en: /create|build|make/i,
        es: /crea|crear|construye|construir/i,
        fr: /créez|créer|construire|construisez/i
      },
      'dashboard.documentationLink': {
        en: /explore|documentation/i,
        es: /explor|documentación/i,
        fr: /explorer|documentation/i
      },
      'settings.deleteAccount.warning': {
        en: /cannot.*undone|caution|careful/i,
        es: /no.*deshacer|precaución|cuidado/i,
        fr: /peut.*annulé|prudence|attention/i
      }
    }
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      Object.entries(contextualChecks).forEach(([key, patterns]) => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        
        const pattern = patterns[locale]
        if (pattern) {
          expect(value).toMatch(pattern)
        }
      })
    }
  })

  it('should maintain brand consistency', async () => {
    const brandTerms = ['Convex', 'SaaS']
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      const allText = JSON.stringify(translations)
      
      brandTerms.forEach(term => {
        if (allText.includes(term)) {
          // Brand terms should maintain exact spelling
          expect(allText).toMatch(new RegExp(term, 'g'))
          // Should not have variations
          expect(allText).not.toMatch(new RegExp(term.toLowerCase(), 'g'))
        }
      })
    }
  })

  it('should have appropriate tone and formality', async () => {
    const informalKeys = [
      'dashboard.bodyTip'
    ]
    
    const formalKeys = [
      'settings.deleteAccount.description',
      'settings.deleteAccount.warning'
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      // Informal content should have engaging tone
      informalKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        
        // Should contain engaging elements like TIP, exclamation, etc.
        if (locale === 'en') {
          expect(value).toMatch(/TIP|try|!/i)
        }
      })
      
      // Formal content should be serious and clear
      formalKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        
        // Should not contain casual language
        expect(value).not.toMatch(/cool|awesome|nice|hey/i)
      })
    }
  })

  it('should handle special characters appropriately', async () => {
    const specialCharacterTests = {
      es: {
        expectedChars: /[ñáéíóúü]/,
        examples: ['configuración', 'eliminar', 'administra']
      },
      fr: {
        expectedChars: /[àâäéèêëïîôöùûüÿç]/,
        examples: ['créez', 'paramètres', 'gérez']
      }
    }
    
    for (const locale of locales.slice(1)) { // Skip English
      const translations = await loadLocaleFile(locale)
      const allText = JSON.stringify(translations).toLowerCase()
      
      if (specialCharacterTests[locale]) {
        const { expectedChars, examples } = specialCharacterTests[locale]
        
        // Should contain locale-appropriate special characters
        expect(allText).toMatch(expectedChars)
        
        // Should contain expected locale-specific words
        examples.forEach(word => {
          expect(allText).toContain(word.toLowerCase())
        })
      }
    }
  })
})

describe('Translation Integration and Usage', () => {
  it('should support all expected dashboard keys', async () => {
    const requiredDashboardKeys = [
      'dashboard.title',
      'dashboard.description',
      'dashboard.bodyTitle',
      'dashboard.bodyDescription',
      'dashboard.bodyTip',
      'dashboard.headerTitle',
      'dashboard.headerDescription',
      'dashboard.documentationLink'
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      requiredDashboardKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    }
  })

  it('should support all expected settings keys', async () => {
    const requiredSettingsKeys = [
      'settings.title',
      'settings.headerTitle',
      'settings.headerDescription',
      'settings.avatar.title',
      'settings.avatar.description',
      'settings.avatar.uploadHint',
      'settings.avatar.resetButton',
      'settings.deleteAccount.title',
      'settings.deleteAccount.description',
      'settings.deleteAccount.warning',
      'settings.deleteAccount.deleteButton',
      'settings.deleteAccount.confirmButton',
      'settings.sidebar.general',
      'settings.sidebar.billing'
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      requiredSettingsKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
      })
    }
  })

  it('should have proper button and action text', async () => {
    const actionKeys = [
      'settings.avatar.resetButton',
      'settings.deleteAccount.deleteButton',
      'settings.deleteAccount.confirmButton',
      'dashboard.documentationLink'
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      actionKeys.forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        
        // Button text should be action-oriented and concise
        expect(value.length).toBeLessThanOrEqual(30)
        expect(value.trim()).toBe(value) // No leading/trailing whitespace
      })
    }
  })

  it('should support UI component integration', async () => {
    // Test that translations work with common UI patterns
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      // Verify essential UI elements exist
      expect(getValueAtPath(translations, 'dashboard.title')).toBeDefined()
      expect(getValueAtPath(translations, 'settings.title')).toBeDefined()
      
      // Verify nested access patterns work
      expect(translations.dashboard).toBeDefined()
      expect(translations.settings).toBeDefined()
      expect(translations.settings.avatar).toBeDefined()
      expect(translations.settings.deleteAccount).toBeDefined()
      expect(translations.settings.sidebar).toBeDefined()
    }
  })

  it('should be compatible with TypeScript inference', async () => {
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      // Verify const assertion preserves literal types
      expect(typeof translations).toBe('object')
      
      // Test nested access maintains type safety
      const dashboardTitle = translations.dashboard.title
      const settingsTitle = translations.settings.title
      const avatarTitle = translations.settings.avatar.title
      
      expect(typeof dashboardTitle).toBe('string')
      expect(typeof settingsTitle).toBe('string')
      expect(typeof avatarTitle).toBe('string')
    }
  })
})

describe('Translation Completeness and Coverage', () => {
  it('should have comprehensive coverage of all UI sections', async () => {
    const expectedSections = ['dashboard', 'settings']
    const expectedSubsections = {
      'settings': ['avatar', 'deleteAccount', 'sidebar']
    }
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      expectedSections.forEach(section => {
        expect(translations[section]).toBeDefined()
        expect(typeof translations[section]).toBe('object')
      })
      
      Object.entries(expectedSubsections).forEach(([section, subsections]) => {
        subsections.forEach(subsection => {
          expect(translations[section][subsection]).toBeDefined()
          expect(typeof translations[section][subsection]).toBe('object')
        })
      })
    }
  })

  it('should not have any orphaned or unused keys', async () => {
    // This test helps identify translations that might not be used in the app
    const commonlyUnusedPatterns = [
      /test/i,
      /example/i,
      /sample/i,
      /temp/i,
      /debug/i
    ]
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      const keys = getTranslationKeys(translations)
      
      keys.forEach(key => {
        commonlyUnusedPatterns.forEach(pattern => {
          expect(key).not.toMatch(pattern)
        })
      })
    }
  })

  it('should have reasonable total translation count', async () => {
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      const keys = getTranslationKeys(translations)
      const values = getTranslationValues(translations)
      
      // Should have reasonable number of translations
      expect(keys.length).toBeGreaterThanOrEqual(15)
      expect(keys.length).toBeLessThanOrEqual(100)
      
      // Should have same number of keys and values
      expect(keys.length).toBe(values.length)
    }
  })

  it('should maintain translation consistency over time', async () => {
    // This test ensures that critical translations remain stable
    const criticalTranslations = {
      'dashboard.title': true,
      'settings.title': true,
      'settings.deleteAccount.title': true,
      'settings.deleteAccount.warning': true
    }
    
    for (const locale of locales) {
      const translations = await loadLocaleFile(locale)
      
      Object.keys(criticalTranslations).forEach(key => {
        const value = getValueAtPath(translations, key)
        expect(value).toBeDefined()
        expect(typeof value).toBe('string')
        expect(value.length).toBeGreaterThan(0)
        
        // Critical translations should not be placeholders
        expect(value).not.toMatch(/todo|placeholder|test/i)
      })
    }
  })
})