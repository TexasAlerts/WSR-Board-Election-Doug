/**
 * Logging and Audit Module
 *
 * Comprehensive logging system for security audits and error tracking.
 *
 * Features:
 * - Audit logging for security-relevant events
 * - Error logging with auto-deduplication
 * - User agent parsing (browser, OS, device type)
 * - Request metadata extraction
 * - Automatic superuser notifications for errors
 * - Sanitization of sensitive data
 * - Error severity levels (critical, high, medium, low)
 * - Correlation IDs for request tracing
 * - Latency tracking for performance analysis
 * - Visitor session linking for session reconstruction
 *
 * All logs are stored in Supabase with full context including:
 * - IP address and user agent
 * - Browser, OS, and device type
 * - Request method and path
 * - Sanitized request body
 * - Response status
 * - Correlation ID and visitor session ID
 */

import { getSupabase } from './supabase';
import { sendEmail } from './sendEmail';
import { sendErrorAlertSMS } from './smsService';
import crypto from 'crypto';

/**
 * Error severity levels for prioritization
 */
export const Severity = {
  CRITICAL: 'critical', // System down, data loss, security breach
  HIGH: 'high',         // Major feature broken, affecting many users
  MEDIUM: 'medium',     // Feature degraded, workaround available
  LOW: 'low',           // Minor issue, cosmetic, edge case
};

/**
 * Generate a correlation ID for request tracing
 * Use at the start of a request and pass through all logging calls
 */
export function generateCorrelationId() {
  return crypto.randomUUID();
}

/**
 * Parse user agent to determine device type
 *
 * Detects mobile, tablet, or desktop based on user agent string.
 * Tablets are checked first as some report as "mobile".
 *
 * @param {string} userAgent - Browser user agent string
 * @returns {'mobile'|'tablet'|'desktop'|'unknown'} Device type
 *
 * @example
 * getDeviceType('Mozilla/5.0 (iPhone...)') // 'mobile'
 * getDeviceType('Mozilla/5.0 (iPad...)') // 'tablet'
 * getDeviceType('Mozilla/5.0 (Windows NT...)') // 'desktop'
 */
export function getDeviceType(userAgent) {
  if (!userAgent || userAgent === 'unknown') return 'unknown';

  const ua = userAgent.toLowerCase();

  // Check for tablets first (before mobile, as some tablets report as mobile)
  if (
    /ipad/.test(ua) ||
    (/android/.test(ua) && !/mobile/.test(ua)) ||
    /tablet/.test(ua) ||
    /kindle/.test(ua) ||
    /silk/.test(ua) ||
    /playbook/.test(ua)
  ) {
    return 'tablet';
  }

  // Check for mobile devices
  if (
    /mobile/.test(ua) ||
    /iphone/.test(ua) ||
    /ipod/.test(ua) ||
    /android/.test(ua) ||
    /blackberry/.test(ua) ||
    /opera mini/.test(ua) ||
    /iemobile/.test(ua) ||
    /wpdesktop/.test(ua) ||
    /windows phone/.test(ua)
  ) {
    return 'mobile';
  }

  // Default to desktop
  return 'desktop';
}

/**
 * Parse user agent to extract browser, OS, and device information
 *
 * Performs pattern matching on the user agent string to identify:
 * - Browser: Chrome, Safari, Firefox, Edge, Opera, IE
 * - OS: Windows, macOS, iOS, Android, Linux
 * - Device type: mobile, tablet, desktop
 *
 * @param {string} userAgent - Browser user agent string
 * @returns {Object} Parsed user agent info
 * @returns {string} returns.browser - Browser name or 'unknown'
 * @returns {string} returns.os - Operating system or 'unknown'
 * @returns {string} returns.device - Device type: 'mobile'|'tablet'|'desktop'|'unknown'
 *
 * @example
 * parseUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
 * // { browser: 'Chrome', os: 'macOS', device: 'desktop' }
 */
