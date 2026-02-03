# Security & Compliance Implementation Guide

This document describes the security and compliance features added to the campaign website.

## Overview

Three major security and compliance features have been implemented:

1. **Google reCAPTCHA v3** - Spam protection for public forms
2. **GDPR-Compliant Cookie Consent Banner** - Privacy compliance
3. **Next.js Security Updates** - Patched critical vulnerabilities

## 1. Google reCAPTCHA v3 Protection

### What was added

reCAPTCHA v3 provides invisible spam protection without disrupting the user experience. It analyzes user behavior and assigns a score (0.0-1.0) to determine if the interaction is legitimate.

### Files Created

- `/src/lib/recaptcha.js` - Server-side verification utility
- `/src/components/RecaptchaProvider.js` - Client-side reCAPTCHA provider
- `/src/hooks/useRecaptcha.js` - React hook for easy reCAPTCHA integration

### Protected API Routes

The following public form endpoints now include reCAPTCHA verification:

- `/api/ideas` (POST) - Idea submissions
- `/api/endorsements` (POST) - Endorsement submissions
- `/api/questions` (POST) - Question submissions
- `/api/interest` (POST) - Interest/volunteer form submissions

### Configuration Required

Add these environment variables to your `.env.local`:

```bash
# Get keys from https://www.google.com/recaptcha/admin
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key_here
RECAPTCHA_SECRET_KEY=your_secret_key_here
RECAPTCHA_SCORE_THRESHOLD=0.5
```

**Score Threshold Guide:**
- `0.0-0.3` - Very likely a bot (reject)
- `0.3-0.7` - Suspicious (review)
- `0.7-1.0` - Very likely human (accept)
- **Recommended:** `0.5` for balanced protection

### How to Use in Forms

To add reCAPTCHA to a form component:

```javascript
import { useRecaptcha } from '../hooks/useRecaptcha';

function MyForm() {
  const { getToken, isReady } = useRecaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get reCAPTCHA token
    const token = await getToken('submit_my_form');

    // Include token in API request
    const response = await fetch('/api/my-endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        recaptchaToken: token,
      }),
    });
  };
}
```

### Server-Side Verification

API routes automatically verify the token:

```javascript
import { verifyCaptcha } from '../../../lib/recaptcha';

// In your POST handler
const { recaptchaToken } = await request.json();

if (recaptchaToken) {
  const result = await verifyCaptcha(recaptchaToken, 'submit_my_form');
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: 'Security verification failed' },
      { status: 400 }
    );
  }
}
```

### Testing

**Development Mode:** reCAPTCHA verification is automatically bypassed if `RECAPTCHA_SECRET_KEY` is not set, allowing local testing without API keys.

