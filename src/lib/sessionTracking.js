/**
 * Session Tracking Module
 *
 * Tracks visitor sessions for both anonymous and authenticated users.
 * Enables session reconstruction ("What did this visitor do before the error?")
 *
 * Features:
 * - Anonymous session tracking via cookie
 * - Privacy-respecting fingerprinting (hashed IP+UA)
 * - Activity logging for session timeline
 * - 30-minute session timeout
 * - UTM parameter capture for campaign attribution
 */

import { getSupabase } from './supabase';
import { parseUserAgent, getRequestMeta } from './logging';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'vs_id';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Activity types for session tracking
 */
export const ActivityTypes = {
  PAGE_VIEW: 'page_view',
  POLL_VOTE: 'poll_vote',
  IDEA_SUPPORT: 'idea_support',
  IDEA_CREATE: 'idea_create',
  COMMENT_CREATE: 'comment_create',
  DONATION_PAGE: 'donation_page',
  DONATION_AMOUNT: 'donation_amount',
  DONATION_CLICK: 'donation_click',
  FORM_SUBMIT: 'form_submit',
  LOGIN: 'login',
  REGISTER: 'register',
  ERROR: 'error',
  API_CALL: 'api_call',
};

/**
 * Generate a unique session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a privacy-respecting fingerprint from IP and User Agent
 * Uses SHA-256 hash so original values cannot be recovered
 */