export function parseUserAgent(userAgent) {
  if (!userAgent || userAgent === 'unknown') {
    return { browser: 'unknown', os: 'unknown', device: 'unknown' };
  }

  const ua = userAgent.toLowerCase();
  let browser = 'unknown';
  let os = 'unknown';

  // Detect browser
  if (/edg/.test(ua)) browser = 'Edge';
  else if (/chrome/.test(ua) && !/chromium/.test(ua)) browser = 'Chrome';
  else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = 'Safari';
  else if (/firefox/.test(ua)) browser = 'Firefox';
  else if (/opera|opr/.test(ua)) browser = 'Opera';
  else if (/msie|trident/.test(ua)) browser = 'IE';

  // Detect OS
  if (/windows/.test(ua)) os = 'Windows';
  else if (/macintosh|mac os/.test(ua)) os = 'macOS';
  else if (/iphone|ipad|ipod/.test(ua)) os = 'iOS';
  else if (/android/.test(ua)) os = 'Android';
  else if (/linux/.test(ua)) os = 'Linux';

  return {
    browser,
    os,
    device: getDeviceType(userAgent),
  };
}

/**
 * Extract comprehensive metadata from a request
 *
 * Parses request headers and URL to extract:
 * - Client IP address (from x-forwarded-for or x-real-ip)
 * - User agent string
 * - HTTP method
 * - Request path
 * - Browser name
 * - Operating system
 * - Device type
 *
 * @param {Request} request - The incoming HTTP request object
 * @returns {Object} Request metadata
 * @returns {string} returns.ip - Client IP address
 * @returns {string} returns.userAgent - User agent string
 * @returns {string} returns.method - HTTP method (GET, POST, etc.)
 * @returns {string} returns.path - Request path
 * @returns {string} returns.browser - Browser name
 * @returns {string} returns.os - Operating system
 * @returns {string} returns.device - Device type
 *
 * @example
 * const meta = getRequestMeta(request);
 * // {
 * //   ip: '192.168.1.1',
 * //   userAgent: 'Mozilla/5.0...',
 * //   method: 'POST',
 * //   path: '/api/polls',
 * //   browser: 'Chrome',
 * //   os: 'Windows',
 * //   device: 'desktop'
 * // }
 */
export function getRequestMeta(request) {
  const ip =
    request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request?.headers?.get('x-real-ip') ||
    'unknown';
  const userAgent = request?.headers?.get('user-agent') || 'unknown';
  const method = request?.method || 'unknown';
  const url = request?.url ? new URL(request.url) : null;
  const path = url?.pathname || 'unknown';
  const { browser, os, device } = parseUserAgent(userAgent);

  return { ip, userAgent, method, path, browser, os, device };
}

/**
 * Sanitize request body by removing sensitive fields
 *
 * Replaces sensitive data with '[REDACTED]' to prevent logging:
 * - Passwords
 * - Tokens
 * - Secret keys
 * - Verification codes
 *
 * Creates a shallow copy to avoid mutating the original object.
 *
 * @param {Object} body - The request body object
 * @returns {Object} Sanitized copy of the body
 *
 * @example
 * sanitizeBody({ email: 'user@example.com', password: 'secret123' })
 * // { email: 'user@example.com', password: '[REDACTED]' }
 */
function sanitizeBody(body) {
  if (!body) return null;
  const sanitized = { ...body };
  const sensitiveFields = [
    'password',
    'password_hash',
    'confirmPassword',
    'token',
    'code',
    'secret',
  ];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  return sanitized;
}