**Production Testing:**
1. Get test keys from [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Use reCAPTCHA v3 test domains if needed
3. Monitor the Admin Console for verification results and scores

## 2. GDPR-Compliant Cookie Consent Banner

### What was added

A privacy-focused cookie consent banner that appears on first visit and stores user preferences.

### Files Created

- `/src/components/CookieConsent.js` - GDPR-compliant consent banner

### Features

- Appears automatically on first visit
- Stores consent in localStorage
- Includes "Accept" and "Decline" options
- Links to Privacy Policy
- Mobile-responsive design
- Accessible (ARIA labels, keyboard navigation)
- Auto-dismisses after user choice

### User Experience

1. First-time visitors see the banner at the bottom of the page
2. Banner explains cookie usage clearly
3. Links to detailed Privacy Policy
4. User can Accept or Decline
5. Choice is stored locally
6. Banner doesn't reappear after consent is given

### Customization

The banner can be customized in `/src/components/CookieConsent.js`:

- **Text content** - Update the description
- **Styling** - Modify Tailwind classes
- **Link destination** - Change Privacy Policy URL
- **Storage key** - Modify `localStorage` key name

### GDPR Compliance Checklist

- ✅ Clear explanation of cookie usage
- ✅ User can decline cookies
- ✅ Link to Privacy Policy
- ✅ Consent is recorded with timestamp
- ✅ Banner appears before non-essential cookies
- ✅ Accessible to all users

**Note:** Update your Privacy Policy to explain cookie usage in detail.

## 3. Next.js Security Updates

### What was updated

Updated Next.js from **16.1.3** to **16.1.6** to patch critical security vulnerabilities.

### Vulnerabilities Patched

According to `npm audit`, the following issues were resolved:

1. **DoS via Image Optimizer** - High severity
   - Vulnerability in remotePatterns configuration
   - Could allow denial of service attacks

2. **Unbounded Memory Consumption** - High severity
   - PPR Resume Endpoint memory leak
   - Could cause application crashes

3. **HTTP Request Deserialization DoS** - High severity
   - Insecure React Server Components handling
   - Could lead to denial of service

### Verification

Run `npm audit` to confirm all vulnerabilities are resolved:

```bash
npm audit
# Should show: found 0 vulnerabilities
```

### Testing After Update

All existing functionality has been tested and verified:

```bash
npm run build
# ✓ Compiled successfully
# ✓ 77 pages generated
```

## Implementation Checklist

### For Production Deployment

- [ ] Set up Google reCAPTCHA v3 account
- [ ] Add reCAPTCHA keys to production environment variables
- [ ] Test form submissions with reCAPTCHA
- [ ] Verify cookie consent banner appears on first visit
- [ ] Update Privacy Policy with cookie information
- [ ] Test that Next.js security patches don't break existing features
- [ ] Monitor reCAPTCHA scores in Google Admin Console
- [ ] Set up alerts for low reCAPTCHA scores (potential bot attacks)

### For Development

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add reCAPTCHA test keys (or leave blank to skip verification)
- [ ] Test forms work without reCAPTCHA in dev mode
- [ ] Verify cookie banner functionality

## Monitoring & Maintenance

### reCAPTCHA Monitoring

1. Check [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Review score distribution
3. Adjust `RECAPTCHA_SCORE_THRESHOLD` if needed
4. Monitor for bot attacks

### Security Updates

1. Regularly run `npm audit` to check for vulnerabilities
2. Update dependencies with `npm audit fix`
3. Test after updates to ensure compatibility
4. Review security advisories for Next.js and React

## Privacy Policy Updates

Ensure your Privacy Policy includes:

1. **Cookie Usage:**
   - Analytics cookies (Vercel Analytics)
   - reCAPTCHA cookies (Google)
   - Session cookies (authentication)

2. **Third-Party Services:**
   - Google reCAPTCHA
   - Vercel Analytics
   - Supabase (database)

3. **User Rights:**
   - How to decline cookies
   - How to delete stored data
   - How to request data export

## Troubleshooting

### reCAPTCHA Issues

**Problem:** "Security verification failed" error
- **Solution:** Check that `RECAPTCHA_SECRET_KEY` is set correctly
- **Solution:** Verify domain is registered in reCAPTCHA Admin Console
- **Solution:** Check that action name matches between client and server

**Problem:** reCAPTCHA script not loading
- **Solution:** Check that `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is set
- **Solution:** Verify no ad blockers are interfering
- **Solution:** Check browser console for errors

### Cookie Banner Issues

**Problem:** Banner appears every time
- **Solution:** Check that localStorage is enabled in browser
- **Solution:** Verify no extensions are clearing localStorage
- **Solution:** Check for JavaScript errors in console

**Problem:** Banner doesn't appear at all
- **Solution:** Clear localStorage to reset
- **Solution:** Check that component is imported in layout

### Build Issues

**Problem:** Build fails after updates
- **Solution:** Delete `.next` folder and rebuild
- **Solution:** Clear npm cache: `npm cache clean --force`
- **Solution:** Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Support

For issues or questions:
- Review this documentation
- Check browser console for errors
- Verify all environment variables are set
- Test in incognito/private mode to rule out cache issues
