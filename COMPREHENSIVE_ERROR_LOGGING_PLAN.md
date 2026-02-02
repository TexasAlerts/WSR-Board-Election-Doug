# Comprehensive Error Logging Implementation Plan

## Current Status

### ✅ Already Implemented
1. **404 Errors** - Logged via client-side logger in not-found.js
2. **Server-side API errors** - Logged via logError() in API routes
3. **Client-side React errors** - Caught by ErrorBoundary component
4. **Admin dashboard errors** - Just added in latest commit

### ❌ Missing Coverage

1. **Client-side fetch/network errors** - Not all API calls log failures
2. **Unhandled promise rejections** - Need global handler
3. **Database query errors** - Some Supabase errors not logged
4. **Build/deployment errors** - Not tracked
5. **Email sending failures** - Need better error tracking
6. **SMS sending failures** - Need error tracking
7. **Rate limiting rejections** - Not logged
8. **Authentication failures** - Need more detailed logging
9. **File upload errors** - If any exist
10. **Third-party service failures** - Vercel, Supabase connectivity

## Implementation Steps

### Phase 1: Global Error Handlers (High Priority)

#### 1.1 Add Global Unhandled Error Handler
**File**: `src/app/layout.js`
**Action**: Add global error event listeners

```javascript
// Add to layout.js client-side code
useEffect(() => {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || '',
        component: 'Global',
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  });

  // Catch global errors
  window.addEventListener('error', (event) => {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Global Error: ${event.message}`,
        stack: event.error?.stack || '',
        component: event.filename || 'Unknown',
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {});
  });
}, []);
```

#### 1.2 Wrap All API Calls with Error Logging
**Action**: Create a universal fetch wrapper

**File**: `src/lib/apiClient.js` (NEW)
```javascript
/**
 * Wrapper around fetch that automatically logs errors
 */
