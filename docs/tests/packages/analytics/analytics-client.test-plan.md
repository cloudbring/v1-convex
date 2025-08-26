# Analytics Client Test Plan

**Files**: `packages/analytics/src/client.tsx` & `packages/analytics/src/server.ts`  
**Current Coverage**: ~57% (from existing test files)  
**Target Coverage**: 95%  
**Priority**: 🟠 High

## Execution Context

### Prerequisites
- Ensure common test dependencies are installed (see coverage-strategy.md)
- Working directory: `/Users/e/dev/github.com/cloudbring/v1-convex`

### Test File Enhancement
```bash
# Enhance existing test files
# Files exist at: packages/analytics/src/client.test.tsx and packages/analytics/src/server.test.ts
```

### Run This Test Only
```bash
# Run only analytics tests
bunx vitest run packages/analytics/src/

# Run with coverage for analytics package
bunx vitest run --coverage packages/analytics/src/

# Watch mode for development
bunx vitest watch packages/analytics/src/
```

### Coverage Measurement
```bash
# Check coverage for analytics package
bunx vitest run --coverage --reporter=json | jq '.coverageMap | to_entries[] | select(.key | contains("analytics"))'
```

### Enhancement Commands
```bash
cd packages/analytics

# Add error handling tests to client
cat >> src/client.test.tsx << 'EOF'

describe('Analytics Error Handling', () => {
  it('should handle useOpenPanel hook failures', () => {
    const mockUseOpenPanel = vi.mocked(useOpenPanel)
    mockUseOpenPanel.mockImplementation(() => {
      throw new Error('Hook context error')
    })
    
    expect(() => track({ event: 'test_event' })).not.toThrow()
  })
})
EOF

# Add comprehensive server error handling
cat >> src/server.test.ts << 'EOF'

describe('Server Error Handling', () => {
  it('should handle OpenPanel client creation failure', async () => {
    const { OpenPanel } = await import('@openpanel/nextjs')
    vi.mocked(OpenPanel).mockImplementation(() => {
      throw new Error('Invalid credentials')
    })
    
    await expect(setupAnalytics()).resolves.toHaveProperty('track')
  })

  it('should handle track function failures gracefully', async () => {
    mockTrack.mockRejectedValue(new Error('Network error'))
    const { track } = await setupAnalytics()
    
    expect(() => track({ event: 'test_event' })).not.toThrow()
  })
})
EOF
```

## File Overview

The Analytics package provides OpenPanel integration for both client-side and server-side tracking:

**Client (`client.tsx`)**:
- React component Provider for OpenPanel initialization
- Track function using useOpenPanel hook for client-side events
- Environment-based tracking (dev vs production mode)

**Server (`server.ts`)**:
- Server-side analytics setup with OpenPanel client
- User identification with profile data (firstName, lastName)  
- Event tracking with Vercel waitUntil for async operations
- Environment-based logging vs actual tracking

### Dependencies
- `@openpanel/nextjs` - OpenPanel analytics SDK
- `@v1/logger` - Internal logging utility
- `@vercel/functions` - Vercel waitUntil for async operations

### Complexity Analysis
- **Medium**: Combined 77 lines across two files
- **Integration Heavy**: External SDK dependency (OpenPanel)
- **Environment Sensitive**: Different behavior in dev vs production
- **Privacy Critical**: Handles user identification and tracking data

## Coverage Analysis

### Current State
- **~57% coverage** - Basic structural and configuration tests exist
- **Missing Edge Cases** - Error handling, environment variations, integration failures
- **Missing Hook Context Testing** - Client track function not fully tested
- **Missing Error States** - Network failures, invalid configurations

### Critical Paths to Test
1. **Client Provider Component**:
   - Correct OpenPanel component rendering and configuration
   - Environment-based feature toggling
   - Props passing and validation

2. **Client Track Function**:
   - Development mode logging behavior
   - Production mode tracking integration  
   - Hook context requirements and usage

3. **Server Analytics Setup**:
   - User identification with name parsing
   - Client initialization with credentials
   - Environment variable validation

4. **Server Track Function**:
   - Event tracking with waitUntil integration
   - Development vs production behavior
   - Property separation and formatting

## Testing Approaches

### Approach 1: Deep Integration Testing with Real OpenPanel SDK
**Strategy**: Test with real OpenPanel SDK to validate actual integration behavior

**Pros**:
- Tests real SDK integration and behavior
- Catches breaking changes in OpenPanel SDK
- Validates actual network requests and responses
- Tests real authentication and configuration

