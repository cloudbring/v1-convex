import { Page, Locator, expect } from '@playwright/test'

export class AuthPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly nameInput: Locator
  readonly submitButton: Locator
  readonly googleSignInButton: Locator
  readonly errorMessage: Locator
  readonly successMessage: Locator
  readonly forgotPasswordLink: Locator
  readonly signUpLink: Locator
  readonly signInLink: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByRole('textbox', { name: /email/i })
    this.passwordInput = page.getByRole('textbox', { name: /password/i })
    this.nameInput = page.getByRole('textbox', { name: /name/i })
    this.submitButton = page
      .locator('[data-testid="auth-submit"]')
      .or(page.getByRole('button', { name: /^(sign in|login|register|sign up)$/i }))
    this.googleSignInButton = page.getByRole('button', { name: /google/i })
    this.errorMessage = page.getByRole('alert').or(page.locator('[data-testid="error-message"]'))
    this.successMessage = page.locator('[data-testid="success-message"]')
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i })
    this.signUpLink = page.getByRole('link', { name: /sign.*up|register/i })
    this.signInLink = page.getByRole('link', { name: /sign.*in|login/i })
  }

  async goto(path: '/login' | '/signup' = '/login') {
    await this.page.goto(path)
    await this.page.waitForLoadState('networkidle')
  }

  async signIn(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async signUp(name: string, email: string, password: string) {
    if (await this.nameInput.isVisible()) {
      await this.nameInput.fill(name)
    }
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async signInWithGoogle() {
    await this.googleSignInButton.click()
    // Handle Google OAuth flow if needed
    await this.page.waitForURL('**/dashboard**', { timeout: 30000 })
  }

  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL(/.*dashboard.*/)
    // Wait for any loading states to complete
    await this.page.waitForLoadState('networkidle')
  }

  async expectError(message?: string) {
    await expect(this.errorMessage).toBeVisible()
    if (message) {
      await expect(this.errorMessage).toContainText(message)
    }
  }

  async expectSuccess(message?: string) {
    await expect(this.successMessage).toBeVisible()
    if (message) {
      await expect(this.successMessage).toContainText(message)
    }
  }

  async navigateToSignUp() {
    await this.signUpLink.click()
    await expect(this.page).toHaveURL(/.*signup.*/)
  }

  async navigateToSignIn() {
    await this.signInLink.click()
    await expect(this.page).toHaveURL(/.*login.*/)
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click()
    await expect(this.page).toHaveURL(/.*forgot.*password.*/)
  }
}