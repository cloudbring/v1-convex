# Test Coverage Strategy

## Overview

This document outlines the comprehensive strategy to improve code coverage from **29.56%** to **90%+** across the v1-convex monorepo.

## Current Coverage Analysis

### High-Performing Areas ✅
- **Backend Convex Functions**: 95.13% coverage - well-tested with comprehensive unit tests
- **Logger Package**: 100% coverage - fully tested utility functions
- **UI Utilities**: 100% coverage - well-tested helper functions
- **Validators**: 100% coverage - comprehensive validation testing

### Critical Coverage Gaps ❌

| Package/Area | Current Coverage | Files Needing Tests |
|--------------|------------------|---------------------|
| Apps (App/Web) | 0-33% | All Next.js pages, components, middleware |
| Analytics | 57-83% | Client-side tracking, error handling |
| UI Components | 45-85% | Complex components with multiple variants |
| Email Templates | 0% | All React email templates |

## Testing Strategy by Priority

### Priority 1: Critical Functionality (0% Coverage)

**Authentication & Routing**
- `middleware.ts` - Authentication routing logic
- Login/logout flows
- Route protection

**Dashboard Core**
- Main dashboard page
- Navigation component
- Settings management

**Billing & Subscriptions**
- Billing page interactions
- Subscription management
- Payment flows

### Priority 2: Partial Coverage Improvements

**UI Components**
- Dropdown menu component (45% → 90%)
- Complex form components
- Interactive elements

**Analytics**
- Client tracking (57% → 90%)
- Event handling
- Error scenarios

### Priority 3: Marketing & Content

**Web App Components**
- Footer component (500 lines)
- Landing page content
- Marketing forms

## Testing Approach Matrix

| Component Type | Unit Tests | Integration Tests | Component Tests | E2E Tests |
|----------------|------------|-------------------|-----------------|-----------|
| Next.js Pages | ❌ | ✅ | ✅ | ✅ |
| React Components | ✅ | ❌ | ✅ | ❌ |
| Middleware | ✅ | ✅ | ❌ | ✅ |
| API Routes | ✅ | ✅ | ❌ | ✅ |
| Utilities | ✅ | ❌ | ❌ | ❌ |

## Required Testing Infrastructure

### New Dependencies
```json
{
  "devDependencies": {
    "next-router-mock": "^0.9.10",
    "msw": "^2.0.0", 
    "jest-axe": "^8.0.0",
    "@testing-library/react-hooks": "^8.0.1",
    "react-intersection-observer": "^9.5.0"
  }
}
```

### Mock Strategies

**Authentication Mocking**
- Mock Convex auth hooks
- Mock Next.js middleware
- Test authenticated/unauthenticated states

**API Mocking** 
- MSW for external API calls
- Mock Convex queries/mutations
- Mock payment provider APIs

**Component Mocking**
- Mock complex external components
- Mock dynamic imports
- Mock browser APIs (IntersectionObserver, etc.)

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. Set up testing infrastructure
2. Create mock utilities
3. Test critical authentication flows

### Phase 2: Core Features (Week 2)  
1. Test dashboard components
2. Test settings/billing flows
3. Test navigation and routing

### Phase 3: UI Components (Week 3)
1. Improve UI component coverage
2. Test complex interactions
3. Add accessibility tests

### Phase 4: Optimization (Week 4)
1. Test marketing components
2. Test email templates  
3. Optimize test performance

## Coverage Targets

| Area | Current | Target | Strategy |
|------|---------|--------|----------|
| Authentication | 0% | 95% | Unit + Integration + E2E |
| Dashboard | 0% | 90% | Component + Integration |
| Settings/Billing | 0% | 90% | Component + Integration + E2E |
| UI Components | 45-85% | 90% | Unit + Component |
| Analytics | 57% | 90% | Unit + Integration |
| Email Templates | 0% | 80% | Unit + Component |

## Success Metrics

- **Primary**: Overall coverage > 90%
- **Secondary**: All critical paths covered
- **Tertiary**: No regressions in existing tests
- **Quality**: All new tests follow established patterns

## Risk Mitigation

