# Production Deployment Checklist - Security & Compliance Features

## Pre-Deployment Steps

### 1. Google reCAPTCHA Setup

- [ ] Visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [ ] Create new reCAPTCHA v3 site
- [ ] Add domain: `www.dougcharles.com`
- [ ] Copy Site Key (starts with `6Le...`)
- [ ] Copy Secret Key (starts with `6Le...`)
- [ ] Save keys securely

### 2. Environment Variables

Add to Vercel/Production environment:

```bash
# reCAPTCHA Keys
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_actual_site_key_here
RECAPTCHA_SECRET_KEY=your_actual_secret_key_here
RECAPTCHA_SCORE_THRESHOLD=0.5
```

**Verification:**
- [ ] Site key starts with `NEXT_PUBLIC_` (required for client access)
- [ ] Secret key does NOT start with `NEXT_PUBLIC_` (server-only)
- [ ] Keys are from reCAPTCHA v3 (not v2)
- [ ] Threshold is between 0.0 and 1.0

### 3. Privacy Policy Update

Update `/src/app/privacy/page.js` to include:

- [ ] Cookie usage explanation
  - Session cookies (authentication)
  - Analytics cookies (Vercel Analytics)
  - reCAPTCHA cookies (Google)
- [ ] Third-party services disclosure
  - Google reCAPTCHA
  - Vercel Analytics
  - Supabase
- [ ] User rights
  - How to decline cookies
  - How to request data deletion
  - How to export data
- [ ] Data retention policies
- [ ] GDPR compliance statement

### 4. Code Review

- [x] All API routes include reCAPTCHA verification
- [x] Cookie consent banner appears on first visit
- [x] reCAPTCHA provider wraps application
- [x] Environment variables documented in `.env.example`
- [x] All code formatted with Prettier
- [x] Build succeeds without errors
- [x] No security vulnerabilities in dependencies

### 5. Build Verification

Run locally before deploying:

```bash
# Clean build
rm -rf .next
npm run build

# Should see:
# ✓ Compiled successfully
# ✓ Generating static pages (77/77)

# Check for security issues
npm audit
# Should show: found 0 vulnerabilities
```

- [ ] Build completes successfully
- [ ] No TypeScript/ESLint errors
- [ ] No npm audit vulnerabilities
- [ ] All routes generate correctly

## Deployment

### 1. Deploy to Vercel

```bash
git add .
git commit -m "feat(security): add reCAPTCHA, cookie consent, and Next.js security updates"
git push origin main
```

- [ ] Deployment succeeds
- [ ] No build errors in Vercel
- [ ] Environment variables set in Vercel dashboard

### 2. Post-Deployment Verification

Test on production URL:

**Cookie Consent:**
- [ ] Banner appears on first visit (test in incognito mode)
- [ ] "Accept" button dismisses banner
- [ ] "Decline" button dismisses banner
- [ ] Banner doesn't reappear after dismissal
- [ ] Privacy Policy link works
- [ ] Mobile responsive (test on phone)

**reCAPTCHA Protection:**
- [ ] Submit an idea (should work)
- [ ] Submit an endorsement (should work)
- [ ] Submit a question (should work)
- [ ] Submit interest form (should work)
- [ ] Check reCAPTCHA Admin Console for scores
- [ ] Verify scores are reasonable (0.7-1.0 for humans)

**Forms:**
- [ ] All forms submit successfully
- [ ] Confirmation emails arrive
- [ ] No JavaScript errors in browser console
- [ ] Forms work on mobile devices
- [ ] Forms work in different browsers (Chrome, Safari, Firefox)

### 3. Monitor reCAPTCHA

Check Google reCAPTCHA Admin Console:

- [ ] Verify traffic is being recorded
- [ ] Review score distribution
- [ ] Check for unusual patterns
- [ ] Set up email alerts for:
  - Low average scores (potential bot attack)
  - High request volume
  - Failed verifications

**Expected Score Ranges:**
- 0.9-1.0: Very likely human (most users)
- 0.7-0.9: Probably human
- 0.3-0.7: Suspicious (review manually)
- 0.0-0.3: Very likely bot (rejected)

### 4. Analytics Check

Verify Vercel Analytics:

- [ ] Page views tracked
- [ ] No errors from cookie consent banner
- [ ] Speed Insights working
- [ ] Core Web Vitals within acceptable range

## Week 1 Monitoring

### Daily Checks (First 3 Days)

- [ ] Check reCAPTCHA scores in Admin Console
- [ ] Review any form submission failures
- [ ] Monitor error logs for CAPTCHA issues
- [ ] Check cookie consent dismissal rate

### Week 1 Review

After 7 days, review and adjust:

- [ ] Average reCAPTCHA score (should be > 0.7)
- [ ] False positive rate (legitimate users blocked)
- [ ] Cookie consent acceptance rate
- [ ] Any user complaints about CAPTCHA

**Adjustments:**
- If too many false positives: Lower `RECAPTCHA_SCORE_THRESHOLD` to 0.3
- If getting spam: Raise threshold to 0.7
- If scores look suspicious: Investigate in Admin Console

## Rollback Plan

If critical issues occur:

### Option 1: Disable reCAPTCHA Temporarily

1. Remove environment variables:
   ```bash
   # In Vercel dashboard, delete:
   # NEXT_PUBLIC_RECAPTCHA_SITE_KEY
   # RECAPTCHA_SECRET_KEY
   ```
2. Redeploy (forms will work without CAPTCHA)
3. Investigate issue
4. Re-enable when resolved

### Option 2: Full Rollback

```bash
git revert <commit-hash>
git push origin main
```

## Success Criteria

Deployment is successful when:

- [x] All builds pass
- [x] No security vulnerabilities
- [ ] Cookie consent banner works
- [ ] All forms submit successfully with reCAPTCHA
- [ ] No increase in error rate
- [ ] reCAPTCHA scores are reasonable (>0.5 average)
- [ ] No user complaints

## Support Contacts

- **reCAPTCHA Issues:** Google reCAPTCHA Support
- **Deployment Issues:** Vercel Support
- **Code Issues:** Review documentation in `SECURITY_COMPLIANCE_IMPLEMENTATION.md`

## Documentation References

- `SECURITY_COMPLIANCE_IMPLEMENTATION.md` - Detailed implementation guide
- `SECURITY_UPDATES_2026-02-02.md` - Summary of all changes
- `RECAPTCHA_INTEGRATION_GUIDE.md` - How to add CAPTCHA to new forms
- `.env.example` - Environment variable reference

## Notes

- All features degrade gracefully if not configured
- reCAPTCHA is bypassed in development mode
- Cookie consent uses localStorage (no server requirement)
- Security updates are backward compatible

## Completion

Date deployed: _______________

Deployed by: _______________

Production URL verified: [ ]

All checks passed: [ ]

reCAPTCHA monitoring enabled: [ ]

Team notified: [ ]
