# Utility Functions Library

This directory contains reusable utility functions and services used throughout the application.

## Table of Contents

- [Authentication & Sessions](#authentication--sessions)
- [Email Services](#email-services)
- [SMS Services](#sms-services)
- [Validation](#validation)
- [Logging & Error Tracking](#logging--error-tracking)
- [Security](#security)
- [Data Formatting](#data-formatting)

---

## Authentication & Sessions

### auth.ts

Core authentication and session management.

**Key Functions:**
- `generateToken(length)` - Generate cryptographically secure random tokens
- `generateSMSCode()` - Generate 6-digit SMS verification codes
- `hashPassword(password)` - Hash passwords using bcrypt (cost factor 12)
- `verifyPassword(password, hash)` - Verify password against bcrypt hash
- `createSession(supporterId, request)` - Create user session (48hr expiry)
- `validateSession(token)` - Validate session token and get supporter
- `getCurrentSupporter()` - Get currently logged-in supporter from cookies
- `deleteSession(token)` - Logout (single device)
- `deleteAllSessions(supporterId)` - Logout from all devices
- `createEmailVerification(supporterId, purpose)` - Generate email verification token
- `validateEmailVerification(token, purpose)` - Validate email verification token
- `createSMSVerification(supporterId, phone)` - Generate SMS verification code
- `validateSMSCode(supporterId, code)` - Validate SMS verification code
- `getSupporterByEmail(email)` - Retrieve supporter by email
- `getSupporterById(id)` - Retrieve supporter by ID
- `updateSupporter(id, updates)` - Update supporter record
- `isAdmin(supporter)` - Check if user is admin
- `isSuperAdmin(supporter)` - Check if user is super admin
- `getVerifiedVoter()` - Get lightweight verified voter from cookie

**Session Expiry:**
- Regular sessions: 48 hours (configurable via `SESSION_EXPIRY_HOURS`)
- Email verification: 24 hours (configurable via `VERIFICATION_EXPIRY_HOURS`)
- SMS codes: 10 minutes (configurable via `SMS_CODE_EXPIRY_MINUTES`)

### admin-session.js

Admin-specific session management using password authentication.

**Key Functions:**
- `createAdminSession(request)` - Create admin session (8hr expiry)
- `validateAdminSession(token)` - Validate admin session token
- `deleteAdminSession(token)` - Logout admin
- `requireAdmin(req)` - Middleware to check admin session

**Differences from Regular Sessions:**
- Admin sessions use `supporter_id: null` in the sessions table
- Shorter expiry time (8 hours)
- Separate cookie name (`admin_session`)

---

## Email Services

### emailService.js

Email delivery using Resend API. Supports transactional emails and broadcast campaigns.

**Transactional Emails:**
- `sendVerificationEmail(email, name, token)` - Send email verification link
- `sendPasswordResetEmail(email, name, token)` - Send password reset link
- `sendWelcomeEmail(email, name)` - Welcome email after account approval
- `sendCommentApprovedEmail(...)` - Notify when comment is approved
- `sendCommentRejectedEmail(email, name, reason)` - Notify when comment is rejected
- `sendPhoneUpdateReminderEmail(email, name)` - Remind to add phone number
- `sendVoterVerificationEmail(email, name, token)` - Lightweight voter verification

**Admin Notifications:**
- `sendAdminNewRegistrationEmail(supporter)` - Notify admins of new signups
- `sendAdminPendingCommentEmail(comment, contextTitle)` - Notify admins of pending comments

**User Notifications:**
- `sendNewCommentNotificationEmail(...)` - Notify participants of new comments
- `sendNewReplyNotificationEmail(...)` - Notify when someone replies to your comment
- `sendWeeklyDigestEmail(email, name, digestData, unsubscribeToken)` - Weekly activity summary

**Broadcast:**
- `sendBroadcastEmail(subject, htmlBody, recipients)` - Batch send to multiple recipients (max 100 per batch)

**Utilities:**
- `getCampaignFooter(unsubscribeEmail, unsubscribeUrl)` - Standard footer with unsubscribe
- `stripHtml(html)` - Convert HTML to plain text for email clients

**Configuration:**
- Requires `RESEND_API_KEY` environment variable
- Sender: `Doug Charles <hello@dougcharles.com>`
- All emails include campaign footer with unsubscribe links

### sendEmail.js

Simple email utility for sending arbitrary emails.

**Key Functions:**
- `sendEmail(to, subject, text)` - Send plain text email
- `sendNotificationEmail(subject, text)` - Send to `NOTIFY_EMAIL` address

---

## SMS Services

### smsService.js

SMS delivery using Telnyx REST API with A2P 10DLC compliance.

**Key Functions:**
- `sendSMS(to, message)` - Send SMS to single recipient
- `sendVerificationSMS(phone, code)` - Send verification code
- `sendBroadcastSMS(phones, message)` - Batch send to multiple recipients (10 per batch with 100ms delay)

**Configuration:**
- Requires `TELNYX_API_KEY` and `TELNYX_PHONE_NUMBER`
- Optional: `TELNYX_CAMPAIGN_ID` and `TELNYX_TCR_ID` for 10DLC compliance
- Automatically appends "Reply STOP to unsubscribe" to broadcasts

---

## Validation

### phoneValidation.js

US phone number validation and formatting using libphonenumber-js.

**Key Functions:**
- `validatePhoneNumber(phone)` - Validate and format US phone number to E.164
- `formatPhoneForDisplay(e164Phone)` - Format E.164 to national format (e.g., "(972) 555-1234")

**Returns:**
```javascript
{
  valid: boolean,
  formatted: string | null,  // E.164 format: +19725551234
  error: string | null
}
```

### uspsValidation.js

Address validation using USPS Web Tools API.

**Key Functions:**
- `validateAddress({ street, city, state, zip })` - Validate and standardize US address
- `isProsperAreaZip(zip)` - Check if ZIP code is in Prosper, TX area

**Returns:**
```javascript
{
  valid: boolean,
  deliverable: boolean,      // DPV confirmation from USPS
  standardized: {
    street: string,
    city: string,
    state: string,
    zip: string              // 5 or 9 digit ZIP
  } | null,
  error: string | null,
  skipped: boolean           // true if USPS_USER_ID not configured
}
```

**Configuration:**
- Requires `USPS_USER_ID` environment variable
- Register at: https://www.usps.com/business/web-tools-apis/
- Gracefully degrades if not configured (returns input as valid)

### recaptcha.js

Google reCAPTCHA v3 verification.

**Key Functions:**
- `verifyCaptcha(token, action)` - Verify reCAPTCHA token on server side
- `shouldRequireCaptcha(req)` - Middleware to determine if CAPTCHA is required

**Configuration:**
- Requires `RECAPTCHA_SECRET_KEY` environment variable
- Default score threshold: 0.5 (configurable via `RECAPTCHA_SCORE_THRESHOLD`)
- Bypasses verification in development mode

**Returns:**
```javascript
{
  success: boolean,
  score: number,             // 0.0 to 1.0 (1.0 = very likely human)
  error: string | null
}
```

---

## Logging & Error Tracking

### logging.js

Comprehensive audit logging and error tracking with Supabase storage.

**Audit Logging:**
- `logAudit({ eventType, supporterId, targetId, ... })` - Log security/audit events
- Captures IP, user agent, browser, OS, device type
- Sanitizes request body (removes passwords, tokens, etc.)

**Error Logging:**
- `logError({ errorType, errorMessage, ... })` - Log errors with auto-deduplication
- Tracks occurrence count for repeated errors
- Notifies superusers of new errors
- Includes device/browser info in context

**User Agent Parsing:**
- `parseUserAgent(userAgent)` - Extract browser, OS, and device type
- `getDeviceType(userAgent)` - Classify as mobile/tablet/desktop
- `getRequestMeta(request)` - Extract IP, UA, method, path, browser, OS, device

**Constants:**
- `AuditEvents` - Predefined audit event types (LOGIN_SUCCESS, REGISTER, POLL_VOTE, etc.)
- `ErrorTypes` - Error categories (API_ERROR, CLIENT_ERROR, SERVER_ERROR, etc.)

**Superuser Notifications:**
- Automatically emails superusers when new errors occur
- Uses `sendEmail()` from sendEmail.js
- Includes error ID, type, endpoint, device info

### clientErrorLogger.js

Client-side error logging utility.

**Key Functions:**
- `logClientError({ errorType, errorMessage, ... })` - Log client-side errors to server
- `logValidationError(formName, fieldName, errorMessage)` - Log form validation errors
- `logApiError(endpoint, method, statusCode, errorMessage)` - Log API call failures
- `logComponentError(componentName, errorMessage, errorStack)` - Log React component errors
- `setupGlobalErrorHandlers()` - Setup window.onerror and unhandledrejection handlers

**Features:**
- Automatically sanitizes sensitive data (passwords, tokens, etc.)
- Sends errors to `/api/errors` endpoint
- Silent failures to prevent error loops
- Skips logging in development mode (console only)

---

## Security

### rateLimit.js

In-memory IP-based rate limiting.

**Key Function:**
- `rateLimit(ip, limit, windowMs)` - Check if IP is within rate limit

**Parameters:**
- `ip` - Client IP address
- `limit` - Max requests allowed (default: 5)
- `windowMs` - Time window in milliseconds (default: 60000 = 1 minute)

**Features:**
- Automatic cleanup of stale entries (every 5 minutes)
- Prevents memory leaks with 1-hour max entry age
- Per-route rate limiting by prefixing IP (e.g., `login-${ip}`)

**Example Usage:**
```javascript
if (!rateLimit(`login-${ip}`, 10, 900000)) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
}
```

### sanitize.ts

XSS protection using DOMPurify.

**Key Functions:**
- `sanitizeText(input)` - Remove all HTML tags, keep text only
- `sanitizeObject(obj)` - Sanitize all string values in object (shallow)

**Features:**
- Works in both browser and Node.js (isomorphic-dompurify)
- Configured with zero-trust policy (no tags or attributes allowed)
- Preserves text content when removing tags

### anonymousVoting.js

Anonymous voter fingerprinting for duplicate vote prevention.

**Key Functions:**
- `generateAnonymousVoterFingerprint(ip, userAgent)` - Create SHA-256 fingerprint
- `generateAnonymousVoterToken()` - Generate random 32-char token for cookie

**Constants:**
- `ANONYMOUS_VOTER_COOKIE` - Cookie name ('av_session')
- `ANONYMOUS_VOTER_COOKIE_OPTIONS` - Cookie config (httpOnly, 1 year expiry)

---

## Data Formatting

### formatDisplayName.js

User name formatting for privacy.

**Key Functions:**
- `formatDisplayName(firstName, lastName)` - Format as "First L."
- `getUserDisplayName(user)` - Extract and format name from user object
- `parseNameParts(name)` - Split full name into first_name and last_initial

**Examples:**
```javascript
formatDisplayName('John', 'Smith')  // "John S."
formatDisplayName('Jane', '')       // "Jane"
formatDisplayName('', '')           // "Anonymous"
```

### reports.js

CSV export utilities.

**Key Functions:**
- `toCSV(data, columns)` - Convert array of objects to CSV string
- `csvResponse(csvString, filename)` - Create downloadable CSV Response

**Features:**
- Handles null/undefined values
- Escapes special characters (quotes, commas, newlines)
- Custom column selection

---

## Configuration & Environment

### env.js

Environment variable validation.

**Validates Required Variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE`
- `RESEND_API_KEY`
- `NOTIFY_EMAIL`
- `SMTP_FROM`
- `SITE_URL`
- `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD`

**Behavior:**
- Throws error in production if variables missing
- Logs warning in development

### supabase.ts

Lazy-initialized Supabase clients.

**Key Functions:**
- `getSupabase()` - Get service role client (full access)
- `getSupabaseAnon()` - Get anon client (RLS enforced)
- `createSupabaseClient()` - Create new client instance

**Notes:**
- Clients are singletons (lazy-initialized once)
- Service role bypasses Row Level Security
- Anon client respects RLS policies

---

## Notification System

### notifications.js

Comment and reply notification triggers.

**Key Functions:**
- `notifyParticipantsOfNewComment(comment)` - Notify voters and commenters when new comment is approved
- `notifyParentCommentAuthor(replyComment)` - Notify parent author when reply is approved

**Features:**
- Respects user notification preferences
- Deduplicates recipients
- Excludes comment author from notifications
- Includes unsubscribe tokens in emails

---

## API Client

### apiClient.js

Fetch wrapper with automatic error logging.

**Key Functions:**
- `apiCall(url, options)` - Make API call with error logging
- `get(url)` - GET request
- `post(url, body)` - POST request with JSON body
- `put(url, body)` - PUT request with JSON body
- `del(url)` - DELETE request

**Features:**
- Automatic error logging to `/api/errors`
- Tracks response time
- Logs network errors and HTTP errors
- Returns consistent response format: `{ ok, data, error, status }`
- Silent failure on logging errors to prevent infinite loops
- Only logs errors in browser (prevents server-side logging loops)

---

## Best Practices

### Using Authentication

```javascript
import { getCurrentSupporter, isAdmin } from '@/lib/auth';

// In Server Components
const supporter = await getCurrentSupporter();
if (!supporter) {
  redirect('/auth/login');
}

if (isAdmin(supporter)) {
  // Show admin features
}
```

### Using Rate Limiting

```javascript
import { rateLimit } from '@/lib/rateLimit';

const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

if (!rateLimit(`register-${ip}`, 5, 3600000)) {
  return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
}
```

### Using Validation

```javascript
import { validatePhoneNumber } from '@/lib/phoneValidation';
import { validateAddress } from '@/lib/uspsValidation';

const phoneValidation = validatePhoneNumber(phone);
if (!phoneValidation.valid) {
  return { error: phoneValidation.error };
}

const addressValidation = await validateAddress({ street, city, state, zip });
if (!addressValidation.valid) {
  return { error: addressValidation.error };
}
```

### Using Logging

```javascript
import { logAudit, logError, AuditEvents, ErrorTypes } from '@/lib/logging';

// Log audit event
await logAudit({
  eventType: AuditEvents.LOGIN_SUCCESS,
  supporterId: supporter.id,
  details: { email: supporter.email },
  request,
  responseStatus: 200,
});

// Log error
await logError({
  errorType: ErrorTypes.API_ERROR,
  errorMessage: 'Failed to process request',
  errorStack: err.stack,
  endpoint: '/api/polls',
  request,
});
```

### Using Email Services

```javascript
import { sendVerificationEmail, sendBroadcastEmail } from '@/lib/emailService';

// Send transactional email
await sendVerificationEmail(email, firstName, token);

// Send broadcast
const recipients = supporters.map(s => ({ email: s.email, name: s.first_name }));
const result = await sendBroadcastEmail(subject, htmlBody, recipients);
console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
```

---

## Testing

When testing utility functions:

1. **Auth Functions**: Use `createSupabaseClient()` to get a fresh client instance
2. **Email Services**: Check for `RESEND_API_KEY` before running tests
3. **SMS Services**: Check for `TELNYX_API_KEY` before running tests
4. **Validation**: USPS validation gracefully degrades if API key missing
5. **Rate Limiting**: Use unique IP prefixes in tests to avoid collisions

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `TELNYX_API_KEY` | No | Telnyx SMS API key |
| `TELNYX_PHONE_NUMBER` | No | Telnyx sender phone number |
| `TELNYX_CAMPAIGN_ID` | No | Telnyx 10DLC campaign ID |
| `USPS_USER_ID` | No | USPS Web Tools user ID |
| `RECAPTCHA_SECRET_KEY` | No | Google reCAPTCHA secret key |
| `ADMIN_PASSWORD_HASH` | Yes | Bcrypt hash of admin password |
| `SESSION_EXPIRY_HOURS` | No | Session expiry (default: 48) |
| `VERIFICATION_EXPIRY_HOURS` | No | Email token expiry (default: 24) |
| `SMS_CODE_EXPIRY_MINUTES` | No | SMS code expiry (default: 10) |
| `RECAPTCHA_SCORE_THRESHOLD` | No | reCAPTCHA threshold (default: 0.5) |
