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
    const { category, message, stack, component_stack, url, user_agent } = body;

    // Basic validation
    if (!message) {
      return NextResponse.json(
        { ok: false, error: 'Error message is required' },
        { status: 400 }
      );
    }

    // Rate limiting: check for recent errors from same IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
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

    // Build enhanced stack trace with component info
    const fullStack = component_stack
      ? `${stack}\n\nComponent Stack:${component_stack}`
      : stack;

    // Log the error using the existing logging infrastructure
    const errorId = await logError({
      errorType: category === 'client' ? ErrorTypes.CLIENT_ERROR : ErrorTypes.API_ERROR,
      errorMessage: message,
      errorStack: fullStack,
      endpoint: url || 'unknown',
      method: 'CLIENT',
      requestBody: {
        url,
        user_agent,
        component_stack: component_stack ? '[included in stack]' : null,
      },
      userEmail,
      request,
      notifySuperusers: true,
    });

    return NextResponse.json({
      ok: true,
      errorId,
      message: 'Error logged successfully'
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}
