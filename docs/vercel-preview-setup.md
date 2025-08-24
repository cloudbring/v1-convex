# Vercel Preview Deployment Testing Setup

This guide helps you set up automated Vercel preview deployment testing for your v1-convex project. This is especially useful for demonstrating your app to stakeholders and ensuring deployments work correctly.

## Overview

The preview testing system automatically:
1. Deploys your PR changes to Vercel preview URLs
2. Runs smoke tests against the live preview
3. Comments on PRs with results and preview URLs
4. Validates critical user flows work in production-like environment

## Setup Steps

### 1. Vercel Project Setup

1. **Create Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Import Project**: Import your GitHub repository to Vercel
3. **Configure Environment Variables** in Vercel dashboard:
   ```
   CONVEX_URL=https://your-convex-deployment.convex.cloud
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   # Add other environment variables as needed
   ```

### 2. GitHub Repository Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# Required Vercel secrets
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here  
VERCEL_PROJECT_ID=your_project_id_here
```

**To get these values:**

1. **VERCEL_TOKEN**: 
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token with appropriate scope
   - Copy the token value

2. **VERCEL_ORG_ID** and **VERCEL_PROJECT_ID**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and link project
   vercel login
   vercel link
   
   # Get the IDs from .vercel/project.json
   cat .vercel/project.json
   ```

### 3. Convex Deployment Setup

For preview testing to work, you need a stable Convex deployment:

1. **Production Convex Deployment**:
   ```bash
   bunx convex deploy --prod
   ```

2. **Get Deployment URL**:
   ```bash
   bunx convex dashboard
   # Copy the deployment URL from dashboard
   ```

3. **Add to Vercel Environment Variables**:
   - `CONVEX_URL`: Your production Convex deployment URL
   - `NEXT_PUBLIC_CONVEX_URL`: Same URL (for client-side access)

### 4. Testing the Setup

Create a test PR and verify:

1. ✅ Vercel preview deployment is created
2. ✅ GitHub Actions workflow runs
3. ✅ Smoke tests pass against preview URL
4. ✅ PR comment appears with results

## Workflow Details

The `.github/workflows/preview-testing.yml` workflow:

```yaml
# Triggers on PR open/update
on:
  pull_request:
    types: [opened, synchronize]

# Steps:
# 1. Deploy to Vercel preview
# 2. Wait for deployment to be ready  
# 3. Run smoke tests against preview URL
# 4. Run critical E2E tests
# 5. Comment on PR with results
```

## Smoke Tests

Located in `tests/smoke/`, these tests verify:

- ✅ **Page Loading**: Home, login, signup pages load
- ✅ **No Critical Errors**: No JavaScript errors or failed requests
- ✅ **Responsive Design**: Works on desktop, tablet, mobile
- ✅ **API Endpoints**: Health checks and critical routes
- ✅ **Authentication Flow**: Auth pages render correctly

## Customization

### Adding More Tests

Add tests to `tests/smoke/` directory:

```typescript
// tests/smoke/custom-feature.spec.ts
import { test, expect } from '@playwright/test'

test('should test my custom feature', async ({ page }) => {
  await page.goto('/my-feature')
  await expect(page.locator('[data-testid="feature"]')).toBeVisible()
})
```

### Environment-Specific Configuration

Create different test suites for different environments:

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'preview',
      testDir: './tests/smoke',
      use: {
        baseURL: process.env.PREVIEW_URL || 'http://localhost:3000'
      }
    }
  ]
})
```

### Custom Vercel Configuration

Add `vercel.json` to customize deployment:

```json
{
  "framework": "nextjs",
  "buildCommand": "bun run build",
  "devCommand": "bun run dev",
  "installCommand": "bun install",
  "env": {
    "CONVEX_URL": "@convex-url",
    "NEXT_PUBLIC_CONVEX_URL": "@convex-url"
  }
}
```

## Troubleshooting

### Common Issues

**1. "Deployment failed"**
- Check Vercel build logs
- Verify environment variables are set
- Ensure all dependencies are in package.json

**2. "Tests timeout"**
- Increase timeout in `playwright.config.ts`
- Check if preview URL is accessible
- Verify Convex deployment is working

**3. "Preview URL not found"**
- Verify GitHub token has correct permissions
- Check Vercel project is linked correctly
- Ensure wait-for-vercel-preview action is working

**4. "Convex connection errors"**
- Verify `CONVEX_URL` is set in Vercel
- Check Convex deployment is accessible
- Ensure auth configuration is correct

### Debug Commands

```bash
# Test locally with preview URL
PREVIEW_URL=https://your-preview.vercel.app bun run test:smoke

# Check Vercel deployment status
vercel ls

# Test Convex connection
curl https://your-deployment.convex.cloud/_system/ping
```

## Best Practices

### 1. **Stable Backend**
Use a dedicated staging/production Convex deployment for previews, not development instances.

### 2. **Minimal Test Suite**  
Keep smoke tests fast and focused on critical paths to avoid long PR feedback cycles.

### 3. **Environment Parity**
Ensure preview environment closely matches production configuration.

### 4. **Test Data Management**
Use predictable test data or mock external services to avoid flaky tests.

### 5. **Resource Cleanup**
Vercel automatically cleans up preview deployments, but monitor usage to avoid quota issues.

## Integration with Template Usage

When users create repositories from this template:

1. **Update README**: Include Vercel setup instructions
2. **Environment Variables**: Document all required variables  
3. **Convex Setup**: Provide clear deployment instructions
4. **Testing Guide**: Explain how to customize smoke tests

This ensures new projects can immediately benefit from preview deployment testing.