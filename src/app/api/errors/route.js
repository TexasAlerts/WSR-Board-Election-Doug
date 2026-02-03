import { NextResponse } from 'next/server';
import { logError, ErrorTypes } from '../../../lib/logging';
import { rateLimit } from '../../../lib/rateLimit';
import { cookies } from 'next/headers';
import { getSupabase } from '../../../lib/supabase';

/**
 * POST /api/errors
 * Public endpoint for client-side error reporting from ErrorBoundary
 *
 * Accepts:
 * - category: 'client' (for React ErrorBoundary errors)
 * - message: Error message
 * - stack: Error stack trace
 * - component_stack: React component stack (optional)
 * - url: Page URL where error occurred
 * - user_agent: Browser user agent
 */
export async function POST(request) {
  // Rate limit: 10 error reports per minute per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!rateLimit(`errors:${ip}`, 10, 60000)) {
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
    const context =
      body.context ||
      (body.component_stack ? JSON.stringify({ componentStack: body.component_stack }) : null);

    // Basic validation
    if (!errorMessage) {
      return NextResponse.json({ ok: false, error: 'Error message is required' }, { status: 400 });
    }

    // Rate limiting: check for recent errors from same IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Get user email from session if available (don't require auth)
    let userEmail = null;
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session_token');
      if (sessionCookie?.value) {
        const supabase = getSupabase();
        const { data: session } = await supabase
          .from('sessions')
          .select('supporter_id')
          .eq('token', sessionCookie.value)
          .gt('expires_at', new Date().toISOString())
          .single();
        if (session?.supporter_id) {
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

    // Build enhanced stack trace with context info
    const fullStack = errorStack || null;

    // Log the error using the existing logging infrastructure
    const errorId = await logError({
      errorType,
      errorMessage,
      errorStack: fullStack,
      endpoint: endpoint || 'unknown',
      method: body.method || 'CLIENT',
      requestBody: context ? JSON.parse(context) : null,
      userEmail,
      request,
      notifySuperusers: true, // Always notify for client errors
    });

    return NextResponse.json({
      ok: true,
      errorId,
      message: 'Error logged successfully',
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}