**Cons**:
- Requires OpenPanel test account and credentials
- Slow test execution due to network calls
- May hit API rate limits during testing
- Difficult to test error scenarios consistently
- Test results dependent on external service

**Test Structure**:
```typescript
describe('Analytics Integration Tests', () => {
  it('should track events with real OpenPanel SDK', async () => {
    // Requires real credentials and network calls
    const analytics = await setupAnalytics({
      userId: 'test-user',
      fullName: 'Test User'
    })
    
    await analytics.track({
      event: 'test_event',
      testProperty: 'value'
    })
    
    // Would need to verify via OpenPanel API or test webhook
  })
})
```

### Approach 2: Comprehensive Mocking with Behavior Testing
**Strategy**: Mock OpenPanel SDK and focus on testing integration logic and behavior patterns

**Pros**:
- Fast test execution with predictable results
- Easy to test error scenarios and edge cases
- Complete control over SDK responses
- Can test all code paths without external dependencies
- Isolated testing of analytics logic

**Cons**:
- Doesn't test actual SDK integration
- Mock maintenance when SDK updates
- May miss SDK-specific behavior changes
- Need to ensure mocks match real SDK behavior

**Test Structure**:
```typescript
// Comprehensive mocks with behavior simulation
vi.mock('@openpanel/nextjs', () => ({
  OpenPanelComponent: vi.fn(),
  useOpenPanel: vi.fn(),
  OpenPanel: vi.fn()
}))

describe('Analytics Behavior', () => {
  it('should handle track failures gracefully', async () => {
    mockOpenPanel.track.mockRejectedValue(new Error('Network error'))
    
    const { track } = await setupAnalytics()
    
    expect(() => track({ event: 'test' })).not.toThrow()
    // Test error handling behavior
  })
})
```

### Approach 3: Layered Testing (Unit + Integration + E2E)
**Strategy**: Multi-layered approach with different test types for different aspects

**Pros**:
- Comprehensive coverage at appropriate levels
- Unit tests for logic, integration tests for SDK interaction
- E2E tests for actual tracking validation in test environment
- Balanced approach between speed and confidence

**Cons**:
- Most complex test setup and maintenance
- Requires test environment with OpenPanel integration
- Potential for test duplication across layers
- Higher maintenance overhead

**Test Structure**:
```typescript
// Unit tests for analytics logic
describe('Analytics Logic', () => {
  it('should parse user names correctly', () => {
    // Test name parsing logic in isolation
  })
})

// Integration tests with mocked SDK
describe('Analytics Integration', () => {
  it('should configure OpenPanel correctly', () => {
    // Test SDK integration with mocks
  })
})

// E2E tests in test environment
describe('Analytics E2E', () => {
  it('should track events end-to-end', () => {
    // Real tracking in controlled test environment
  })
})
```

## Selected Approach: Approach 2 - Comprehensive Mocking with Behavior Testing

### Justification

**Primary Reasoning**:
Comprehensive mocking is optimal for this analytics package because:

1. **External Dependency Control**: Can test all scenarios without relying on OpenPanel service availability
2. **Error Scenario Testing**: Easy to simulate network failures, authentication errors, and edge cases
3. **Speed and Reliability**: Fast, consistent test execution without external dependencies
4. **Complete Coverage**: Can test all code paths including error handling and edge cases
5. **Cost Effective**: No need for OpenPanel test accounts or API quota concerns

**Supporting Factors**:
- E2E tests can handle actual tracking validation in staging/production
- Analytics logic is more important to test than SDK integration
- OpenPanel SDK is well-tested by the vendor

## Implementation Details

### Test Types
- **Client Tests**: 45% coverage - Provider component and track function behavior
- **Server Tests**: 45% coverage - Setup function and server-side tracking
- **Integration Tests**: 10% coverage - Cross-component behavior and error handling

### Test Scenarios

#### Client Provider Component Tests
1. **Component rendering and configuration**
   - Should render OpenPanelComponent with environment variables
   - Should apply correct tracking flags based on environment
   - Should handle missing environment variables gracefully

2. **Environment-based behavior**
   - Should enable tracking features in production
   - Should disable tracking features in development
   - Should handle unknown NODE_ENV values

#### Client Track Function Tests
3. **Hook context and usage**
   - Should use useOpenPanel hook correctly
   - Should handle hook context errors gracefully
   - Should work within Provider component context

4. **Development vs production tracking**
   - Should log events with logger in development
   - Should call OpenPanel track in production
   - Should handle event property separation correctly

