# Template Setup Guide

Welcome! You've created a new repository from the v1-convex template. This guide will help you get your new SaaS project up and running quickly.

## Quick Start Checklist

- [ ] **Clone and Install**
- [ ] **Set up Convex Backend**  
- [ ] **Configure Environment Variables**
- [ ] **Set up Authentication**
- [ ] **Run Tests**
- [ ] **Set up Preview Deployments**
- [ ] **Deploy to Production**

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Clone your new repository
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME

# Install dependencies
bun install

# Verify installation
bun run typecheck
```

### 2. Set up Convex Backend

```bash
# Navigate to backend package
cd packages/backend

# Set up new Convex project
bun run setup

# This will:
# - Create a new Convex project
# - Generate deployment URL
# - Create .env file with your credentials
```

### 3. Configure Authentication

```bash
# Set up authentication providers
bunx @convex-dev/auth

# Follow the prompts to configure:
# - Google OAuth (recommended)
# - Email/password auth
# - Other providers as needed
```

### 4. Environment Variables Setup

The template requires several environment variables. Here's the priority order:

#### Required (Core Functionality)
```bash
# packages/backend/.env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOY_KEY=your_deploy_key

# Authentication (choose one or more)
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret
```

#### Recommended (Production Ready)
```bash
# Email delivery
RESEND_API_KEY=your_resend_key
RESEND_SENDER_EMAIL_AUTH=noreply@yourdomain.com

# Error tracking
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your_sentry_token
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
```

#### Optional (Advanced Features)
```bash
# Billing (when ready)
POLAR_ORGANIZATION_TOKEN=your_polar_token
POLAR_WEBHOOK_SECRET=your_webhook_secret

# Analytics
OPENPANEL_SECRET_KEY=your_openpanel_key
NEXT_PUBLIC_OPENPANEL_CLIENT_ID=your_client_id

# Marketing
LOOPS_FORM_ID=your_loops_form_id
NEXT_PUBLIC_CAL_LINK=https://cal.com/yourusername
```

### 5. Initialize Database and Test Data

```bash
# From packages/backend directory
bunx convex run init

# This sets up:
# - Database schema
# - Test products (if using Polar)
# - Sample data for development
```

### 6. Start Development

```bash
# From project root
bun dev

# This starts:
# - Next.js app (http://localhost:3000)
# - Marketing site (http://localhost:3001) 
# - Convex backend
# - Email preview server
```

## Testing Your Setup

The template includes a comprehensive testing suite:

### Run All Tests

```bash
# Unit and integration tests
bun run test:coverage

# End-to-end tests  
bun run test:e2e

# Component testing with Storybook
bun run storybook
bun run test:storybook

# All tests
bun run test:all
```

### Test Structure

```
tests/
├── e2e/              # Playwright E2E tests
├── smoke/            # Smoke tests for deployments
└── fixtures/         # Test data and utilities

packages/*/src/
├── **/*.test.ts      # Unit tests (alongside source)
└── **/*.stories.tsx  # Storybook component tests
```

## Setting Up Preview Deployments

Enable automatic preview testing on every PR:

### 1. Set up Vercel

1. **Import your repository** to Vercel
2. **Configure environment variables** in Vercel dashboard
3. **Get Vercel credentials**:
   ```bash
   # Install Vercel CLI
   bun add -g vercel
   
   # Login and link project
   vercel login
   vercel link
   
   # Get project details
   cat .vercel/project.json
   ```

### 2. Add GitHub Secrets

In your repository Settings → Secrets and variables → Actions:

```bash
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id  
VERCEL_PROJECT_ID=your_project_id
```

### 3. Test Preview Workflow

1. Create a test PR
2. Verify the GitHub Action runs
3. Check that preview URL is commented on PR
4. Confirm smoke tests pass

See [Vercel Preview Setup Guide](./vercel-preview-setup.md) for detailed instructions.

## Customizing Your Project

### 1. Update Branding

```bash
# Update package.json names
# Replace "v1" with your project name in:
package.json
apps/app/package.json
apps/web/package.json
packages/*/package.json

# Update README.md with your project details
# Update image.png with your hero image
```

### 2. Configure Your Domain

```bash
# apps/app/.env
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# apps/web/.env  
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

### 3. Customize Authentication

Edit `packages/backend/convex/auth.config.ts`:

```typescript
export default {
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    }),
    // Add more providers as needed
  ],
}
```

### 4. Update Database Schema

Edit `packages/backend/convex/schema.ts`:

```typescript
export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    // Add your custom fields
    plan: v.optional(v.string()),
    createdAt: v.number(),
  }),
  // Add your custom tables
  projects: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
    // Your project fields
  }),
})
```

## Production Deployment

### 1. Deploy Convex Backend

```bash
# From packages/backend
bunx convex deploy --prod

# Note the production URL for next step
```

### 2. Deploy to Vercel

1. **Production deployment** will use your main branch
2. **Add production environment variables** to Vercel
3. **Update Convex URLs** to production deployment
4. **Test the production deployment**

### 3. Set up Monitoring

- **Sentry**: Error tracking and performance monitoring
- **OpenPanel**: User analytics and behavior tracking  
- **Uptime monitoring**: Use services like Pingdom or UptimeRobot

## Common Issues and Solutions

### Authentication Not Working
- Verify Google OAuth redirect URIs include your Convex domain
- Check that environment variables are set in Vercel
- Ensure Convex deployment has auth configuration

### Database Connection Issues  
- Confirm `CONVEX_URL` matches your deployment
- Check that schema is deployed: `bunx convex run init`
- Verify network access to convex.cloud

### Build Failures
- Run `bun run typecheck` locally first
- Check that all environment variables are set
- Verify dependencies are in package.json (not just global)

### Test Failures
- Never use `bun test` - always use `bun run test` (uses Vitest)
- Check that test setup files are configured correctly
- Verify mock configurations for external services

## Getting Help

- **Documentation**: Check the `docs/` folder for detailed guides
- **Issues**: Create an issue in your repository for project-specific questions
- **Template Issues**: Report issues with the template at the [original repository](https://github.com/cloudbring/v1-convex/issues)
- **Community**: Join the Convex Discord for backend-specific help

## Next Steps

1. **Customize the UI** - Update components in `packages/ui`
2. **Add your features** - Build your unique functionality
3. **Set up billing** - Configure Polar for subscriptions
4. **Launch** - Deploy to production and start acquiring users!

Welcome to your new SaaS project! 🚀