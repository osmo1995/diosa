# Google Analytics (GA4) Setup Instructions

This site is ready for Google Analytics 4 (GA4). Follow these steps to activate tracking:

## 1. Create a GA4 Property (if you don't have one)

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click **Admin** (gear icon, bottom left)
4. Under **Account**, click **Create Account** (or use an existing one)
5. Under **Property**, click **Create Property**
   - Property name: `Diosa Studio Yorkville`
   - Time zone: `Canada/Eastern`
   - Currency: `CAD`
6. Click **Next**, fill in business details, then **Create**

## 2. Set up a Web Data Stream

1. In the new property, you'll be prompted to add a data stream
2. Click **Web**
3. Website URL: `https://diosa.vercel.app`
4. Stream name: `Diosa Production`
5. Click **Create stream**

## 3. Get your Measurement ID

After creating the stream, you'll see:
- **Measurement ID**: `G-XXXXXXXXXX` (copy this)

## 4. Add Measurement ID to Vercel Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/anas-projects-37a977a8/diosa)
2. Click **Settings** → **Environment Variables**
3. Add a new variable:
   - **Name**: `VITE_GA_MEASUREMENT_ID`
   - **Value**: `G-XXXXXXXXXX` (paste your actual Measurement ID)
   - **Environments**: Production, Preview, Development (check all)
4. Click **Save**

## 5. Redeploy

After adding the env var, trigger a new deployment:
- Push a commit to `main`, OR
- Go to Deployments → click "..." → Redeploy

## 6. Verify Tracking

1. Visit your live site: `https://diosa.vercel.app/`
2. In Google Analytics, go to **Reports** → **Realtime**
3. You should see yourself as an active user within ~30 seconds

## Optional: Enable Enhanced Measurement

In GA4 Data Stream settings, **Enhanced measurement** is usually enabled by default. This tracks:
- Pageviews
- Scrolls
- Outbound clicks
- Site search
- Video engagement
- File downloads

You can toggle specific events on/off in the stream settings.

## Privacy & GDPR Compliance

If you have EU/UK visitors, consider:
- Adding a cookie consent banner (e.g., [Cookiebot](https://www.cookiebot.com/), [OneTrust](https://www.onetrust.com/))
- Update your Privacy Policy to mention Google Analytics
- Configure GA4 data retention settings (Admin → Data Settings → Data Retention)

---

**Done!** Your site will now track pageviews, events, and user behavior in Google Analytics.