/**
 * Log a security audit event with full context
 *
 * Creates a comprehensive audit log entry in the database with:
 * - Event type (from AuditEvents constants)
 * - User information (supporter ID)
 * - Target information (what was affected)
 * - Before/after values for updates
 * - Request metadata (IP, user agent, browser, OS, device)
 * - Sanitized request body
 * - Response status
 *
 * All request bodies are sanitized to remove passwords and tokens.
 * Device info is automatically extracted from user agent.
 *
 * @param {Object} params - Audit log parameters
 * @param {string} params.eventType - Event type (use AuditEvents constants)
 * @param {string} [params.supporterId=null] - ID of the user performing action
 * @param {string} [params.targetId=null] - ID of the affected resource
 * @param {string} [params.targetType=null] - Type of affected resource
 * @param {Object} [params.oldValues=null] - Previous values (for updates)
 * @param {Object} [params.newValues=null] - New values (for updates)
 * @param {Object} [params.details=null] - Additional event details
 * @param {Request} [params.request=null] - HTTP request object (for metadata)
 * @param {number} [params.responseStatus=null] - HTTP response status code
 * @param {Object} [params.requestBody=null] - Request body (will be sanitized)
 * @param {string} [params.sessionId=null] - Auth session ID if available
 * @param {string} [params.visitorSessionId=null] - Visitor session ID for session reconstruction
 * @param {string} [params.correlationId=null] - Correlation ID for request tracing
 * @returns {Promise<void>}
 *
 * @example
 * await logAudit({
 *   eventType: AuditEvents.LOGIN_SUCCESS,
 *   supporterId: supporter.id,
 *   details: { email: supporter.email, role: supporter.role },
 *   request,
 *   responseStatus: 200,
 *   correlationId: generateCorrelationId(),
 * });
 *
 * @example
 * await logAudit({
 *   eventType: AuditEvents.SUPPORTER_ROLE_CHANGED,
 *   supporterId: adminId,
 *   targetId: userId,
 *   targetType: 'supporter',
 *   oldValues: { role: 'supporter' },
 *   newValues: { role: 'admin' },
 *   request,
 *   responseStatus: 200,
 *   visitorSessionId,
 *   correlationId,
 * });
 */
export async function logAudit({
  eventType,
  supporterId = null,
  targetId = null,
  targetType = null,
  oldValues = null,
  newValues = null,
  details = null,
  request = null,
  responseStatus = null,
  requestBody = null,
  sessionId = null,
  visitorSessionId = null,
  correlationId = null,
}) {
  try {
    const supabase = getSupabase();
    const meta = request ? getRequestMeta(request) : {};

    // Merge device info into details
    const enrichedDetails = {
      ...details,
      _device: {
        type: meta.device || 'unknown',
        browser: meta.browser || 'unknown',
        os: meta.os || 'unknown',
      },
    };

    const { error } = await supabase.from('audit_logs').insert({
      supporter_id: supporterId,
      event_type: eventType,
      target_id: targetId,
      target_type: targetType,
      old_values: oldValues,
      new_values: newValues,
      details: JSON.stringify(enrichedDetails),
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      request_method: meta.method,
      request_path: meta.path,
      request_body: requestBody ? sanitizeBody(requestBody) : null,
      response_status: responseStatus,
      session_id: sessionId,
      visitor_session_id: visitorSessionId,
      correlation_id: correlationId,
    });

    if (error && process.env.NODE_ENV === 'development') {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Audit logging error:', err);
    }
  }
}

/**
 * Log an error and optionally notify superusers
 *
 * Creates an error log entry with auto-deduplication:
 * - If same error exists with status 'new', increments occurrence_count
 * - Otherwise, creates new error log entry
 * - Optionally emails superusers about new errors
 *
 * All errors include:
 * - Error type and message
 * - Stack trace
 * - Endpoint and HTTP method
 * - User information (if available)
 * - Request metadata (IP, user agent, browser, OS, device)
 * - Sanitized request body
 *
 * @param {Object} params - Error log parameters
 * @param {string} params.errorType - Error type (use ErrorTypes constants)
 * @param {string} params.errorMessage - Human-readable error message
 * @param {string} [params.errorStack=null] - Stack trace
 * @param {string} [params.endpoint=null] - API endpoint or page URL
 * @param {string} [params.method=null] - HTTP method
 * @param {Object} [params.requestBody=null] - Request body (will be sanitized)
 * @param {string} [params.userId=null] - User ID if available
 * @param {string} [params.userEmail=null] - User email if available
 * @param {Request} [params.request=null] - HTTP request object
 * @param {boolean} [params.notifySuperusers=true] - Send email to superusers
 * @param {string} [params.severity='medium'] - Error severity (use Severity constants)
 * @param {string} [params.correlationId=null] - Correlation ID for request tracing
 * @param {number} [params.latencyMs=null] - Request latency in milliseconds
 * @param {string} [params.visitorSessionId=null] - Visitor session ID for session reconstruction
 * @returns {Promise<string|null>} Error log ID or null if logging failed
 *
 * @example
 * await logError({
 *   errorType: ErrorTypes.API_ERROR,
 *   errorMessage: 'Failed to fetch user data',
 *   errorStack: err.stack,
 *   endpoint: '/api/users',
 *   method: 'GET',
 *   request,
 *   severity: Severity.HIGH,
 *   correlationId: generateCorrelationId(),
 * });
 *
 * @example
 * await logError({
 *   errorType: ErrorTypes.DATABASE_ERROR,
 *   errorMessage: 'Query timeout',
 *   endpoint: '/api/polls',
 *   userId: supporter.id,
 *   userEmail: supporter.email,
 *   request,
 *   notifySuperusers: true,
 *   severity: Severity.CRITICAL,
 *   latencyMs: 30000,
 *   visitorSessionId,
 * });
 */
