# 🧪 Complete End-to-End Test Instructions

## ✅ Automated Backend Tests - PASSED
All backend systems are verified and working:
- ✅ `/api/style` requires authentication (returns 401)
- ✅ `/api/billing/config` returns credit packs and tiers
- ✅ Supabase credentials included in production bundle
- ✅ Frontend can initialize authentication

---

## 🎯 Manual Authentication & Generation Test

### Prerequisites
- Use a **real Google account** or **real email address**
- Clear browser cookies/cache or use incognito mode
- Have a portrait photo ready (JPG/PNG, under 5MB, shows face clearly)

---

### Step-by-Step Test

#### 1️⃣ Navigate to Style Generator
```
URL: https://diosa.vercel.app/#/style-generator
```

**Expected Result:**
- ✅ Page loads with "Virtual Stylist" heading
- ✅ Sign-in panel appears with:
  - "Continue with Google" button
  - Email input field for magic link
  - Text: "Your free quota (15 generations/month)..."

**Screenshot:** Take screenshot of this page

---

#### 2️⃣ Sign In with Google OAuth

**Action:** Click "Continue with Google" button

**Expected Result:**
- ✅ Redirects to Google sign-in page
- ✅ Shows "Sign in with Google" header
- ✅ Email/phone input field

**Action:** Enter your Google credentials and complete sign-in

**Expected Result:**
- ✅ Redirected back to `https://diosa.vercel.app/#/style-generator`
- ✅ Sign-in panel is **gone**
- ✅ Full StyleGenerator UI appears with:
  - Upload area ("Drop your photo here")
  - Preset selector dropdown
  - Color selector dropdown
  - Length selector (18"/22"/24")
  - "Generate Preview" button

**Screenshot:** Take screenshot showing full generator UI

---

#### 3️⃣ Upload Test Image

**Action:** 
1. Click the upload area OR drag & drop a photo
2. Select a portrait photo (face clearly visible)

**Expected Result:**
- ✅ Image preview appears on the left side
- ✅ "Generate Preview" button becomes enabled

**Screenshot:** Take screenshot showing uploaded image preview

---

#### 4️⃣ Select Style Options

**Action:**
1. Select **Preset**: "Natural Blend" (or any other)
2. Select **Color**: "Old Money" (or any other)
3. Select **Length**: "22" (or 18/24)

**Expected Result:**
- ✅ All dropdowns work
- ✅ Selected values display correctly
- ✅ Static preview image appears on right side (optional)

---

#### 5️⃣ Generate Style Preview

**Action:** Click "Generate Preview" button

**Expected Result:**
- ✅ Button shows loading state (spinner icon)
- ✅ Button text changes to "Generating..."
- ✅ Wait 30-90 seconds (Gemini AI processing)

**After generation completes:**
- ✅ Generated image appears on the right side
- ✅ Quota counter updates (e.g., "14/15 free left")
- ✅ No error messages

**Screenshot:** Take screenshot of the generated result

---

#### 6️⃣ Verify Quota Tracking

**Location:** Top-right corner of the generator panel

**Expected Text:** Something like:
```
14/15 free left
```

**Action:** Generate another preview (repeat steps 4-5)

**Expected Result:**
- ✅ Counter decreases to "13/15 free left"
- ✅ Another image generates successfully

---

#### 7️⃣ Test Error Handling (Optional)

**Test A: No Image Uploaded**
1. Clear the uploaded image
2. Try clicking "Generate Preview"
3. **Expected:** Button is disabled OR error message appears

**Test B: Quota Exhaustion**
1. Generate 15 total previews
2. Try generating a 16th
3. **Expected:** 
   - Paywall modal appears
   - Shows credit purchase options
   - Text: "You've used your 15 free generations this month."

---

## 📊 Expected Performance

| Step | Expected Time | Notes |
|------|---------------|-------|
| Page Load | 2-3 seconds | Initial render |
| OAuth Sign-In | 3-5 seconds | Google redirect + callback |
| Upload Image | <1 second | Local preview |
| Generate Preview | 30-90 seconds | Gemini AI processing |
| Quota Update | <500ms | Database write |

---

## ⚠️ Troubleshooting

### Issue: "Please sign in to generate previews" after OAuth
**Cause:** Session not stored properly  
**Solution:** 
1. Clear browser cookies for `diosa.vercel.app`
2. Sign out and sign in again
3. Try a different browser

### Issue: "Generation failed (Error 401)"
**Cause:** Authentication token expired  
**Solution:** Refresh the page and try again

### Issue: "Generation failed (Error 500)"
**Cause:** Gemini API error or server issue  
**Solution:** 
1. Check Vercel deployment logs
2. Verify `GEMINI_API_KEY` is set in Vercel
3. Try again in a few minutes

### Issue: Generation takes more than 3 minutes
**Cause:** Large image or slow Gemini response  
**Solution:** 
1. Use a smaller image (under 2MB)
2. Ensure image is under 2000px width/height
3. Retry with a different image

---

## ✅ Success Criteria

Your test is **successful** if:
- ✅ You can sign in with Google OAuth
- ✅ Upload interface appears after sign-in
- ✅ You can upload an image
- ✅ You can select preset/color/length options
- ✅ "Generate Preview" button works
- ✅ Generated image appears within 2 minutes
- ✅ Quota counter updates correctly
- ✅ Second generation also works

---

## 📸 Required Screenshots

Please provide:
1. Sign-in panel (before authentication)
2. Full generator UI (after authentication)
3. Uploaded image preview
4. Generated result image
5. Quota counter showing usage

---

## 🔍 Browser Console Logs

**How to access:**
1. Press `F12` (Windows) or `Cmd+Option+I` (Mac)
2. Click "Console" tab
3. Watch for messages while generating

**Expected logs (success):**
```
[StyleGenerator] Starting generation...
[geminiService] Calling /api/style with preset=extensions-natural-blend...
```

**Error logs to watch for:**
```
[StyleGenerator] Generation error: Error: auth_required
[geminiService] style_api_401
```

If you see errors, copy the full console output and share it.

---

## 📝 Report Template

After testing, please report:

```
✅ PASS or ❌ FAIL: Sign-in with Google
✅ PASS or ❌ FAIL: Upload image
✅ PASS or ❌ FAIL: Generate preview
✅ PASS or ❌ FAIL: Quota tracking
✅ PASS or ❌ FAIL: Second generation

Generation Time: ___ seconds
Image Quality: Good / Fair / Poor
Any Errors: (paste here)
```

---

## 🎉 Next Steps After Successful Test

If all tests pass:
1. ✅ System is production-ready
2. ✅ Users can authenticate and generate previews
3. ✅ Quota enforcement is working
4. ✅ Billing integration is functional

If any tests fail:
1. Share screenshots and console logs
2. I'll diagnose and fix the specific issue
3. Redeploy and retest

---

**Ready to test? Start with Step 1️⃣ above!**
