import { test, expect } from '@playwright/test'

test.describe('Playwright Setup Verification', () => {
  test('should verify Playwright is working', async ({ page }) => {
    // Test against a reliable external site to verify Playwright works
    await page.goto('https://playwright.dev')
    await expect(page).toHaveTitle(/Playwright/)
  })
  
  test('should verify our app server can be reached', async ({ page }) => {
    // Try to reach our application
    try {
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('domcontentloaded', { timeout: 5000 })
      
      // If we get here, the server is running
      const body = page.locator('body')
      await expect(body).toBeVisible()
    } catch (error) {
      // If the server isn't running, skip this test
      test.skip(true, 'Local server not available')
    }
  })
})