**Test Performance**
- Use shallow rendering where possible
- Mock heavy external dependencies
- Parallel test execution

**Test Maintenance**
- Use Page Object pattern for E2E tests
- Shared test utilities
- Clear test documentation

**CI/CD Integration**
- Enforce coverage thresholds
- Fast feedback on PRs
- Coverage reporting

## Execution Strategy & Dependency Graph

### Phase 1: Infrastructure Setup (Required First) 🏗️
**Single Agent Required**
- Install all shared dependencies
- Set up common test utilities
- Verify testing infrastructure

```bash
# Run this first before any test implementation
cd /Users/e/dev/github.com/cloudbring/v1-convex

# Install shared test dependencies
bun add -D @testing-library/react@^13.4.0 \
           @testing-library/jest-dom@^5.16.5 \
           @testing-library/user-event@^14.4.3 \
           jest-axe@^8.0.0 \
           next-router-mock@^0.9.10

# Verify setup
bunx vitest --version
```

### Phase 2: Independent Components (Parallel - 4 Agents) 🚀
**No Dependencies Between These**

#### Agent A: UI Components 
- **Test Plan**: [`packages/ui/dropdown-menu.test-plan.md`](packages/ui/dropdown-menu.test-plan.md)
- **Priority**: High (45% → 95% coverage improvement)
- **Estimated Time**: 2-3 hours

#### Agent B: Marketing Components
- **Test Plan**: [`apps/web/marketing/footer.test-plan.md`](apps/web/marketing/footer.test-plan.md) 
- **Priority**: Medium (0% → 90% coverage)
- **Estimated Time**: 2 hours

#### Agent C: Analytics Tracking
- **Test Plan**: [`packages/analytics/analytics-client.test-plan.md`](packages/analytics/analytics-client.test-plan.md)
- **Priority**: High (57% → 95% coverage improvement) 
- **Estimated Time**: 3 hours

#### Agent D: Localization System
- **Test Plan**: [`apps/app/localization/i18n.test-plan.md`](apps/app/localization/i18n.test-plan.md)
- **Priority**: High (0% → 95% coverage)
- **Estimated Time**: 3-4 hours

### Phase 3: Authentication Layer (Parallel - 2 Agents) 🔐
**Dependencies**: Phase 2 completion recommended

#### Agent E: Core Middleware
- **Test Plan**: [`apps/app/authentication/middleware.test-plan.md`](apps/app/authentication/middleware.test-plan.md)
- **Priority**: Critical (0% → 95% coverage)
- **Estimated Time**: 2-3 hours

#### Agent F: Login Interface
- **Test Plan**: [`apps/app/authentication/login-page.test-plan.md`](apps/app/authentication/login-page.test-plan.md)
- **Priority**: Critical (0% → 95% coverage) 
- **Estimated Time**: 2 hours

### Phase 4: Dashboard Components (Parallel - 3 Agents) 📊
**Dependencies**: Phase 3 completion (authentication must work first)

#### Agent G: Dashboard Page
- **Test Plan**: [`apps/app/dashboard/dashboard-page.test-plan.md`](apps/app/dashboard/dashboard-page.test-plan.md)
- **Priority**: Critical (0% → 90% coverage)
- **Estimated Time**: 3 hours

#### Agent H: Navigation System
- **Test Plan**: [`apps/app/dashboard/navigation.test-plan.md`](apps/app/dashboard/navigation.test-plan.md)
- **Priority**: Critical (0% → 95% coverage)
- **Estimated Time**: 4 hours (complex component)

#### Agent I: Billing Integration  
- **Test Plan**: [`apps/app/settings/billing-page.test-plan.md`](apps/app/settings/billing-page.test-plan.md)
- **Priority**: Critical (0% → 95% coverage)
- **Estimated Time**: 4 hours (payment integration complexity)

## Execution Checklist ✅

### Pre-Flight (Required)
- [ ] **Infrastructure Setup Complete** (Phase 1)
  - [ ] All shared dependencies installed
  - [ ] Vitest configuration verified
  - [ ] Test utilities available

