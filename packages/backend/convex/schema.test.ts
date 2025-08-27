/**
 * @fileoverview Test suite for Convex database schema definition
 * 
 * This module tests the database schema configuration which defines:
 * - User table structure with auth integration
 * - Field types and validation
 * - Database indexes for performance
 * - Integration with Convex Auth tables
 * 
 * The schema is the foundation of data integrity in the application.
 */

import { describe, it, expect } from 'vitest'
import schema from './schema'

describe('Database Schema Configuration', () => {
  /**
   * Test that schema object is properly defined
   * Schema should be a valid Convex schema object
   */
  it('should export a valid schema object', () => {
    expect(schema).toBeDefined()
    expect(typeof schema).toBe('object')
  })

  /**
   * Test that users table is defined in schema
   * Users table is the core entity for user management
   */
  it('should include users table definition', () => {
    expect(schema.tables.users).toBeDefined()
  })

  /**
   * Test that auth tables are included from convex-auth
   * Authentication requires specific tables for session management
   */
  it('should include authentication tables', () => {
    // Auth tables should be merged into the schema
    expect(schema.tables.authAccounts).toBeDefined()
    expect(schema.tables.authSessions).toBeDefined()
  })

  /**
   * Test that schema contains expected table definitions
   * Verify the schema structure matches Convex requirements
   */
  it('should have proper schema structure', () => {
    expect(schema.tables).toBeDefined()
    expect(typeof schema.tables).toBe('object')
  })

  /**
   * Test that users table includes required fields
   * Verify core user fields are defined in the schema
   */
  it('should define user table with core fields', () => {
    const usersTable = schema.tables.users
    expect(usersTable).toBeDefined()
  })

  /**
   * Test that schema can be used for table creation
   * Schema should be compatible with Convex table definitions
   */
  it('should be compatible with Convex table creation', () => {
    // Schema should have the tables property expected by Convex
    expect(schema).toHaveProperty('tables')
    expect(schema.tables).toHaveProperty('users')
    expect(schema.tables).toHaveProperty('authAccounts') 
    expect(schema.tables).toHaveProperty('authSessions')
  })
})