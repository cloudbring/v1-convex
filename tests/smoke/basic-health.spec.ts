import { test, expect } from '@playwright/test'

test.describe('Basic Health Check', () => {
  test('server should be running and responsive', async ({ page }) => {
    // Simple test to verify the server is responding
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('domcontentloaded')
    
    // Basic checks that the page loaded
    const body = page.locator('body')
    await expect(body).toBeVisible()
    
    // Check that we don't have a generic error page
    await expect(page).not.toHaveTitle(/Error|404|500/)
  })
})