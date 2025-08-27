import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the polar SDK for init.ts testing
const mockPolarProducts = {
  list: vi.fn(),
  create: vi.fn()
}

vi.mock('./subscriptions', () => ({
  polar: {
    sdk: {
      products: mockPolarProducts
    }
  }
}))

// Mock internal action wrapper 
vi.mock('./_generated/server', () => ({
  internalAction: vi.fn((fn) => fn)
}))

/**
 * Test suite for init.ts - Database initialization functionality
 * 
 * This module tests the initialization of Polar products in the database.
 * The init action creates Pro subscription products (monthly and yearly)
 * if no unarchived products exist in Polar.
 * 
 * @see {@link ../init.ts} - Source file
 */
describe('Database Initialization (init.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Product Creation Logic', () => {
    it('should skip product creation when unarchived products exist', async () => {
      // Mock existing products response
      mockPolarProducts.list.mockResolvedValueOnce({
        result: {
          items: [
            { id: 'prod_1', name: 'Existing Pro', isArchived: false }
          ]
        }
      })

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      // Import and execute the init action
      const { default: initAction } = await import('./init')
      await initAction()

      // Verify products.list was called
      expect(mockPolarProducts.list).toHaveBeenCalledWith({
        isArchived: false
      })

      // Verify products.create was NOT called
      expect(mockPolarProducts.create).not.toHaveBeenCalled()

      // Verify skip message was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '🏃‍♂️ Skipping Polar products creation and seeding.'
      )

      consoleSpy.mockRestore()
    })

    it('should create Pro products when no unarchived products exist', async () => {
      // Mock no existing products response
      mockPolarProducts.list.mockResolvedValueOnce({
        result: { items: [] }
      })

      // Mock successful product creation
      mockPolarProducts.create
        .mockResolvedValueOnce({ id: 'prod_monthly' })
        .mockResolvedValueOnce({ id: 'prod_yearly' })

      const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      const { default: initAction } = await import('./init')
      await initAction()

      // Verify products.list was called
      expect(mockPolarProducts.list).toHaveBeenCalledWith({
        isArchived: false
      })

      // Verify monthly product was created
      expect(mockPolarProducts.create).toHaveBeenCalledWith({
        name: 'Pro',
        description: 'All the things for one low monthly price.',
        recurringInterval: 'month',
        prices: [{
          priceAmount: 2000,
          amountType: 'fixed'
        }]
      })

      // Verify yearly product was created
      expect(mockPolarProducts.create).toHaveBeenCalledWith({
        name: 'Pro',
        description: 'All the things for one low yearly price.',
        recurringInterval: 'year',
        prices: [{
          priceAmount: 20000,
          amountType: 'fixed'
        }]
      })

      // Verify success message was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        '📦 Polar Products have been successfully created.'
      )

      consoleSpy.mockRestore()
    })

    it('should handle empty items array', async () => {
      mockPolarProducts.list.mockResolvedValueOnce({
        result: { items: [] }
      })

      mockPolarProducts.create
        .mockResolvedValueOnce({ id: 'prod_monthly' })
        .mockResolvedValueOnce({ id: 'prod_yearly' })

      const { default: initAction } = await import('./init')
      
      // Should not throw and should create products
      await expect(initAction()).resolves.not.toThrow()
      expect(mockPolarProducts.create).toHaveBeenCalledTimes(2)
    })

    it('should handle missing result property', async () => {
      // Mock response without result property
      mockPolarProducts.list.mockResolvedValueOnce({})

      mockPolarProducts.create
        .mockResolvedValueOnce({ id: 'prod_monthly' })
        .mockResolvedValueOnce({ id: 'prod_yearly' })

      const { default: initAction } = await import('./init')
      await initAction()

      expect(mockPolarProducts.create).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling', () => {
    it('should handle Polar API errors during product listing', async () => {
      // Mock API error
      mockPolarProducts.list.mockRejectedValueOnce(
        new Error('Polar API unavailable')
      )

      const { default: initAction } = await import('./init')

      // Should throw the error
      await expect(initAction()).rejects.toThrow('Polar API unavailable')
    })

    it('should handle Polar API errors during product creation', async () => {
      // Mock successful list call but failed creation
      mockPolarProducts.list.mockResolvedValueOnce({
        result: { items: [] }
      })
      mockPolarProducts.create.mockRejectedValueOnce(
        new Error('Product creation failed')
      )

      const { default: initAction } = await import('./init')

      // Should throw the error
      await expect(initAction()).rejects.toThrow('Product creation failed')
    })
  })

  describe('Action Properties', () => {
    it('should be an internal action', async () => {
      const initModule = await import('./init')
      
      // Verify it's exported as default
      expect(initModule.default).toBeDefined()
      expect(typeof initModule.default).toBe('function')
    })
  })
})