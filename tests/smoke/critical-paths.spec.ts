import { test, expect } from '@playwright/test'

test.describe('Smoke Tests - Critical Paths', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/v1/i)
    
    // Check for essential elements
    const header = page.locator('header').or(page.locator('[data-testid="header"]'))
    await expect(header).toBeVisible()
    
    // Check that no console errors occurred
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    expect(errors.length).toBe(0)
  })

  test('should load login page successfully', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page).toHaveTitle(/login|sign.*in/i)
    
    // Check for login form elements
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sign.*in|login/i })).toBeVisible()
  })

  test('should load signup page successfully', async ({ page }) => {
    await page.goto('/signup')
    
    // Should not have any major JS errors
    const errors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        errors.push(msg.text())
      }
    })
    
    await page.waitForLoadState('networkidle')
    
    // Basic form elements should be present
    const emailInput = page.getByRole('textbox', { name: /email/i })
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    
    expect(errors.length).toBe(0)
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page')
    
    // Should return 404 status
    expect(response?.status()).toBe(404)
    
    // Should display a 404 page instead of crashing
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
    expect(content!.length).toBeGreaterThan(0)
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Try to find and click navigation links
    const navLinks = page.locator('nav a').or(page.locator('[data-testid="nav"] a'))
    const linkCount = await navLinks.count()
    
    if (linkCount > 0) {
      // Test first navigation link
      const firstLink = navLinks.first()
      const href = await firstLink.getAttribute('href')
      
      if (href && !href.startsWith('http')) {
        await firstLink.click()
        await page.waitForLoadState('networkidle')
        
        // Should navigate successfully
        expect(page.url()).toContain(href)
      }
    }
  })

  test('should have responsive design', async ({ page }) => {
    await page.goto('/')
    
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.waitForLoadState('networkidle')
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForLoadState('networkidle')
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForLoadState('networkidle')
    
    // Page should still be functional
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Check if mobile menu exists
    const mobileMenu = page.locator('[data-testid="mobile-menu"]').or(
      page.locator('button[aria-label*="menu"]')
    )
    
    if (await mobileMenu.isVisible()) {
      await mobileMenu.click()
      await page.waitForTimeout(500) // Wait for menu animation
    }
  })

  test('should load static assets correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check for failed network requests
    const failedRequests: string[] = []
    
    page.on('response', (response) => {
      if (!response.ok() && response.status() !== 404) {
        failedRequests.push(`${response.status()} - ${response.url()}`)
      }
    })
    
    await page.waitForLoadState('networkidle')
    
    // Allow some tolerance for 404s on favicon, etc.
    const criticalFailures = failedRequests.filter(req => 
      !req.includes('favicon') && 
      !req.includes('apple-touch-icon') &&
      !req.includes('manifest.json')
    )
    
    expect(criticalFailures.length).toBe(0)
  })

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/')
    
    // Check essential meta tags
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)
    
    const description = await page.getAttribute('meta[name="description"]', 'content')
    if (description) {
      expect(description.length).toBeGreaterThan(0)
    }
    
    const viewport = await page.getAttribute('meta[name="viewport"]', 'content')
    expect(viewport).toBeTruthy()
  })

  test('should handle JavaScript disabled gracefully', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false })
    const page = await context.newPage()
    
    await page.goto('/')
    
    // Page should still render basic content
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
    expect(body!.length).toBeGreaterThan(0)
    
    await context.close()
  })

  test('should have fast page load times', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within reasonable time (adjust as needed)
    expect(loadTime).toBeLessThan(10000) // 10 seconds max
  })
})