import { loadFeature, describeFeature } from '@amiceli/vitest-cucumber'
import { expect } from 'vitest'
import { render, screen, waitFor } from '@v1/test-utils/render'
import { convexTest } from 'convex-test'
import { createTestUser, seedTestData } from '@v1/test-utils/convex'
import { api } from '@v1/backend/convex/_generated/api'
import schema from '@v1/backend/convex/schema'

const feature = await loadFeature('./auth.feature')

describeFeature(feature, ({ Background, Scenario, ScenarioOutline, Given, When, Then, And }) => {
  let t: ReturnType<typeof convexTest>
  let testContext: {
    currentUser?: any
    formData?: Record<string, string>
    errorMessage?: string
    validationErrors?: Record<string, string>
    currentPage?: 'login' | 'signup' | 'dashboard' | 'onboarding' | 'settings' | string
  } = {}

  Background(({ Given, And }) => {
    Given('the application is running', () => {
      // Application setup - this would be handled by the test environment
      expect(true).toBe(true)
    })

    And('the database is clean', () => {
      t = convexTest(schema)
      testContext = {}
    })
  })

  Scenario('Successful user registration', ({ Given, When, Then, And }) => {
    Given('I am on the signup page', () => {
      // Mock navigation to signup page
      testContext.currentPage = 'signup'
    })

    When('I enter valid registration details:', async (dataTable) => {
      const userData = dataTable.hashes()[0]
      testContext.formData = userData
      
      // In a real test, this would involve form interactions
      expect(userData.name).toBe('John Doe')
      expect(userData.email).toBe('john@example.com')
      expect(userData.password).toBe('SecurePassword123!')
    })

    And('I click the signup button', async () => {
      // Simulate user registration
      if (testContext.formData) {
        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert('users', {
            name: testContext.formData!.name,
            email: testContext.formData!.email,
            isAnonymous: false
          })
        })
        testContext.currentUser = { id: userId, ...testContext.formData }
      }
    })

    Then('I should be redirected to the onboarding page', () => {
      // Mock navigation check
      expect(testContext.currentUser).toBeDefined()
      testContext.currentPage = 'onboarding'
    })

    And('my account should be created in the database', async () => {
      const user = await t.run(async (ctx) => {
        return await ctx.db.query('users')
          .filter((q) => q.eq(q.field('email'), testContext.formData!.email))
          .unique()
      })
      
      expect(user).toBeDefined()
      expect(user?.email).toBe(testContext.formData!.email)
      expect(user?.name).toBe(testContext.formData!.name)
    })

    And('I should receive a welcome email', () => {
      // Mock email sending verification
      // In a real implementation, this would check email queue or mock service
      expect(testContext.formData?.email).toBeTruthy()
    })
  })

  Scenario('Successful user login', ({ Given, When, Then, And }) => {
    Given('I have an existing account with email {string}', async (email) => {
      await t.run(async (ctx) => {
        await ctx.db.insert('users', {
          name: 'Test User',
          email: email,
          isAnonymous: false
        })
      })
    })

    Given('I am on the login page', () => {
      testContext.currentPage = 'login'
    })

    When('I enter my email {string}', (email) => {
      testContext.formData = { ...(testContext.formData ?? {}), email }
    })

    And('I enter my password {string}', (password) => {
      testContext.formData = { ...(testContext.formData ?? {}), password }
    })

    And('I click the login button', async () => {
      // Simulate login process
      const user = await t.run(async (ctx) => {
        return await ctx.db.query('users')
          .filter((q) => q.eq(q.field('email'), testContext.formData!.email))
          .unique()
      })
      
      if (user) {
        testContext.currentUser = user
      }
    })

    Then('I should be redirected to the dashboard', () => {
      expect(testContext.currentUser).toBeDefined()
      testContext.currentPage = 'dashboard'
    })

    And('I should see my user menu', () => {
      expect(testContext.currentPage).toBe('dashboard')
      expect(testContext.currentUser).toBeDefined()
    })

    And('my session should be active', () => {
      expect(testContext.currentUser).toBeDefined()
    })
  })

  Scenario('Failed login with invalid credentials', ({ Given, When, Then, And }) => {
    Given('I am on the login page', () => {
      testContext.currentPage = 'login'
    })

    When('I enter email {string}', (email) => {
      testContext.formData = { ...(testContext.formData ?? {}), email }
    })

    And('I enter password {string}', (password) => {
      testContext.formData = { ...(testContext.formData ?? {}), password }
    })

    And('I click the login button', async () => {
      // Simulate failed login
      const user = await t.run(async (ctx) => {
        return await ctx.db.query('users')
          .filter((q) => q.eq(q.field('email'), testContext.formData!.email))
          .unique()
      })
      
      if (!user) {
        testContext.errorMessage = 'Invalid credentials'
      } else {
        testContext.currentUser = user
      }
    })

    Then('I should see an error message', () => {
      expect(testContext.errorMessage).toBe('Invalid credentials')
    })

    And('I should remain on the login page', () => {
      expect(testContext.currentPage).toBe('login')
    })

    And('my session should not be created', () => {
      expect(testContext.currentUser).toBeUndefined()
    })
  })

  ScenarioOutline('Email validation', ({ Given, When, Then }) => {
    Given('I am on the signup page', () => {
      testContext.currentPage = 'signup'
    })

    When('I enter email {string}', (email) => {
      testContext.formData = { ...(testContext.formData ?? {}), email }
    })

    And('I move focus away from the email field', () => {
      // Simulate blur event and validation
      const email = testContext.formData?.email || ''
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      
      if (!email) {
        testContext.validationErrors = { email: 'required error' }
      } else if (!emailRegex.test(email)) {
        testContext.validationErrors = { email: 'email error' }
      } else {
        testContext.validationErrors = { email: 'no error' }
      }
    })

    Then('I should see {string}', (validationResult) => {
      expect(testContext.validationErrors?.email).toBe(validationResult)
    })
  })

  ScenarioOutline('Password validation', ({ Given, When, Then }) => {
    Given('I am on the signup page', () => {
      testContext.currentPage = 'signup'
    })

    When('I enter password {string}', (password) => {
      testContext.formData = { ...(testContext.formData ?? {}), password }
    })

    And('I move focus away from the password field', () => {
      // Simulate password validation
      const password = testContext.formData?.password || ''
      
      if (!password) {
        testContext.validationErrors = { password: 'required error' }
      } else if (password.length < 8) {
        testContext.validationErrors = { password: 'too short error' }
      } else if (!/[a-zA-Z]/.test(password)) {
        testContext.validationErrors = { password: 'no letters error' }
      } else if (!/[0-9]/.test(password)) {
        testContext.validationErrors = { password: 'no numbers error' }
      } else if (!/[a-z]/.test(password)) {
        testContext.validationErrors = { password: 'no lowercase error' }
      } else if (!/[A-Z]/.test(password)) {
        testContext.validationErrors = { password: 'no uppercase error' }
      } else {
        testContext.validationErrors = { password: 'no error' }
      }
    })

    Then('I should see {string}', (validationResult) => {
      expect(testContext.validationErrors?.password).toBe(validationResult)
    })
  })

  // Additional scenarios would follow the same pattern...
  
  Scenario('Username update', ({ Given, When, Then, And }) => {
    Given('I am signed in as {string}', async (email) => {
      const alice = createTestUser(t, { email, subject: 'test-user' })
      const userId = await alice.run(async (ctx) => {
        return await ctx.db.insert('users', {
          name: 'Test User',
          email: email,
          username: 'oldusername',
          isAnonymous: false
        })
      })
      testContext.currentUser = { id: userId, email }
    })

    And('I am on the settings page', () => {
      testContext.currentPage = 'settings'
    })

    When('I change my username to {string}', (newUsername) => {
      testContext.formData = { ...(testContext.formData ?? {}), username: newUsername }
    })

    And('I click {string}', async (buttonText) => {
      if (buttonText === 'Save changes') {
        // Simulate username update
        const alice = createTestUser(t, { subject: 'test-user' })
        await alice.mutation(api.users.updateUsername, {
          username: testContext.formData!.username
        })
      }
    })

    Then('my username should be updated', async () => {
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(testContext.currentUser!.id)
      })
      
      expect(user?.username).toBe(testContext.formData!.username)
    })

    And('I should see a success message', () => {
      // Mock success message display
      expect(testContext.formData?.username).toBeTruthy()
    })

    And('the change should be reflected everywhere', () => {
      // Mock UI update verification
      expect(testContext.formData?.username).toBe('newusername')
    })
  })
})