import { Page, Locator, expect } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly userMenu: Locator
  readonly userAvatar: Locator
  readonly userName: Locator
  readonly settingsLink: Locator
  readonly billingLink: Locator
  readonly signOutButton: Locator
  readonly navigation: Locator
  readonly themeToggle: Locator
  readonly languageSwitcher: Locator

  constructor(page: Page) {
    this.page = page
    this.userMenu = page.locator('[data-testid="user-menu"]')
    this.userAvatar = page.locator('[data-testid="user-avatar"]')
    this.userName = page.locator('[data-testid="user-name"]')
    this.settingsLink = page.getByRole('link', { name: /settings/i })
    this.billingLink = page.getByRole('link', { name: /billing/i })
    this.signOutButton = page.getByRole('button', { name: /sign.*out|logout/i })
    this.navigation = page.locator('[data-testid="navigation"]')
    this.themeToggle = page.locator('[data-testid="theme-toggle"]')
    this.languageSwitcher = page.locator('[data-testid="language-switcher"]')
  }

  async goto() {
    await this.page.goto('/dashboard')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForLoad() {
    await expect(this.userMenu).toBeVisible({ timeout: 10000 })
    await this.page.waitForLoadState('networkidle')
  }

  async openUserMenu() {
    await this.userMenu.click()
    await expect(this.settingsLink).toBeVisible()
  }

  async navigateToSettings() {
    await this.openUserMenu()
    await this.settingsLink.click()
    await expect(this.page).toHaveURL(/.*settings.*/)
  }

  async navigateToBilling() {
    await this.openUserMenu()
    await this.billingLink.click()
    await expect(this.page).toHaveURL(/.*billing.*/)
  }

  async signOut() {
    await this.openUserMenu()
    await this.signOutButton.click()
    // Should redirect to login or home page
    await expect(this.page).toHaveURL(/https?:\/\/[^/]+\/(login.*)?$/i)
  }

  async expectUserInfo(name: string, email?: string) {
    await expect(this.userName).toContainText(name)
    if (email) {
      await expect(this.page.locator('text=' + email)).toBeVisible()
    }
  }

  async toggleTheme() {
    const initialTheme = await this.page.evaluate(() => document.documentElement.classList.contains('dark'))
    await this.themeToggle.click()
    
    // Wait for theme change
    await this.page.waitForTimeout(500)
    
    const newTheme = await this.page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(newTheme).toBe(!initialTheme)
  }

  async switchLanguage(language: string) {
    await this.languageSwitcher.click()
    await this.page.getByRole('option', { name: language }).click()
    
    // Wait for language change to apply
    await this.page.waitForTimeout(1000)
  }

  async expectDashboardElements() {
    await expect(this.userMenu).toBeVisible()
    await expect(this.navigation).toBeVisible()
    await expect(this.themeToggle).toBeVisible()
  }
}