<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1IxU2G0iWEP2wBOi2bW5Ru7hsqgRBuqdX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Supabase persistence for generated images
   - Create a Supabase Storage bucket named `generated-previews`
     - Recommended: **Private bucket** + signed URLs (more secure)
   - In Vercel project env (or `.env.local` for local dev), set:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_STYLE_BUCKET=generated-previews`
     - `SUPABASE_BUCKET_PUBLIC=false`
     - `SUPABASE_SIGNED_URL_TTL_SECONDS=3600` (optional)
   - Run `supabase_schema.sql` in Supabase SQL Editor to create `style_generations` table
   - Optional: `GET /api/generations?limit=20` lists recent generations.
     - If you set `ADMIN_TOKEN`, requests must include header `x-admin-token: <token>`
4. Run the app:
   `npm run dev`
