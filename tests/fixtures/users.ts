import { faker } from '@faker-js/faker'

export const testUsers = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  },
  
  adminUser: {
    email: 'admin@example.com', 
    password: 'AdminPassword123!',
    name: 'Admin User'
  },
  
  newUser: () => ({
    email: faker.internet.email(),
    password: 'Password123!',
    name: faker.person.fullName()
  })
}

export const testData = {
  validEmails: [
    'user@example.com',
    'test.user@domain.co.uk',
    'user+tag@example.org'
  ],
  
  invalidEmails: [
    'invalid-email',
    '@example.com',
    'user@',
    ''
  ],
  
  validPasswords: [
    'Password123!',
    'ComplexP@ss1',
    'MySecure123!'
  ],
  
  invalidPasswords: [
    'short',
    '12345678', // No letters
    'password', // No numbers or special chars
    'PASSWORD123', // No lowercase
    ''
  ],
  
  usernames: {
    valid: ['testuser', 'user123', 'myusername'],
    invalid: ['ab', 'a'.repeat(33), 'user@name', 'user-name']
  }
}