export async function logError({
  errorType,
  errorMessage,
  errorStack = null,
  endpoint = null,
  method = null,
  requestBody = null,
  userId = null,
  userEmail = null,
  request = null,
  notifySuperusers = true,
  severity = 'medium',
  correlationId = null,
  latencyMs = null,
  visitorSessionId = null,
}) {
  try {
    const supabase = getSupabase();
    const meta = request ? getRequestMeta(request) : {};

    // Build device info for storage
    const deviceInfo = {
      type: meta.device || 'unknown',
      browser: meta.browser || 'unknown',
      os: meta.os || 'unknown',
    };

    // Check if this error already exists (by message and endpoint)
    const { data: existing } = await supabase
      .from('error_logs')
      .select('id, occurrence_count')
      .eq('error_message', errorMessage)
      .eq('endpoint', endpoint || meta.path)
      .eq('status', 'new')
      .single();

    if (existing) {
      // Update existing error with new occurrence
      await supabase
        .from('error_logs')
        .update({
          occurrence_count: existing.occurrence_count + 1,
          last_occurred_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      return existing.id;
    }

    // Insert new error with device info in request_body
    const enrichedRequestBody = {
      ...(requestBody ? sanitizeBody(requestBody) : {}),
      _device: deviceInfo,
    };

    const { data: newError, error } = await supabase
      .from('error_logs')
      .insert({
        error_type: errorType,
        error_message: errorMessage,
        error_stack: errorStack,
        endpoint: endpoint || meta.path,
        method: method || meta.method,
        request_body: enrichedRequestBody,
        user_id: userId,
        user_email: userEmail,
        ip_address: meta.ip,
        user_agent: meta.userAgent,
        severity,
        correlation_id: correlationId,
        latency_ms: latencyMs,
        visitor_session_id: visitorSessionId,
      })
      .select('id')
      .single();

    if (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to log error:', error);
      }
      return null;
    }

    // Notify superusers with device info
    if (notifySuperusers) {
      await notifySuperusersOfError({
        errorId: newError.id,
        errorType,
        errorMessage,
        endpoint: endpoint || meta.path,
        userEmail,
        deviceInfo,
      });
    }

    return newError.id;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logging error:', err);
    }
    return null;
  }
}

/**
 * Notify superusers and admins of a new error via email and SMS
 */