export async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Log API error
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `API Error: ${data.error || 'Unknown error'}`,
          component: 'API Client',
          action: `${options.method || 'GET'} ${url}`,
          url: window.location.href,
          statusCode: response.status,
        }),
      }).catch(() => {});

      return { ok: false, error: data.error, status: response.status };
    }

    return { ok: true, data, status: response.status };
  } catch (error) {
    // Log network/fetch error
    await fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Network Error: ${error.message}`,
        stack: error.stack,
        component: 'API Client',
        action: `${options.method || 'GET'} ${url}`,
        url: window.location.href,
      }),
    }).catch(() => {});

    return { ok: false, error: error.message, status: 0 };
  }
}
```

### Phase 2: Database Error Logging (High Priority)

#### 2.1 Wrap All Supabase Queries
**Action**: Add error logging to ALL Supabase queries that don't already have it

**Pattern to add after every Supabase query**:
```javascript
if (error) {
  await logError({
    errorType: ErrorTypes.DATABASE_ERROR,
    errorMessage: error.message,
    errorDetails: error,
    endpoint: request?.url || 'Database Query',
    method: 'Supabase',
  });
  // Then return error response
}
```

#### 2.2 Check All API Routes
**Files to audit**:
- All files in `src/app/api/**/*.js`
- Check for Supabase queries without error logging

### Phase 3: Service-Specific Error Tracking (Medium Priority)

#### 3.1 Email Service Errors
**File**: `src/lib/emailService.js`
**Action**: Ensure all email sending failures are logged

```javascript
// After every sendEmail call that fails:
await logError({
  errorType: ErrorTypes.EMAIL_ERROR,
  errorMessage: 'Failed to send email',
  errorDetails: { to, subject, error: err.message },
  endpoint: 'Email Service',
});
```

#### 3.2 SMS Service Errors
**File**: `src/lib/smsService.js` (if exists)
**Action**: Log all SMS sending failures

#### 3.3 Rate Limiting Rejections
**File**: `src/lib/rateLimit.js`
**Action**: Log when rate limits are exceeded

```javascript
if (!allowed) {
  await logError({
    errorType: ErrorTypes.RATE_LIMIT_EXCEEDED,
    errorMessage: `Rate limit exceeded for ${identifier}`,
    endpoint: 'Rate Limiter',
  });
}
```

### Phase 4: Authentication Error Tracking (Medium Priority)

#### 4.1 Login Failures
**Files**: `src/app/api/auth/**/route.js`
**Action**: Log failed login attempts with IP and reason

#### 4.2 Session Validation Failures
**Action**: Log expired or invalid session attempts

#### 4.3 Permission Denied Errors
**Action**: Log unauthorized access attempts to admin routes

### Phase 5: Monitoring & Alerting (High Priority)

#### 5.1 Enhance Error Notification Email
**File**: `src/lib/logging.js`
**Current**: Basic email notification
**Enhancement needed**:
- Include error count in last hour
- Group similar errors
- Add direct link to admin error logs
- Include stack trace excerpt
- Add severity levels (CRITICAL, HIGH, MEDIUM, LOW)

#### 5.2 Error Aggregation Dashboard
**Action**: Enhance admin error logs tab to show:
- Error count by type (last hour, last day, last week)
- Most common errors
- Error rate graph
- Automatic critical error highlighting

### Phase 6: Production Monitoring (Medium Priority)

#### 6.1 Health Check Endpoint
**File**: `src/app/api/health/route.js` (NEW)
**Purpose**: Check all services are working

```javascript
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    email: await checkEmail(),
    sms: await checkSMS(),
  };

  const allHealthy = Object.values(checks).every(c => c.healthy);

  if (!allHealthy) {
    // Log unhealthy services
    await logError({
      errorType: ErrorTypes.HEALTH_CHECK_FAILED,
      errorDetails: checks,
    });
  }

  return NextResponse.json(checks);
}
```

#### 6.2 Automatic Error Detection
**Action**: Set up cron job to check for new critical errors every 5 minutes

## Error Severity Levels

### CRITICAL (Immediate notification)
- Database connection failures
- Authentication system down
- Email/SMS service completely down
- Payment processing errors
- Data corruption

### HIGH (Notify within 15 minutes)
- API endpoint returning 500 errors
- Multiple failed login attempts
- Rate limiting overwhelmed
- Form submissions failing

### MEDIUM (Notify daily digest)
- Individual email send failures
- Non-critical API errors
- Client-side component errors

### LOW (Log only)
- 404 errors
- Client-side validation errors
- Expected errors (wrong password, etc.)

## Implementation Priority

1. **Immediate (Today)**:
   - Global error handlers
   - Admin dashboard error logging (DONE)
   - API wrapper with error logging

2. **This Week**:
   - Audit all Supabase queries for error logging
   - Enhance error notification emails
   - Add severity levels

3. **Next Week**:
   - Service-specific error tracking
   - Health check endpoint
   - Error aggregation dashboard

## Testing Plan

### Test Scenarios
1. Force database error (wrong table name)
2. Force API error (invalid request)
3. Force network error (disconnect internet)
4. Force React error (throw in component)
5. Force unhandled promise rejection
6. Trigger rate limiting
7. Test failed email send
8. Test authentication failure
9. Test admin dashboard error

### Validation Checklist
- [ ] Error appears in error_logs table
- [ ] Superadmin receives email notification
- [ ] Error includes full stack trace
- [ ] Error includes user context (URL, action, etc.)
- [ ] Error is visible in admin dashboard
- [ ] Similar errors are grouped together
- [ ] No sensitive data (passwords, tokens) in logs

## Monitoring Dashboard

### Real-Time Metrics to Display
1. **Error Rate**: Errors per hour
2. **Error Types**: Breakdown by category
3. **Recent Errors**: Last 20 errors
4. **Top Errors**: Most frequent
5. **User Impact**: How many users affected
6. **Response Time**: Average API response time
7. **Health Status**: All services green/red

## Notification Rules

### Email Notifications
- **CRITICAL errors**: Immediate email to all superadmins
- **HIGH errors**: Email after 3 occurrences in 15 minutes
- **MEDIUM errors**: Daily digest
- **LOW errors**: No email, dashboard only

### SMS Notifications (Future)
- **CRITICAL only**: Database down, auth system down

## Security Considerations

### Never Log
- Passwords (plain or hashed)
- API keys or tokens
- Credit card numbers
- SSNs or personal IDs
- Session tokens

### Always Sanitize
- Email addresses (log domain only if needed)
- IP addresses (hash for privacy)
- User agent strings (truncate)
- File paths (remove user directories)

## Cost Considerations

### Supabase Storage
- Current: ~100 error logs/day
- Expected: ~500 error logs/day with full logging
- Storage: ~1MB/day
- Cost: Negligible (well within free tier)

### Email Notifications
- Current: ~5 emails/week
- Expected: ~20 emails/week
- Cost: Free (using Resend free tier)

## Success Metrics

- ✅ Zero undetected errors
- ✅ < 5 minute detection time for critical errors
- ✅ < 1 hour response time to critical issues
- ✅ 100% error logging coverage
- ✅ < 1% false positive rate
- ✅ All superadmins notified immediately

## Future Enhancements

1. **Integration with Sentry** - Professional error tracking
2. **Integration with Vercel Analytics** - Performance monitoring
3. **Integration with Supabase Dashboard** - Database query logging
4. **Custom alerting rules** - Per-user notification preferences
5. **Error replay** - Capture user session leading to error
6. **Automatic error resolution** - AI-suggested fixes

---

## Immediate Action Required

**Most Critical**: All database queries and API calls should have error logging. Let me audit the codebase and add missing error logging.
