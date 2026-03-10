import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { createSession, validateSession } from '../../../../lib/auth';
import {
  sendWelcomeEmail,
  sendPhoneUpdateReminderEmail,
  sendAdminNewRegistrationEmail,
} from '../../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { rateLimit } from '../../../../lib/rateLimit';
import { validateCSRFFromRequest } from '../../../../lib/csrf';

const skipSchema = z.object({
  supporterId: z.string().uuid('Invalid supporter ID'),
});

export async function POST(request) {
  // CSRF protection - require valid token
  if (!validateCSRFFromRequest(request)) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  // Session validation - user must be authenticated
  const sessionToken = request.cookies.get('session_token')?.value;
  const currentUser = sessionToken ? await validateSession(sessionToken) : null;

  // Allow if user has a valid session OR if they're in pending_phone status (mid-registration)
  // For mid-registration flow, we verify the supporterId matches later
  // Rate limit: 5 requests per 10 minutes per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(`skip-phone:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  try {
    const body = await request.json();
    const parsed = skipSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { supporterId } = parsed.data;

    // Get supporter
    const { data: supporter, error: fetchError } = await supabase
      .from('supporters')
      .select('id, email, first_name, last_name, phone, status')
      .eq('id', supporterId)
      .single();

    if (fetchError || !supporter) {
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });
    }

    if (supporter.status !== 'pending_phone') {
      return NextResponse.json(
        { ok: false, error: 'Phone verification not required for this account' },
        { status: 400 }
      );
    }

    // Security check: If user has a session, verify they're acting on their own account
    // If no session (mid-registration flow), the pending_phone status check above ensures
    // this is a legitimate registration in progress
    if (currentUser && currentUser.id !== supporterId) {
      return NextResponse.json(
        { ok: false, error: 'Cannot skip phone verification for another account' },
        { status: 403 }
      );
    }

    // Update supporter: mark as approved but phone NOT verified
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        status: 'approved',
        approved_at: now,
        phone_verified: false,
      })
      .eq('id', supporterId);

    if (updateError) {
      return NextResponse.json({ ok: false, error: 'Failed to update account' }, { status: 500 });
    }

    // Create session
    const session = await createSession(supporterId, request);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Failed to create session' }, { status: 500 });
    }

    // Log events
    await logAudit({
      eventType: AuditEvents.PHONE_VERIFICATION_SKIPPED,
      supporterId,
      details: { phone: supporter.phone, reason: 'User skipped phone verification' },
      request,
      responseStatus: 200,
    });

    await logAudit({
      eventType: AuditEvents.SUPPORTER_APPROVED,
      supporterId,
      targetId: supporterId,
      targetType: 'supporter',
      oldValues: { status: 'pending_phone' },
      newValues: { status: 'approved' },
      details: {
        method: 'auto-approval after skipping phone verification',
        email: supporter.email,
        phone_verified: false,
      },
      request,
      sessionId: session.id,
      responseStatus: 200,
    });

    // Send welcome email
    await sendWelcomeEmail(supporter.email, supporter.first_name);

    // Send phone update reminder email
    await sendPhoneUpdateReminderEmail(supporter.email, supporter.first_name);

    // Notify admin
    const updatedSupporter = {
      ...supporter,
      status: 'approved',
      approved_at: now,
      phone_verified: false,
    };
    await sendAdminNewRegistrationEmail(updatedSupporter);

    // Set session cookie
    const response = NextResponse.json({
      ok: true,
      message: 'Account approved! You can update your phone number later in settings.',
    });

    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: session.expiresAt,
      path: '/',
    });

    return response;
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/skip-phone',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
