import { test, expect } from '@playwright/test'

test.describe('Preview Deployment Tests', () => {
  test('should load with correct environment', async ({ page }) => {
    await page.goto('/')
    
    // Verify the preview deployment is live
    await expect(page).toHaveTitle(/v1/i)
    
    // Check that essential routes are working
    const routes = ['/', '/login', '/signup']
    
    for (const route of routes) {
      await page.goto(route)
      
      // Should not show 404 or 500 errors
      await expect(page.locator('body')).not.toContainText(/404|not found|500|server error/i)
      
      // Should have basic HTML structure
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })
  
  test('should handle API routes', async ({ page, request }) => {
    // Test health check endpoint (if exists)
    const healthResponse = await request.get('/api/health').catch(() => null)
    if (healthResponse) {
      expect(healthResponse.status()).toBeLessThan(500)
    }
    
    // Test that the app loads and doesn't crash
    await page.goto('/')
    
    // Check for any critical JavaScript errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    
    // Allow some favicon/resource errors but no critical JS errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('manifest.json') &&
      !error.includes('apple-touch-icon')
    )
    
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors)
    }
    
    expect(criticalErrors.length).toBe(0)
  })
  
  test('should handle authentication flow', async ({ page }) => {
    // Test that auth pages load properly
    await page.goto('/login')
    await expect(page.locator('body')).toBeVisible()
    
    await page.goto('/signup')  
    await expect(page.locator('body')).toBeVisible()
    
    // Basic form elements should be present
    const emailInput = page.getByRole('textbox', { name: /email/i }).or(
      page.locator('input[type="email"]')
    )
    
    if (await emailInput.count() > 0) {
      await expect(emailInput.first()).toBeVisible()
    }
  })
  
  test('should have responsive design', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
    
    // Should not have horizontal scroll on mobile
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10) // Allow small tolerance
  })
  
  test('should load critical assets', async ({ page }) => {
    const failedRequests: string[] = []
    
    page.on('response', (response) => {
      if (!response.ok() && response.status() !== 404) {
        failedRequests.push(`${response.status()} - ${response.url()}`)
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out expected 404s for optional assets
    const criticalFailures = failedRequests.filter(req => 
      !req.includes('favicon') && 
      !req.includes('apple-touch-icon') &&
      !req.includes('manifest.json')
    )
    
    if (criticalFailures.length > 0) {
      console.log('Critical asset failures:', criticalFailures)
    }
    
    expect(criticalFailures.length).toBe(0)
  })
})