import { test, expect } from '@playwright/test'
import { AuthPage } from '../page-objects/auth.page'
import { DashboardPage } from '../page-objects/dashboard.page'
import { testUsers, testData } from '../fixtures/users'

test.describe('Authentication Flow', () => {
  let authPage: AuthPage
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page)
    dashboardPage = new DashboardPage(page)
  })

  test.describe('Sign In', () => {
    test('should sign in with valid credentials', async ({ page }) => {
      await authPage.goto('/login')
      await authPage.signIn(testUsers.validUser.email, testUsers.validUser.password)
      await authPage.expectSuccessfulLogin()
      
      await dashboardPage.waitForLoad()
      await dashboardPage.expectDashboardElements()
    })

    test('should show error for invalid email', async ({ page }) => {
      await authPage.goto('/login')
      await authPage.signIn('invalid-email', testUsers.validUser.password)
      await authPage.expectError()
    })

    test('should show error for wrong password', async ({ page }) => {
      await authPage.goto('/login')
      await authPage.signIn(testUsers.validUser.email, 'wrongpassword')
      await authPage.expectError()
    })

    test('should show error for empty fields', async ({ page }) => {
      await authPage.goto('/login')
      await authPage.signIn('', '')
      await authPage.expectError()
    })

    test('should navigate to forgot password page', async ({ page }) => {
      await authPage.goto('/login')
      await authPage.clickForgotPassword()
      await expect(page).toHaveURL(/.*forgot.*password.*/)
    })

    test('should navigate to sign up page', async ({ page }) => {
      await authPage.goto('/login')
      await authPage.navigateToSignUp()
      await expect(page).toHaveURL(/.*signup.*/)
    })
  })

  test.describe('Sign Up', () => {
    test('should sign up with valid information', async ({ page }) => {
      const newUser = testUsers.newUser()
      
      await authPage.goto('/signup')
      await authPage.signUp(newUser.name, newUser.email, newUser.password)
      
      // Should redirect to onboarding or dashboard
      await expect(page).toHaveURL(/.*(?:onboarding|dashboard).*/)
    })

    test('should show error for invalid email format', async ({ page }) => {
      await authPage.goto('/signup')
      
      for (const invalidEmail of testData.invalidEmails) {
        await authPage.signUp('Test User', invalidEmail, 'Password123!')
        await authPage.expectError()
        
        // Clear form for next test
        await page.reload()
      }
    })

    test('should show error for weak passwords', async ({ page }) => {
      await authPage.goto('/signup')
      
      for (const weakPassword of testData.invalidPasswords) {
        await authPage.signUp('Test User', 'test@example.com', weakPassword)
        await authPage.expectError()
        
        // Clear form for next test
        await page.reload()
      }
    })

    test('should show error for existing email', async ({ page }) => {
      await authPage.goto('/signup')
      await authPage.signUp(
        'Another User',
        testUsers.validUser.email, // Use existing email
        'Password123!'
      )
      await authPage.expectError('already exists')
    })

    test('should navigate back to sign in', async ({ page }) => {
      await authPage.goto('/signup')
      await authPage.navigateToSignIn()
      await expect(page).toHaveURL(/.*login.*/)
    })
  })

  test.describe('Google OAuth', () => {
    test.skip('should sign in with Google', async ({ page }) => {
      // Skip this test unless you have Google OAuth configured in test environment
      await authPage.goto('/login')
      // Mock or test Google sign-in flow
      // This would require additional setup for testing OAuth
    })
  })

  test.describe('Session Management', () => {
    test('should maintain session after page refresh', async ({ page }) => {
      // Sign in first
      await authPage.goto('/login')
      await authPage.signIn(testUsers.validUser.email, testUsers.validUser.password)
      await authPage.expectSuccessfulLogin()
      
      // Refresh page
      await page.reload()
      await dashboardPage.waitForLoad()
      
      // Should still be signed in
      await dashboardPage.expectDashboardElements()
    })

    test('should sign out successfully', async ({ page }) => {
      // Sign in first
      await authPage.goto('/login')
      await authPage.signIn(testUsers.validUser.email, testUsers.validUser.password)
      await authPage.expectSuccessfulLogin()
      
      await dashboardPage.waitForLoad()
      await dashboardPage.signOut()
      
      // Should be redirected to login page
      await expect(page).toHaveURL(/.*login.*/)
    })

    test('should redirect to login when accessing protected route while signed out', async ({ page }) => {
      await page.goto('/dashboard/settings')
      await expect(page).toHaveURL(/.*login.*/)
    })
  })

  test.describe('Form Validation', () => {
    test('should validate email format in real time', async ({ page }) => {
      await authPage.goto('/login')
      
      await authPage.emailInput.fill('invalid-email')
      await authPage.emailInput.blur()
      
      // Should show validation error
      const emailError = page.locator('[data-testid="email-error"]')
      await expect(emailError).toBeVisible()
    })

    test('should validate password requirements', async ({ page }) => {
      await authPage.goto('/signup')
      
      await authPage.passwordInput.fill('weak')
      await authPage.passwordInput.blur()
      
      // Should show password requirements
      const passwordHelp = page.locator('[data-testid="password-help"]')
      await expect(passwordHelp).toBeVisible()
    })

    test('should disable submit button while form is invalid', async ({ page }) => {
      await authPage.goto('/login')
      
      // Submit button should be disabled initially
      await expect(authPage.submitButton).toBeDisabled()
      
      // Fill valid email
      await authPage.emailInput.fill(testUsers.validUser.email)
      await expect(authPage.submitButton).toBeDisabled()
      
      // Fill valid password
      await authPage.passwordInput.fill(testUsers.validUser.password)
      await expect(authPage.submitButton).toBeEnabled()
    })
  })
})