5. **Error handling**
   - Should handle OpenPanel hook failures
   - Should handle malformed event data
   - Should not crash on undefined properties

#### Server Analytics Setup Tests
6. **Client initialization**
   - Should create OpenPanel client with correct credentials
   - Should handle missing environment variables
   - Should validate client configuration

7. **User identification**
   - Should identify users with complete profile data
   - Should parse names correctly (first/last name separation)
   - Should handle edge cases (single names, empty names)
   - Should skip identification with incomplete data

8. **Error handling**
   - Should handle OpenPanel client creation failures
   - Should handle identification API failures
   - Should continue setup even if identification fails

#### Server Track Function Tests
9. **Event tracking behavior**
   - Should track events with OpenPanel in production
   - Should log events with logger in development
   - Should separate event name from properties correctly

10. **Async operation handling**
    - Should use waitUntil for async tracking operations
    - Should handle waitUntil failures gracefully
    - Should not block on tracking operations

11. **Property handling**
    - Should handle complex event properties
    - Should serialize properties correctly
    - Should handle undefined/null properties

#### Integration and Edge Case Tests
12. **Environment variable validation**
    - Should handle missing NEXT_PUBLIC_OPENPANEL_CLIENT_ID
    - Should handle missing OPENPANEL_SECRET_KEY
    - Should provide meaningful error messages

13. **Cross-component behavior**
    - Should maintain consistent behavior between client and server
    - Should handle environment switching correctly
    - Should preserve event property format across contexts

### Technical Requirements

#### Required Packages (Already Present)
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "vitest": "^1.0.0"
  }
}
```

#### Enhanced Mock Setup
```typescript
// Enhanced OpenPanel mocks with error simulation
const mockTrack = vi.fn()
const mockIdentify = vi.fn()
const mockOpenPanelHook = vi.fn()

vi.mock('@openpanel/nextjs', () => ({
  OpenPanelComponent: vi.fn(({ clientId, trackAttributes, trackScreenViews, trackOutgoingLinks }) => (
    <div data-testid="openpanel-component">
      <span data-testid="client-id">{clientId}</span>
      <span data-testid="track-attributes">{String(trackAttributes)}</span>
      <span data-testid="track-screen-views">{String(trackScreenViews)}</span>
      <span data-testid="track-outgoing-links">{String(trackOutgoingLinks)}</span>
    </div>
  )),
  useOpenPanel: mockOpenPanelHook,
  OpenPanel: vi.fn().mockImplementation(() => ({
    track: mockTrack,
    identify: mockIdentify,
  })),
}))

// Enhanced logger mock with call verification
const mockLogger = vi.fn()
vi.mock('@v1/logger', () => ({
  logger: {
    info: mockLogger,
    error: vi.fn(),
    warn: vi.fn()
  }
}))

// Enhanced Vercel functions mock
const mockWaitUntil = vi.fn()
vi.mock('@vercel/functions', () => ({
  waitUntil: mockWaitUntil,
}))
```

#### Test Data & Fixtures
```typescript
// Environment configurations
const environments = {
  development: { NODE_ENV: 'development' },
  production: { NODE_ENV: 'production' },
  test: { NODE_ENV: 'test' }
}

// User identification fixtures
const userFixtures = {
  complete: { userId: 'user-123', fullName: 'John Doe Smith' },
  singleName: { userId: 'user-456', fullName: 'Madonna' },
  emptyName: { userId: 'user-789', fullName: '' },
  missingUserId: { fullName: 'Jane Doe' },
  missingName: { userId: 'user-999' }
}

// Event fixtures
const eventFixtures = {
  simple: { event: 'page_view' },
  withProperties: { event: 'user_signup', email: 'test@example.com', plan: 'pro' },
  complex: { 
    event: 'purchase_complete',
    amount: 99.99,
    currency: 'USD',
    items: [{ id: 'item1', quantity: 2 }]
  },
  malformed: { event: '', invalidProp: undefined }
}
```

### Test Structure
```
packages/analytics/src/
├── client.test.tsx (Enhanced)
│   ├── Provider Component Tests
│   │   ├── Environment-based configuration
│   │   ├── Props validation and passing
│   │   └── Error handling for missing env vars
│   ├── Track Function Tests
│   │   ├── Hook context requirements
│   │   ├── Development vs production behavior
│   │   ├── Event property handling
│   │   └── Error scenarios
│   └── Integration Tests
│       ├── Provider + Track integration
│       └── Environment switching
└── server.test.ts (Enhanced)
    ├── Analytics Setup Tests
    │   ├── Client initialization
    │   ├── User identification scenarios
    │   ├── Environment variable validation
    │   └── Error handling
    ├── Track Function Tests
    │   ├── Production tracking behavior
    │   ├── Development logging behavior
    │   ├── Async operation handling
    │   └── Property serialization
    └── Edge Case Tests
        ├── Network failures
        ├── Invalid configurations
        └── Malformed data handling
