import { faker } from '@faker-js/faker'

/**
 * User test fixtures
 */
export const createUserFixture = (overrides?: {
  name?: string
  email?: string
  username?: string
  isAnonymous?: boolean
}) => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  username: faker.internet.userName().toLowerCase(),
  isAnonymous: false,
  emailVerificationTime: Date.now(),
  ...overrides
})

/**
 * Create multiple user fixtures
 */
export const createUsersFixture = (count: number = 3) => {
  return Array.from({ length: count }, (_, i) => 
    createUserFixture({
      email: `testuser${i + 1}@example.com`,
      username: `testuser${i + 1}`,
      name: `Test User ${i + 1}`
    })
  )
}

/**
 * Auth test fixtures
 */
export const authFixtures = {
  validCredentials: {
    email: 'valid@example.com',
    password: 'ValidPassword123!'
  },
  
  invalidCredentials: {
    email: 'invalid@example.com',
    password: 'WrongPassword'
  },
  
  newUser: {
    name: 'New User',
    email: 'new@example.com',
    password: 'NewPassword123!'
  },
  
  adminUser: {
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin'
  }
}

/**
 * File upload fixtures
 */
export const fileFixtures = {
  textFile: new File(['Hello, World!'], 'hello.txt', { type: 'text/plain' }),
  imageFile: new File([''], 'image.png', { type: 'image/png' }),
  pdfFile: new File([''], 'document.pdf', { type: 'application/pdf' }),
  
  createFile: (name: string, content: string = '', type: string = 'text/plain') => {
    return new File([content], name, { type })
  }
}

/**
 * Form data fixtures
 */
export const formFixtures = {
  contactForm: {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'This is a test message'
  },
  
  settingsForm: {
    name: 'Updated Name',
    email: 'updated@example.com',
    notifications: true,
    theme: 'dark' as const
  },
  
  billingForm: {
    plan: 'pro' as const,
    interval: 'monthly' as const
  }
}

/**
 * API response fixtures
 */
export const apiFixtures = {
  successResponse: {
    success: true,
    data: {},
    message: 'Operation successful'
  },
  
  errorResponse: {
    success: false,
    error: 'Something went wrong',
    code: 'GENERIC_ERROR'
  },
  
  validationErrorResponse: {
    success: false,
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: {
      email: ['Email is required'],
      password: ['Password must be at least 8 characters']
    }
  }
}

/**
 * Date fixtures for consistent testing
 */
export const dateFixtures = {
  past: new Date('2023-01-01'),
  present: new Date('2024-01-01'),
  future: new Date('2025-01-01'),
  
  // Fixed timestamps for deterministic testing
  fixedTimestamp: 1640995200000, // 2022-01-01 00:00:00 UTC
  
  createDate: (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date
  }
}