### Independent Work (Parallel Execution)
- [ ] **UI Components** (Agent A)
  - [ ] Dropdown menu enhanced tests implemented
  - [ ] Coverage target 95% achieved
  
- [ ] **Marketing** (Agent B)  
  - [ ] Footer component tests created
  - [ ] Coverage target 90% achieved

- [ ] **Analytics** (Agent C)
  - [ ] Client & server test enhancements
  - [ ] Coverage target 95% achieved

- [ ] **Localization** (Agent D)
  - [ ] i18n system tests implemented  
  - [ ] Coverage target 95% achieved

### Authentication Layer (Sequential after Phase 2)
- [ ] **Middleware** (Agent E)
  - [ ] Authentication routing tests
  - [ ] Coverage target 95% achieved

- [ ] **Login Page** (Agent F) 
  - [ ] Login component tests created
  - [ ] Coverage target 95% achieved

### Dashboard Layer (Sequential after Phase 3)
- [ ] **Dashboard Page** (Agent G)
  - [ ] Main dashboard tests implemented
  - [ ] Coverage target 90% achieved

- [ ] **Navigation** (Agent H)
  - [ ] Complex navigation tests created  
  - [ ] Coverage target 95% achieved

- [ ] **Billing** (Agent I)
  - [ ] Payment integration tests implemented
  - [ ] Coverage target 95% achieved

## Progress Tracking Matrix

| Phase | Component | Agent | Status | Coverage | Est. Time |
|-------|-----------|-------|--------|----------|-----------|
| 1 | Infrastructure | Setup | ⏳ | N/A | 30min |
| 2A | UI Components | A | ⏳ | 45%→95% | 2-3h |
| 2B | Marketing | B | ⏳ | 0%→90% | 2h |
| 2C | Analytics | C | ⏳ | 57%→95% | 3h |
| 2D | Localization | D | ⏳ | 0%→95% | 3-4h |
| 3A | Middleware | E | ⏳ | 0%→95% | 2-3h |
| 3B | Login Page | F | ⏳ | 0%→95% | 2h |
| 4A | Dashboard | G | ⏳ | 0%→90% | 3h |
| 4B | Navigation | H | ⏳ | 0%→95% | 4h |
| 4C | Billing | I | ⏳ | 0%→95% | 4h |

**Legend**: ⏳ Pending | 🚧 In Progress | ✅ Complete | ❌ Blocked

## Expected Coverage Impact 📈

### Current State: 29.56% Overall Coverage
### Target State: 90%+ Overall Coverage

#### Coverage Improvements by Phase:

**Phase 2 (Independent Components)**
- Dropdown Menu: 45% → 95% (+50% impact on UI package)
- Footer: 0% → 90% (+90% impact on web marketing)  
- Analytics: 57% → 95% (+38% impact on analytics package)
- i18n: 0% → 95% (+95% impact on localization)

**Phase 3 (Authentication)**
- Middleware: 0% → 95% (+95% on critical auth routing)
- Login Page: 0% → 95% (+95% on auth entry point)

**Phase 4 (Dashboard)**  
- Dashboard Page: 0% → 90% (+90% on main user interface)
- Navigation: 0% → 95% (+95% on complex component)
- Billing: 0% → 95% (+95% on payment integration)

### Projected Final Coverage: **91.2%** 🎯

**Critical Path to Success:**
1. **Phase 1**: Infrastructure (30min) → Testing ready
2. **Phase 2**: Independent work (4 agents, 2-4h each) → ~60% overall coverage  
3. **Phase 3**: Auth layer (2 agents, 2-3h each) → ~75% overall coverage
4. **Phase 4**: Dashboard (3 agents, 3-4h each) → **90%+ overall coverage**

**Total Estimated Time**: 16-24 agent-hours (can be parallelized to 6-8 wall-clock hours)

## File Organization

Each test plan is organized in `docs/tests/` with complete execution context:
- **Execution Context**: Commands to run, file paths, coverage measurement
- **Implementation Commands**: Ready-to-execute code blocks
- **Technical Analysis**: 3 testing approaches with selected approach
- **Complete Test Code**: Copy-paste ready implementations
- **Dependencies & Requirements**: All packages and setup needed