```

## Side Effects & Considerations

### Impact on Other Tests
- **Positive**: Analytics mocking patterns can be reused across application tests
- **Dependencies**: Tests validate integration with logger and Vercel functions
- **Performance**: Fast mocked tests won't impact test suite performance

### Execution Approach
1. **Phase 1**: Enhance existing tests with comprehensive error handling and edge cases
2. **Phase 2**: Add missing client track function context testing
3. **Phase 3**: Add server-side async operation and error handling tests
4. **Phase 4**: Add integration tests for cross-component behavior

### Mock Strategies
- **SDK Mocking**: Comprehensive OpenPanel SDK mocks with configurable behavior
- **Environment Mocking**: Dynamic environment variable switching for different test scenarios
- **Logger Integration**: Verify logging calls with expected parameters
- **Async Mocking**: Mock waitUntil and track async behavior properly

### Test Data Approach
- **Environment Fixtures**: Different NODE_ENV scenarios for complete coverage
- **User Data Fixtures**: Various user identification scenarios and edge cases
- **Event Fixtures**: Range of event types from simple to complex properties
- **Error Fixtures**: Malformed data and failure scenarios

### Performance Considerations
- **Test Speed**: Target <50ms per test with comprehensive mocking
- **Memory Management**: Clean up mocks and spies between tests
- **Parallel Safety**: Ensure all tests are isolated and can run concurrently

### CI/CD Integration
- **Coverage Requirements**: Enforce 95% coverage for privacy-critical component
- **Environment Testing**: Test behavior in different NODE_ENV settings
- **Security Validation**: Ensure no sensitive data is logged in development mode

### Error Handling Testing Strategy
```typescript
describe('Error Handling', () => {
  it('should handle OpenPanel client creation failure', async () => {
    const { OpenPanel } = await import('@openpanel/nextjs')
    OpenPanel.mockImplementation(() => {
      throw new Error('Invalid credentials')
    })
    
    await expect(setupAnalytics()).resolves.toHaveProperty('track')
    // Should not throw, should return fallback analytics object
  })

  it('should handle track function failures gracefully', async () => {
    mockTrack.mockRejectedValue(new Error('Network error'))
    const { track } = await setupAnalytics()
    
    expect(() => track({ event: 'test_event' })).not.toThrow()
    expect(mockWaitUntil).toHaveBeenCalled()
  })

  it('should handle useOpenPanel hook failures', () => {
    mockOpenPanelHook.mockImplementation(() => {
      throw new Error('Hook context error')
    })
    
    expect(() => track({ event: 'test_event' })).not.toThrow()
    // Should log error or fall back gracefully
  })
})
```

### Privacy and Security Testing
```typescript
describe('Privacy and Security', () => {
  it('should not log sensitive data in production', async () => {
    process.env.NODE_ENV = 'production'
    const { track } = await setupAnalytics()
    
    track({ 
      event: 'user_action', 
      email: 'sensitive@example.com',
      creditCard: '1234-5678-9012-3456'
    })
    
    expect(mockLogger.info).not.toHaveBeenCalled()
    expect(mockTrack).toHaveBeenCalledWith('user_action', {
      email: 'sensitive@example.com',
      creditCard: '1234-5678-9012-3456'
    })
  })

  it('should sanitize logged data in development', async () => {
    process.env.NODE_ENV = 'development'
    const { track } = await setupAnalytics()
    
    track({ event: 'test_event', data: 'sensitive' })
    
    expect(mockLogger.info).toHaveBeenCalledWith('Track', {
      event: 'test_event',
      data: 'sensitive'
    })
    // Note: In real implementation, might want to sanitize sensitive data
  })
})
```

### Environment Variable Testing
```typescript
describe('Environment Variables', () => {
  it('should handle missing client ID gracefully', async () => {
    delete process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID
    
    expect(() => setupAnalytics()).not.toThrow()
    // Should handle missing env var gracefully
  })

  it('should handle missing secret key gracefully', async () => {
    delete process.env.OPENPANEL_SECRET_KEY
    
    const analytics = await setupAnalytics()
    expect(analytics).toHaveProperty('track')
    // Should still provide analytics object with fallback behavior
  })
})
```