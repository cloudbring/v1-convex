import { vi } from 'vitest'

// Mock external APIs for testing
vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: 'Mock AI response'
            }
          }]
        })
      }
    }
  }))
}))

// Mock Polar SDK
vi.mock('@polar-sh/sdk', () => ({
  PolarApi: vi.fn().mockImplementation(() => ({
    subscriptions: {
      list: vi.fn().mockResolvedValue({ result: [] }),
      create: vi.fn().mockResolvedValue({ result: { id: 'mock-subscription' } }),
      cancel: vi.fn().mockResolvedValue({ result: true })
    }
  }))
}))

// Mock email services
vi.mock('@/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true })
}))

// Setup fake timers for testing scheduled functions
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})