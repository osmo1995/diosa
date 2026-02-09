# Sentry Error Monitoring Setup Instructions

Sentry is already installed (`@sentry/react` in `package.json`). Follow these steps to activate error tracking:

## 1. Create a Sentry Project (if you don't have one)

1. Go to [Sentry.io](https://sentry.io/) and sign up/log in
2. Click **Create Project**
3. Select platform: **React**
4. Alert frequency: Choose your preference (e.g., "Alert me on every new issue")
5. Project name: `diosa-studio-yorkville`
6. Team: (select or create)
7. Click **Create Project**

## 2. Get your DSN (Data Source Name)

After creating the project:
1. You'll see a setup guide with a **DSN** like:
   ```
   https://abc123def456@o123456.ingest.sentry.io/7890123
   ```
2. Copy this DSN

## 3. Add DSN to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/anas-projects-37a977a8/diosa)
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_SENTRY_DSN`
   - **Value**: `https://abc123...` (paste your actual DSN)
   - **Environments**: Production, Preview, Development

## 4. (Optional) Enable Source Maps Upload

For better stack traces in production:

1. In Sentry, go to **Settings** → **Developer Settings** → **Auth Tokens**
2. Click **Create New Token**
   - Scopes: `project:releases`, `project:write`
   - Name: `vercel-diosa`
3. Copy the token
4. Add to Vercel env vars:
   - **Name**: `SENTRY_AUTH_TOKEN`
   - **Value**: (paste token)
   - **Environments**: Production only

5. Uncomment the Sentry Vite plugin in `vite.config.ts` (see code below)

## 5. Initialize Sentry in Code

I'll add the initialization code to `index.tsx` in the next step.

## 6. Redeploy

After adding env vars, redeploy the site.

## 7. Verify Error Tracking

1. Visit your site
2. Trigger a test error (or wait for real errors)
3. In Sentry dashboard → **Issues**, you should see errors appear

## Optional: Configure Alerts

In Sentry project settings:
- **Alerts** → Create rules (e.g., email on new issue, Slack notifications)
- **Integrations** → Connect Slack, Discord, Jira, etc.

---

**Done!** Sentry will now capture and report JavaScript errors, network issues, and crashes.
