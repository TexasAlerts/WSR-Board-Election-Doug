import { NextResponse } from 'next/server';
import { logError, ErrorTypes, Severity } from '../../../lib/logging';
import { rateLimit } from '../../../lib/rateLimit';
import { cookies } from 'next/headers';
import { getSupabase } from '../../../lib/supabase';
import { getVisitorSessionId } from '../../../lib/sessionTracking';

/**
 * POST /api/errors
 * Public endpoint for client-side error reporting
 *
 * Enhanced to capture:
 * - Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
 * - Visitor journey context (recent interactions, navigation history)
 * - Performance metrics (navigation timing, slow resources)
 * - Device and browser capabilities
 * - Network conditions
 * - Error severity
 *
 * Accepts:
 * - error_type: Type of error (client_error, api_error, validation_error, performance)
 * - error_message: Human-readable error message
 * - error_stack: Stack trace if available
 * - endpoint: Page URL or API endpoint where error occurred
 * - context: JSON string with comprehensive context (performance, journey, etc.)
 * - component: React component name if applicable
 * - severity: Error severity (critical, high, medium, low)
 */
export async function POST(request) {
  // Rate limit: 20 error reports per minute per IP (increased for performance logging)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!(await rateLimit(`errors:${ip}`, 20, 60000))) {
    return NextResponse.json({ ok: false, error: 'Too many error reports' }, { status: 429 });
  }

  try {
    const body = await request.json();

    // Support both old format (category, message) and new format (error_type, error_message)
    const errorType =
      body.error_type || (body.category === 'client' ? 'client_error' : ErrorTypes.CLIENT_ERROR);
    const errorMessage = body.error_message || body.message;
    const errorStack = body.error_stack || body.stack;
    const endpoint = body.endpoint || body.url;
    const component = body.component || null;

    // Parse context (may be a string or object)
    let parsedContext = null;
    if (body.context) {
      try {
        parsedContext = typeof body.context === 'string' ? JSON.parse(body.context) : body.context;
      } catch {
        parsedContext = { rawContext: body.context };
      }
    } else if (body.component_stack) {
      parsedContext = { componentStack: body.component_stack };
    }

    // Determine severity from body or context
    const severity =
      body.severity ||
      parsedContext?.severity ||
      determineSeverityFromContext(errorType, errorMessage, parsedContext);

    // Basic validation
    if (!errorMessage) {
      return NextResponse.json({ ok: false, error: 'Error message is required' }, { status: 400 });
    }

    // Get user info from session if available (don't require auth)
    let userEmail = null;
    let userId = null;
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session_token');
      if (sessionCookie?.value) {
        const supabase = getSupabase();
        if (!supabase) {
          return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
        }
        const { data: session } = await supabase
          .from('sessions')
          .select('supporter_id')
          .eq('token', sessionCookie.value)
          .gt('expires_at', new Date().toISOString())
          .single();
        if (session?.supporter_id) {
          userId = session.supporter_id;
          const { data: supporter } = await supabase
            .from('supporters')
            .select('email')
            .eq('id', session.supporter_id)
            .single();
          userEmail = supporter?.email || null;
        }
      }
    } catch {
      // Session lookup failed, continue without user info
    }

    // Get visitor session ID for session reconstruction
    let visitorSessionId = null;
    try {
      visitorSessionId = await getVisitorSessionId();
    } catch {
      // Visitor session not available
    }

    // Extract performance data from context for logging
    const performanceData = extractPerformanceData(parsedContext);

    // Enrich context with server-side info
    const enrichedContext = {
      ...parsedContext,
      _server: {
        receivedAt: new Date().toISOString(),
        ip,
        userAgent: request.headers.get('user-agent'),
        referer: request.headers.get('referer'),
      },
      _performance: performanceData,
    };

    // Determine if we should notify superusers based on severity and type
    const shouldNotify = shouldNotifySuperusers(severity, errorType, parsedContext);

    // Log the error using the existing logging infrastructure
    const errorId = await logError({
      errorType,
      errorMessage,
      errorStack: errorStack || null,
      endpoint: endpoint || 'unknown',
      method: body.method || 'CLIENT',
      requestBody: enrichedContext,
      userId,
      userEmail,
      request,
      severity,
      visitorSessionId,
      notifySuperusers: shouldNotify,
    });

    return NextResponse.json({
      ok: true,
      errorId,
      message: 'Error logged successfully',
    });
  } catch (err) {
    // Log the failure but don't create infinite loop
    console.error('Error API handler failed:', err.message);
    return NextResponse.json(
      { ok: false, error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}

/**
 * Determine severity from context if not explicitly provided
 */
function determineSeverityFromContext(errorType, errorMessage, context) {
  const message = (errorMessage || '').toLowerCase();

  // Performance issues
  if (errorType === 'performance') {
    // Check Web Vitals thresholds
    const webVitals = context?.performance?.webVitals;
    if (webVitals) {
      // Poor LCP (> 4s), CLS (> 0.25), or INP (> 500ms) is high severity
      if (webVitals.lcp > 4000 || webVitals.cls > 0.25 || webVitals.inp > 500) {
        return Severity.HIGH;
      }
      // Needs improvement thresholds
      if (webVitals.lcp > 2500 || webVitals.cls > 0.1 || webVitals.inp > 200) {
        return Severity.MEDIUM;
      }
    }
    return Severity.LOW;
  }

  // Critical errors
  if (
    message.includes('chunk') ||
    message.includes('hydration') ||
    message.includes('cannot read') ||
    message.includes('undefined is not')
  ) {
    return Severity.HIGH;
  }

  // API errors
  if (errorType === 'api_error') {
    if (message.includes('500') || message.includes('503')) return Severity.HIGH;
    if (message.includes('401') || message.includes('403')) return Severity.MEDIUM;
    return Severity.MEDIUM;
  }

  // Network errors
  if (errorType === 'network_error') {
    return Severity.MEDIUM;
  }

  // Validation errors are usually low
  if (errorType === 'validation_error') {
    return Severity.LOW;
  }

  return Severity.MEDIUM;
}

/**
 * Extract and summarize performance data from context
 */
function extractPerformanceData(context) {
  if (!context?.performance) return null;

  const perf = context.performance;
  const summary = {};

  // Web Vitals summary with ratings
  if (perf.webVitals) {
    const vitals = perf.webVitals;
    summary.webVitals = {
      lcp: vitals.lcp ? { value: vitals.lcp, rating: getLCPRating(vitals.lcp) } : null,
      fid: vitals.fid ? { value: vitals.fid, rating: getFIDRating(vitals.fid) } : null,
      cls: vitals.cls ? { value: vitals.cls, rating: getCLSRating(vitals.cls) } : null,
      fcp: vitals.fcp ? { value: vitals.fcp, rating: getFCPRating(vitals.fcp) } : null,
      ttfb: vitals.ttfb ? { value: vitals.ttfb, rating: getTTFBRating(vitals.ttfb) } : null,
      inp: vitals.inp ? { value: vitals.inp, rating: getINPRating(vitals.inp) } : null,
    };
  }

  // Navigation timing
  if (perf.navigation) {
    summary.navigation = perf.navigation;
  }

  // Slow resources (top 3)
  if (perf.slowResources?.length > 0) {
    summary.slowResources = perf.slowResources.slice(0, 3);
  }

  // Long tasks
  if (perf.longTasks) {
    summary.longTasks = perf.longTasks;
  }

  // Resource summary
  if (perf.resourceSummary) {
    summary.resourceSummary = perf.resourceSummary;
  }

  return summary;
}

// Web Vitals rating functions based on Google thresholds
function getLCPRating(value) {
  if (value <= 2500) return 'good';
  if (value <= 4000) return 'needs-improvement';
  return 'poor';
}

function getFIDRating(value) {
  if (value <= 100) return 'good';
  if (value <= 300) return 'needs-improvement';
  return 'poor';
}

function getCLSRating(value) {
  if (value <= 0.1) return 'good';
  if (value <= 0.25) return 'needs-improvement';
  return 'poor';
}

function getFCPRating(value) {
  if (value <= 1800) return 'good';
  if (value <= 3000) return 'needs-improvement';
  return 'poor';
}

function getTTFBRating(value) {
  if (value <= 800) return 'good';
  if (value <= 1800) return 'needs-improvement';
  return 'poor';
}

function getINPRating(value) {
  if (value <= 200) return 'good';
  if (value <= 500) return 'needs-improvement';
  return 'poor';
}

/**
 * Determine if superusers should be notified
 */
function shouldNotifySuperusers(severity, errorType, context) {
  // Always notify for critical/high severity
  if (severity === Severity.CRITICAL || severity === Severity.HIGH) {
    return true;
  }

  // Notify for repeated errors (if they've seen many interactions before error)
  if (context?.journey?.interactionCount > 10) {
    return true;
  }

  // Don't notify for low severity or performance issues with good vitals
  if (severity === Severity.LOW) {
    return false;
  }

  // Don't spam for performance issues unless they're severe
  if (errorType === 'performance') {
    const vitals = context?.performance?.webVitals;
    if (vitals && (vitals.lcp > 4000 || vitals.cls > 0.25 || vitals.inp > 500)) {
      return true;
    }
    return false;
  }

  // Default: notify for medium severity
  return true;
}
