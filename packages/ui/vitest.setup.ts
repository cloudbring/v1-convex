import '@testing-library/jest-dom'
import { setupGlobalMocks } from '@v1/test-utils/setup'

// Setup global mocks for UI testing
setupGlobalMocks()

// Ensure proper React 18 configuration
global.IS_REACT_ACT_ENVIRONMENT = true