/**
 * Comprehensive logging and audit module.
 * Handles audit logging, error tracking, user agent parsing, and superuser notifications.
 * Captures detailed request metadata including device info, IP, and user agent.
 *
 * @module logging
 */

import { getSupabase } from './supabase';
import { sendEmail } from './sendEmail';

/**
 * Determine device type from user agent string.
 * Categorizes into mobile, tablet, desktop, or unknown.
 *
 * @param {string} userAgent - User agent string from HTTP headers
 * @returns {string} Device type: 'mobile', 'tablet', 'desktop', or 'unknown'
 *
 * @example
 * const deviceType = getDeviceType(request.headers.get('user-agent'));
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
 * Parse user agent string to extract browser, OS, and device information.
 * Uses pattern matching to identify common browsers and operating systems.
 *
 * @param {string} userAgent - User agent string from HTTP headers
 * @returns {{browser: string, os: string, device: string}} Parsed user agent components
 *
 * @example
 * const ua = parseUserAgent(request.headers.get('user-agent'));
 * console.log(`${ua.browser} on ${ua.os} (${ua.device})`);
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
 * Extract comprehensive metadata from an HTTP request.
 * Captures IP address, user agent, request method, path, and parsed device info.
 *
 * @param {Request} request - HTTP request object
 * @returns {{ip: string, userAgent: string, method: string, path: string, browser: string, os: string, device: string}} Request metadata
 *
 * @example
 * const meta = getRequestMeta(request);
 * console.log(`${meta.method} ${meta.path} from ${meta.ip}`);
 */
export function getRequestMeta(request) {
  const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
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
 * Sanitize request body by redacting sensitive fields.
 * Removes passwords, tokens, codes, and other secrets before logging.
 *
 * @private
 * @param {Object} body - Request body object to sanitize
 * @returns {Object|null} Sanitized copy with sensitive fields redacted
 */
function sanitizeBody(body) {
  if (!body) return null;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'password_hash', 'confirmPassword', 'token', 'code', 'secret'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  return sanitized;
}

/**
 * Log a comprehensive audit event to the database.
 * Records user actions with full context including device info, IP, and request details.
 * Automatically enriches details with parsed device information.
 *
 * @param {Object} params - Audit event parameters
 * @param {string} params.eventType - Type of event (use AuditEvents constants)
 * @param {string} [params.supporterId=null] - ID of supporter performing action
 * @param {string} [params.targetId=null] - ID of affected resource
 * @param {string} [params.targetType=null] - Type of affected resource (e.g., 'poll', 'comment')
 * @param {Object} [params.oldValues=null] - Previous state for update operations
 * @param {Object} [params.newValues=null] - New state for update operations
 * @param {Object} [params.details=null] - Additional event-specific details
 * @param {Request} [params.request=null] - HTTP request object for metadata extraction
 * @param {number} [params.responseStatus=null] - HTTP response status code
 * @param {Object} [params.requestBody=null] - Request body (will be sanitized)
 * @param {string} [params.sessionId=null] - Session ID if applicable
 * @returns {Promise<void>}
 *
 * @example
 * await logAudit({
 *   eventType: AuditEvents.POLL_VOTE,
 *   supporterId: supporter.id,
 *   targetId: poll.id,
 *   targetType: 'poll',
 *   details: { option_id: selectedOption.id },
 *   request,
 *   responseStatus: 200
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

    const { error } = await supabase
      .from('audit_logs')
      .insert({
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
      });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Audit logging error:', err);
  }
}

/**
 * Log an error to the database and optionally notify superusers.
 * Automatically deduplicates errors by message and endpoint, tracking occurrence count.
 * Enriches error data with device info and request metadata.
 *
 * @param {Object} params - Error logging parameters
 * @param {string} params.errorType - Type of error (use ErrorTypes constants)
 * @param {string} params.errorMessage - Error message
 * @param {string} [params.errorStack=null] - Error stack trace
 * @param {string} [params.endpoint=null] - API endpoint where error occurred
 * @param {string} [params.method=null] - HTTP method (GET, POST, etc.)
 * @param {Object} [params.requestBody=null] - Request body (will be sanitized)
 * @param {string} [params.userId=null] - ID of user who encountered error
 * @param {string} [params.userEmail=null] - Email of user who encountered error
 * @param {Request} [params.request=null] - HTTP request object for metadata extraction
 * @param {boolean} [params.notifySuperusers=true] - Whether to email superusers about the error
 * @returns {Promise<string|null>} Error log ID if successful, null on failure
 *
 * @example
 * try {
 *   // ... operation
 * } catch (err) {
 *   await logError({
 *     errorType: ErrorTypes.DATABASE_ERROR,
 *     errorMessage: err.message,
 *     errorStack: err.stack,
 *     endpoint: '/api/polls/vote',
 *     userId: supporter?.id,
 *     request
 *   });
 * }
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
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to log error:', error);
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
    console.error('Error logging error:', err);
    return null;
  }
}

/**
 * Send email notifications to all superusers about a new error.
 * Includes error details, device info, and affected user information.
 *
 * @private
 * @param {Object} params - Notification parameters
 * @param {string} params.errorId - ID of the error log entry
 * @param {string} params.errorType - Type of error
 * @param {string} params.errorMessage - Error message
 * @param {string} params.endpoint - API endpoint where error occurred
 * @param {string} params.userEmail - Email of affected user
 * @param {Object} params.deviceInfo - Device information object
 * @returns {Promise<void>}
 */
async function notifySuperusersOfError({ errorId, errorType, errorMessage, endpoint, userEmail, deviceInfo }) {
  try {
    const supabase = getSupabase();

    // Get superusers
    const { data: superusers } = await supabase
      .from('supporters')
      .select('email, first_name')
      .eq('role', 'super_admin')
      .eq('status', 'approved')
      .eq('email_consent', true);

    if (!superusers || superusers.length === 0) {
      console.log('No superusers to notify');
      return;
    }

    const deviceStr = deviceInfo
      ? `${deviceInfo.type} / ${deviceInfo.browser} / ${deviceInfo.os}`
      : 'Unknown';

    const subject = `[Error Alert] ${errorType}: ${errorMessage.substring(0, 50)}...`;
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

    for (const superuser of superusers) {
      try {
        await sendEmail(superuser.email, subject, body);
      } catch (err) {
        console.error(`Failed to notify ${superuser.email}:`, err);
      }
    }

    // Mark as notified
    await supabase
      .from('error_logs')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', errorId);

  } catch (err) {
    console.error('Failed to notify superusers:', err);
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
