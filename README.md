<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1IxU2G0iWEP2wBOi2bW5Ru7hsqgRBuqdX

## Run Locally

## Real-device test checklist (iPhone + Android)
- Home: hero loads fast, text readable, CTA buttons tappable (44px+)
- Nav: open/close menu, focus trap not broken, links route correctly
- Booking: complete steps, required field errors display, success screen shows summary
- Style Generator: previews load, generation works, saved link copy works
- Gallery: open/close lightbox, swipe/scroll behavior, keyboard focus
- Performance: check LCP/CLS visually on cellular

## Lighthouse checklist (official)
Run from Chrome DevTools Lighthouse:
- Mobile + Desktop
- Record Performance/Accessibility/Best Practices/SEO
- Note LCP/CLS/INP and top opportunities


**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set `VITE_SITE_URL` (recommended) for canonical/OG/sitemap consistency (e.g. `https://diosa.vercel.app`)
4. (Optional) Enable analytics by setting `VITE_GA_MEASUREMENT_ID` (GA4 Measurement ID)
5. (Optional) Enable monitoring by setting `VITE_SENTRY_DSN`
3. (Optional) Supabase persistence for generated images
   - Supabase dashboard checklist:
     1) Storage → create bucket `generated-previews` (recommended: **Private**)
        - Note: API will attempt to auto-create this bucket, but creating it in the dashboard is still recommended.
     2) SQL Editor → run `supabase_schema.sql`
     3) (Optional) SQL Editor → run `supabase_indexes.sql` for faster lookups
     4) Vercel env (Production):
        - `SUPABASE_URL`
        - `SUPABASE_SERVICE_ROLE_KEY` (service_role JWT starting with `eyJ...`)
        - `SUPABASE_STYLE_BUCKET=generated-previews`
        - `SUPABASE_BUCKET_PUBLIC=false`
        - `SUPABASE_SIGNED_URL_TTL_SECONDS=3600` (optional)
        - `ADMIN_TOKEN` (required for /api/generations)

   - Admin listing endpoint (protected):
     - `GET /api/generations?limit=20`
     - Must include header: `x-admin-token: <ADMIN_TOKEN>`
4. Run the app:
   `npm run dev`
