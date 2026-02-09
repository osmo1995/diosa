# Manual Testing Guide - Diosa Studio Production

**Production URL:** https://diosa.vercel.app/  
**Last Updated:** February 9, 2026

This guide covers manual testing of all critical user flows on the live production site.

---

## Prerequisites

- Modern browser (Chrome, Firefox, Safari, Edge)
- Google account (for OAuth sign-in test)
- Mobile device or browser DevTools responsive mode (for mobile testing)

---

## Test 1: Navigation & Routes

### Desktop Navigation
1. Visit `https://diosa.vercel.app/`
2. Click each navbar link:
   - **Home** → Should stay on `/` (hero, services grid visible)
   - **Services** → Should navigate to `/services` (method comparison table visible)
   - **Gallery** → Should navigate to `/gallery` (image grid with lightbox)
   - **About** → Should navigate to `/about` (studio info, team photo)
   - **Members** → Should navigate to `/members` (sign-in panel visible)
   - **Book Now** (button) → Should navigate to `/booking` (multi-step form)

**Expected:** All routes load without errors, no hash fragments (`#/`) in URLs.

### Mobile Navigation
1. Resize browser to mobile width (<768px) or use DevTools device mode
2. Click hamburger menu (☰) icon
3. Verify mobile menu opens (full-screen overlay)
4. Click each link in mobile menu
5. Verify menu closes after navigation

**Expected:** Mobile menu works smoothly, all links navigate correctly.

---

## Test 2: Contact Information Display

1. Scroll to footer on any page
2. Verify **Contact** section shows:
   - **Address:** 2 Bloor St E, Toronto, ON M4W 1A8
   - **Phone:** 437-929-2563
   - **Email:** info@diosa-studio.com

**Expected:** All contact details are correct and up-to-date.

---

## Test 3: Members Page Layout (Critical Fix Verification)

1. Navigate to `/members`
2. Verify the **"Members Area"** heading is **fully visible** (not hidden behind navbar)
3. Check on:
   - Desktop (>1024px width)
   - Tablet (768px-1024px)
   - Mobile (<768px)

**Expected:** Heading has proper top spacing (`pt-24 md:pt-28`) on all breakpoints.

---

## Test 4: Google OAuth Sign-In

### Part A: Initiate Sign-In
1. Navigate to `/members`
2. Click **"Continue with Google"** button
3. **Expected:** Redirected to `accounts.google.com` sign-in page

### Part B: Complete OAuth Flow
1. Sign in with your Google account
2. Grant permissions if prompted
3. **Expected:** Redirected to `https://diosa.vercel.app/auth/callback?next=/style-generator`
4. After ~2 seconds, redirected to `/style-generator`

### Part C: Verify Authenticated State
1. On `/style-generator`, verify:
   - "Sign in to continue" panel is **NOT** shown
   - Upload/customize controls are visible
   - Your email or profile icon appears in navbar (if implemented)

**Expected:** Full OAuth flow completes without errors, user lands on style generator.

---

## Test 5: Magic Link Sign-In

1. Navigate to `/members`
2. Enter your email in the **"Email link"** field
3. Click **"Send magic link"**
4. **Expected:** Success message: "Check your email for a sign-in link."
5. Open the email from Supabase
6. Click the sign-in link
7. **Expected:** Redirected to `/auth/callback?next=/style-generator`, then to `/style-generator`

**Expected:** Magic link auth works without errors.

---

## Test 6: AI Style Generator (Authenticated)

### Prerequisites
- Must be signed in (complete Test 4 or Test 5 first)

### Steps
1. Navigate to `/style-generator`
2. **Upload Image:**
   - Click upload area or drag & drop a portrait photo
   - **Expected:** Image preview appears
3. **Customize:**
   - Select **Extension Preset** (e.g., "Natural Blend")
   - Select **Color Preset** (e.g., "Old Money Blonde")
   - Select **Length** (e.g., "22 inches")
4. Click **"Generate Preview"** button
5. **Expected:**
   - Loading indicator appears
   - After ~5-10 seconds, generated image displays
   - "Download" button appears

### Quota Check
1. After generation, check if quota indicator updates (if visible)
2. **Expected:** Free quota decrements (15 → 14 remaining)

---

## Test 7: Billing / Credit Packs

### Part A: View Credit Packs
1. On `/style-generator`, scroll to "Get More Generations" section (if visible)
2. Verify credit pack options:
   - **Pack 25:** $5.00 USD (25 generations)
   - **Pack 55:** $10.00 USD (55 generations)

### Part B: Initiate Checkout
1. Click **"Buy 25 generations"**
2. **Expected:** Redirected to `checkout.stripe.com`
3. Verify Stripe Checkout shows:
   - **Product:** "Virtual Preview Stylist – Credit Packs"
   - **Price:** $5.00 USD
   - **Quantity:** 1

**DO NOT complete payment** (unless testing end-to-end billing).

### Part C: Cancel Checkout
1. Click **"Back"** or close Stripe tab
2. **Expected:** Returned to `/style-generator?billing=cancel`

---

## Test 8: Contact / Booking Form

1. Navigate to `/booking`
2. Complete the multi-step form:
   - **Step 1:** Select service (e.g., "Tape-In Extensions")
   - **Step 2:** Select desired length (e.g., "18-20 inches")
   - **Step 3:** Select preferred date
   - **Step 4:** Fill in:
     - Name (required)
     - Email (required, must be valid format)
     - Phone (required)
     - Message (optional)
3. Click **"Submit Consultation Request"**
4. **Expected:**
   - Success screen: "Request Received"
   - Option to "Return Home" or "Explore Methods"

**Validation Check:**
- Try submitting with empty required fields → Should show error messages
- Try invalid email (e.g., "test@") → Should show "Enter a valid email"

