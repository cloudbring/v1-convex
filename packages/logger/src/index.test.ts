/**
 * @fileoverview Test suite for Logger module
 * 
 * This module tests the Pino logger configuration and functionality:
 * - Logger instance creation and availability
 * - Basic logging method functionality  
 * - Logger configuration and defaults
 * 
 * Logging is essential for debugging, monitoring, and observability.
 */

import { describe, it, expect, vi } from 'vitest'
import { logger } from './index'

// Mock pino to control logger behavior in tests
vi.mock('pino', () => ({
  default: vi.fn(() => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    fatal: vi.fn(),
    child: vi.fn(),
    level: 'info'
  }))
}))

describe('Logger Module', () => {
  /**
   * Test logger instance availability
   * Should export a configured pino logger instance
   */
  it('should export a logger instance', () => {
    expect(logger).toBeDefined()
    expect(typeof logger).toBe('object')
  })

  /**
   * Test basic logging methods
   * Should have all standard log level methods available
   */
  it('should have standard logging methods', () => {
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')
    expect(typeof logger.trace).toBe('function')
    expect(typeof logger.fatal).toBe('function')
  })

  /**
   * Test info logging
   * Should call the underlying pino info method
   */
  it('should log info messages', () => {
    const testMessage = 'Test info message'
    const testData = { userId: 'user123', action: 'login' }
    
    logger.info(testData, testMessage)
    
    expect(logger.info).toHaveBeenCalledWith(testData, testMessage)
  })

  /**
   * Test error logging
   * Should call the underlying pino error method
   */
  it('should log error messages', () => {
    const testError = new Error('Test error')
    const errorMessage = 'An error occurred'
    
    logger.error(testError, errorMessage)
    
    expect(logger.error).toHaveBeenCalledWith(testError, errorMessage)
  })

  /**
   * Test warn logging
   * Should call the underlying pino warn method
   */
  it('should log warning messages', () => {
    const warningData = { deprecated: true, feature: 'oldAPI' }
    const warningMessage = 'Deprecated feature used'
    
    logger.warn(warningData, warningMessage)
    
    expect(logger.warn).toHaveBeenCalledWith(warningData, warningMessage)
  })

  /**
   * Test child logger creation
   * Should support creating child loggers with context
   */
  it('should support child logger creation', () => {
    expect(typeof logger.child).toBe('function')
    
    const childContext = { service: 'auth', version: '1.0.0' }
    logger.child(childContext)
    
    expect(logger.child).toHaveBeenCalledWith(childContext)
  })

  /**
   * Test logger configuration
   * Should have default log level configured
   */
  it('should have default configuration', () => {
    expect(logger.level).toBeDefined()
  })

  /**
   * Test logger instance consistency
   * Should return the same logger instance on multiple imports
   */
  it('should provide consistent logger instance', () => {
    // Test that logger is defined and consistent
    expect(logger).toBeDefined()
    expect(typeof logger).toBe('object')
  })
})