async function notifySuperusersOfError({
  errorId,
  errorType,
  errorMessage,
  endpoint,
  userEmail,
  deviceInfo,
}) {
  try {
    const supabase = getSupabase();

    // Get all admins and super_admins for notifications
    const { data: admins } = await supabase
      .from('supporters')
      .select('email, phone, first_name, role, sms_consent')
      .in('role', ['admin', 'super_admin'])
      .eq('status', 'approved');

    if (!admins || admins.length === 0) {
      return;
    }

    const deviceStr = deviceInfo
      ? `${deviceInfo.type} / ${deviceInfo.browser} / ${deviceInfo.os}`
      : 'Unknown';

    const subject = `[Error Alert] ${errorType}: ${(errorMessage || '').substring(0, 50)}...`;
    const body = `
A new error has occurred on the campaign website:

Error ID: ${errorId}
Type: ${errorType}
Endpoint: ${endpoint}
Message: ${errorMessage}
User: ${userEmail || 'Anonymous'}
Device: ${deviceStr}
Time: ${new Date().toLocaleString()}

Please review and resolve this error in the admin dashboard.
    `.trim();

    const errorDetails = {
      errorType,
      errorMessage,
      endpoint,
    };

    for (const admin of admins) {
      // Send email notification
      try {
        await sendEmail(admin.email, subject, body);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Failed to email ${admin.email}:`, err);
        }
      }

      // Send SMS notification if admin has phone and SMS consent
      if (admin.phone && admin.sms_consent) {
        try {
          await sendErrorAlertSMS(admin.phone, errorDetails);
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            console.error(`Failed to SMS ${admin.phone}:`, err);
          }
        }
      }
    }

    // Mark as notified
    await supabase
      .from('error_logs')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', errorId);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to notify admins:', err);
    }
  }
}

/**
 * Common audit event types
 */
export const AuditEvents = {
  // Auth events
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  EMAIL_VERIFIED: 'EMAIL_VERIFIED',
  PHONE_VERIFIED: 'PHONE_VERIFIED',
  PHONE_VERIFICATION_SKIPPED: 'PHONE_VERIFICATION_SKIPPED',
  PHONE_UPDATED: 'PHONE_UPDATED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  SMS_OPT_OUT: 'SMS_OPT_OUT',
  SMS_OPT_IN: 'SMS_OPT_IN',
  PASSWORD_CREATED: 'PASSWORD_CREATED',
  PASSWORD_RESET: 'PASSWORD_RESET',

  // Admin events
  SUPPORTER_APPROVED: 'SUPPORTER_APPROVED',
  SUPPORTER_SUSPENDED: 'SUPPORTER_SUSPENDED',
  SUPPORTER_DELETED: 'SUPPORTER_DELETED',
  SUPPORTER_ROLE_CHANGED: 'SUPPORTER_ROLE_CHANGED',
  COMMENT_APPROVED: 'COMMENT_APPROVED',
  COMMENT_REJECTED: 'COMMENT_REJECTED',
  BROADCAST_SENT: 'BROADCAST_SENT',

  // Voter events
  VOTER_VERIFIED: 'VOTER_VERIFIED',
  VOTER_SUSPENDED: 'VOTER_SUSPENDED',
  VOTER_UNSUSPENDED: 'VOTER_UNSUSPENDED',
  VOTER_DELETED: 'VOTER_DELETED',

  // User events
  POLL_VOTE: 'POLL_VOTE',
  IDEA_VOTE: 'IDEA_VOTE',
  COMMENT_VOTE: 'COMMENT_VOTE',
  COMMENT_CREATED: 'COMMENT_CREATED',
  REPLY_CREATED: 'REPLY_CREATED',
  IDEA_CREATED: 'IDEA_CREATED',
  ENDORSEMENT_SUBMITTED: 'ENDORSEMENT_SUBMITTED',
  INTEREST_SUBMITTED: 'INTEREST_SUBMITTED',

  // Content events
  POLL_CREATED: 'POLL_CREATED',
  POLL_UPDATED: 'POLL_UPDATED',
  POLL_CLOSED: 'POLL_CLOSED',
  POLL_DELETED: 'POLL_DELETED',
  IDEA_STATUS_CHANGED: 'IDEA_STATUS_CHANGED',
  IDEA_APPROVED: 'IDEA_APPROVED',
  IDEA_REJECTED: 'IDEA_REJECTED',
  ENDORSEMENT_APPROVED: 'ENDORSEMENT_APPROVED',
  ENDORSEMENT_REJECTED: 'ENDORSEMENT_REJECTED',

  // Admin events
  ERROR_STATUS_UPDATED: 'ERROR_STATUS_UPDATED',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
};

/**
 * Error types
 */
export const ErrorTypes = {
  API_ERROR: 'api_error',
  CLIENT_ERROR: 'client_error',
  SERVER_ERROR: 'server_error',
  VALIDATION_ERROR: 'validation_error',
  AUTH_ERROR: 'auth_error',
  DATABASE_ERROR: 'database_error',
  EXTERNAL_SERVICE: 'external_service',
};