---

## Test 9: Gallery Lightbox

1. Navigate to `/gallery`
2. Click any image
3. **Expected:** Lightbox opens with full-size image
4. Test controls:
   - **Next arrow** → Shows next image
   - **Previous arrow** → Shows previous image
   - **Close (X)** or **ESC key** → Closes lightbox
   - **Click outside image** → Closes lightbox

**Expected:** All controls work smoothly, no UI glitches.

---

## Test 10: SEO & Metadata

### Part A: Page Title & Description
1. Visit homepage (`/`)
2. View page source (Ctrl+U or Cmd+U)
3. Verify `<head>` contains:
   - `<title>Diosa Studio Yorkville | Luxury Hair Extensions</title>`
   - `<meta name="description" content="...comfort-first installs, rooted blends, daylight-proof results...">`

### Part B: Open Graph (Social Sharing Preview)
1. Use Facebook Debugger: https://developers.facebook.com/tools/debug/
2. Enter URL: `https://diosa.vercel.app/`
3. Click **"Scrape Again"**
4. Verify preview shows:
   - **Title:** Diosa Studio Yorkville | Luxury Hair Extensions
   - **Description:** Luxury hair extensions in Yorkville, Toronto...
   - **Image:** Hero image (1000.webp)

### Part C: Structured Data (JSON-LD)
1. Use Google Rich Results Test: https://search.google.com/test/rich-results
2. Enter URL: `https://diosa.vercel.app/`
3. Verify schema detected:
   - **Type:** BeautySalon
   - **Address:** 2 Bloor St E, Toronto, ON M4W 1A8
   - **Phone:** +1-437-929-2563
   - **Opening Hours:** Correct schedule

---

## Test 11: Performance & Accessibility

### Part A: Lighthouse Audit
1. Open Chrome DevTools (F12)
2. Go to **Lighthouse** tab
3. Select:
   - **Mode:** Navigation
   - **Categories:** Performance, Accessibility, Best Practices, SEO
   - **Device:** Mobile
4. Click **"Analyze page load"**
5. Review scores:
   - **Performance:** 90+ (target)
   - **Accessibility:** 95+ (target)
   - **Best Practices:** 95+
   - **SEO:** 100

### Part B: Manual Accessibility Checks
1. Navigate site using **Tab key only** (no mouse)
2. Verify:
   - Focus indicators visible on all interactive elements
   - All buttons/links reachable via keyboard
   - Forms can be filled and submitted via keyboard
3. Test screen reader (optional):
   - Windows: NVDA (free)
   - macOS: VoiceOver (built-in, Cmd+F5)
   - Verify headings, landmarks, and form labels are announced

---

## Test 12: Mobile Responsiveness

### Breakpoints to Test
- **Mobile:** 375px (iPhone SE), 414px (iPhone Pro Max)
- **Tablet:** 768px (iPad), 1024px (iPad Pro)
- **Desktop:** 1280px, 1920px

### Key Checks (Each Breakpoint)
1. **Navbar:**
   - Logo visible and readable
   - Hamburger menu on mobile, full nav on desktop
2. **Hero Section:**
   - Image scales properly (no stretching)
   - Text readable and properly sized
3. **Service Cards:**
   - Grid: 1 column (mobile), 2 columns (tablet), 4 columns (desktop)
   - Images maintain aspect ratio
4. **Footer:**
   - Stacks vertically on mobile
   - 4 columns on desktop
   - Contact info remains readable

**Expected:** Layout adapts smoothly at all breakpoints, no horizontal scroll.

---

## Test 13: Error Monitoring (Post-Deployment)

### Part A: Sentry Verification
1. Wait ~24 hours after deployment
2. Log in to Sentry dashboard: https://sentry.io/
3. Check **Issues** tab
4. Verify:
   - No critical errors from production
   - Any errors have proper source maps and stack traces

### Part B: Google Analytics Verification
1. Log in to Google Analytics: https://analytics.google.com/
2. Go to **Reports** → **Realtime**
3. Visit site in incognito tab
4. Verify:
   - You appear as an active user in GA dashboard
   - Page view registered

---

## Expected Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Navigation & Routes | ✅ Pass | All routes work without hash fragments |
| Contact Info Display | ✅ Pass | Updated to 437-929-2563, 2 Bloor St E, info@diosa-studio.com |
| Members Heading Layout | ✅ Pass | Heading visible on mobile + desktop |
| Google OAuth Sign-In | ✅ Pass | Redirects to /auth/callback?next=/style-generator |
| Magic Link Sign-In | ⏳ Pending | Test with real email |
| AI Style Generator | ✅ Pass | Authenticated endpoints working (verified programmatically) |
| Billing / Credit Packs | ⏳ Pending | Verify Stripe checkout manually |
| Contact Form | ⏳ Pending | Test submission end-to-end |
| Gallery Lightbox | ⏳ Pending | Manual verification |
| SEO & Metadata | ✅ Pass | Structured data updated with correct contact info |
| Performance & A11y | ⏳ Pending | Run Lighthouse audit |
| Mobile Responsiveness | ⏳ Pending | Test on real devices |
| Error Monitoring | ⏳ Pending | Check Sentry + GA after 24h |

---

## Reporting Issues

If any test fails:
1. Note the exact step where failure occurred
2. Capture screenshot or screen recording
3. Check browser console for errors (F12 → Console tab)
4. Report to development team with:
   - Browser (Chrome 120, Safari 17, etc.)
   - Device (Desktop, iPhone 14, etc.)
   - URL where issue occurred
   - Steps to reproduce

---

**Testing completed by:** _________________  
**Date:** _________________  
**Browser/Device:** _________________  
**Overall Status:** ⏳ In Progress / ✅ Pass / ❌ Fail