function createAnonymousFingerprint(ip, userAgent) {
  const data = `${ip || 'unknown'}:${userAgent || 'unknown'}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
}

/**
 * Generate a correlation ID for request tracing
 */
export function generateCorrelationId() {
  return crypto.randomUUID();
}

/**
 * Get or create a visitor session
 *
 * Checks for existing session cookie, validates it's still active,
 * and creates a new session if needed.
 *
 * @param {Request} request - The HTTP request
 * @param {string|null} supporterId - Authenticated supporter ID (if logged in)
 * @returns {Promise<{sessionId: string, isNew: boolean}>}
 */
export async function getOrCreateVisitorSession(request, supporterId = null) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return { sessionId: null, isNew: false };
    }

    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Check if existing session is still valid
    if (existingSessionId) {
      const { data: existingSession } = await supabase
        .from('visitor_sessions')
        .select('id, last_activity_at, supporter_id')
        .eq('id', existingSessionId)
        .single();

      if (existingSession) {
        const lastActivity = new Date(existingSession.last_activity_at);
        const now = new Date();

        // Session is still valid (within timeout)
        if (now - lastActivity < SESSION_TIMEOUT_MS) {
          // Update last activity and supporter link if needed
          const updates = { last_activity_at: now.toISOString() };
          if (supporterId && !existingSession.supporter_id) {
            updates.supporter_id = supporterId;
          }

          await supabase
            .from('visitor_sessions')
            .update(updates)
            .eq('id', existingSessionId);

          return { sessionId: existingSessionId, isNew: false };
        }

        // Session timed out - mark it as ended
        await supabase
          .from('visitor_sessions')
          .update({ ended_at: now.toISOString() })
          .eq('id', existingSessionId);
      }
    }

    // Create new session
    const meta = getRequestMeta(request);
    const { browser, os, device } = parseUserAgent(meta.userAgent);
    const url = new URL(request.url);
    const sessionToken = generateSessionToken();

    const sessionData = {
      supporter_id: supporterId,
      anonymous_token: sessionToken,
      anonymous_fingerprint: createAnonymousFingerprint(meta.ip, meta.userAgent),
      ip_address: meta.ip,
      user_agent: meta.userAgent,
      device_type: device,
      browser,
      os,
      entry_url: url.pathname,
      referrer: request.headers.get('referer') || null,
      utm_source: url.searchParams.get('utm_source') || null,
      utm_medium: url.searchParams.get('utm_medium') || null,
      utm_campaign: url.searchParams.get('utm_campaign') || null,
    };

    const { data: newSession, error } = await supabase
      .from('visitor_sessions')
      .insert(sessionData)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create visitor session:', error);
      return { sessionId: null, isNew: false };
    }

    // Set session cookie (will be read by middleware or next request)
    // Note: This sets the cookie for the response
    cookieStore.set(SESSION_COOKIE_NAME, newSession.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days (cookie persists, session timeout is 30 min)
      path: '/',
    });

    return { sessionId: newSession.id, isNew: true };
  } catch (err) {
    console.error('Session tracking error:', err);
    return { sessionId: null, isNew: false };
  }
}

/**
 * Log a session activity
 *
 * Records an action within a visitor's session for timeline reconstruction.
 *
 * @param {Object} params - Activity parameters
 * @param {string} params.visitorSessionId - The visitor session ID
 * @param {string} params.activityType - Type from ActivityTypes
 * @param {string} [params.activitySubtype] - Additional classification
 * @param {string} [params.targetType] - Type of target entity
 * @param {string} [params.targetId] - ID of target entity
 * @param {string} [params.targetName] - Human-readable name
 * @param {string} [params.pageUrl] - Current page URL
 * @param {string} [params.pageTitle] - Current page title
 * @param {string} [params.correlationId] - Request correlation ID
 * @param {string} [params.requestMethod] - HTTP method
 * @param {string} [params.requestPath] - Request path
 * @param {number} [params.responseStatus] - HTTP response status
 * @param {number} [params.latencyMs] - Request latency in milliseconds
 * @param {Object} [params.details] - Additional details
 */
export async function logSessionActivity({
  visitorSessionId,
  activityType,
  activitySubtype = null,
  targetType = null,
  targetId = null,
  targetName = null,
  pageUrl = null,
  pageTitle = null,
  correlationId = null,
  requestMethod = null,
  requestPath = null,
  responseStatus = null,
  latencyMs = null,
  details = null,
}) {
  try {
    if (!visitorSessionId) return;

    const supabase = getSupabase();
    if (!supabase) return;

    await supabase.from('session_activities').insert({
      visitor_session_id: visitorSessionId,
      activity_type: activityType,
      activity_subtype: activitySubtype,
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      page_url: pageUrl,
      page_title: pageTitle,
      correlation_id: correlationId,
      request_method: requestMethod,
      request_path: requestPath,
      response_status: responseStatus,
      latency_ms: latencyMs,
      details: details ? JSON.stringify(details) : null,
    });

    // Increment session stats
    const isPageView = activityType === ActivityTypes.PAGE_VIEW;
    await supabase.rpc('increment_session_stats', {
      p_session_id: visitorSessionId,
      p_is_page_view: isPageView,
    });
  } catch (err) {
    console.error('Failed to log session activity:', err);
  }
}

/**
 * Get session reconstruction data for admin debugging
 *
 * Returns the full timeline of a visitor's session including
 * all page views, actions, and errors.
 *
 * @param {string} sessionId - The visitor session ID
 * @returns {Promise<Object>} Session data with activities
 */
export async function getSessionReconstruction(sessionId) {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    // Get session info
    const { data: session, error: sessionError } = await supabase
      .from('visitor_sessions')
      .select(`
        *,
        supporter:supporters(id, first_name, last_name, email)
      `)
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return null;
    }

    // Get all activities for this session
    const { data: activities } = await supabase
      .from('session_activities')
      .select('*')
      .eq('visitor_session_id', sessionId)
      .order('created_at', { ascending: true });

    // Get related error logs
    const { data: errors } = await supabase
      .from('error_logs')
      .select('id, error_type, error_message, severity, created_at')
      .eq('visitor_session_id', sessionId)
      .order('created_at', { ascending: true });

    // Get related audit logs
    const { data: auditLogs } = await supabase
      .from('audit_logs')
      .select('id, event_type, details, created_at')
      .eq('visitor_session_id', sessionId)
      .order('created_at', { ascending: true });

    return {
      session,
      activities: activities || [],
      errors: errors || [],
      auditLogs: auditLogs || [],
      timeline: mergeTimeline(activities, errors, auditLogs),
    };
  } catch (err) {
    console.error('Failed to get session reconstruction:', err);
    return null;
  }
}

/**
 * Merge activities, errors, and audit logs into a single timeline
 */
function mergeTimeline(activities, errors, auditLogs) {
  const timeline = [];

  // Add activities
  (activities || []).forEach((a) => {
    timeline.push({
      type: 'activity',
      subtype: a.activity_type,
      timestamp: a.created_at,
      data: a,
    });
  });

  // Add errors
  (errors || []).forEach((e) => {
    timeline.push({
      type: 'error',
      subtype: e.error_type,
      timestamp: e.created_at,
      data: e,
    });
  });

  // Add audit logs
  (auditLogs || []).forEach((a) => {
    timeline.push({
      type: 'audit',
      subtype: a.event_type,
      timestamp: a.created_at,
      data: a,
    });
  });

  // Sort by timestamp
  timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return timeline;
}

/**
 * Get visitor session ID from cookie (for client-side use)
 */
export async function getVisitorSessionId() {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Link a session to a supporter when they log in
 */
export async function linkSessionToSupporter(sessionId, supporterId) {
  try {
    const supabase = getSupabase();
    if (!supabase || !sessionId || !supporterId) return;

    await supabase
      .from('visitor_sessions')
      .update({ supporter_id: supporterId })
      .eq('id', sessionId);
  } catch (err) {
    console.error('Failed to link session to supporter:', err);
  }
}
