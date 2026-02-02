/**
 * API Route: Skip Phone Verification
 *
 * Allows users to skip phone verification during registration and proceed with account.
 * Creates session, sends welcome emails, and notifies admin.
 * Authentication: None (uses supporter ID from request)
 * Rate Limit: None
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { createSession } from '../../../../lib/auth';
import { sendWelcomeEmail, sendPhoneUpdateReminderEmail, sendAdminNewRegistrationEmail } from '../../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

const skipSchema = z.object({
  supporterId: z.string().uuid('Invalid supporter ID'),
});

/**
 * POST /api/auth/skip-phone
 * Skips phone verification and approves account without phone verification.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response with session cookie
 *   - 200: { ok: true, message: "Account approved! You can update your phone number later in settings." }
 *   - 400: { ok: false, error: "Phone verification not required for this account" }
 *   - 404: { ok: false, error: "Account not found" }
 *   - 500: { ok: false, error: "Failed to update account" | "Failed to create session" }
 * @throws {Error} When database update or session creation fails
 *
 * Request body:
 *   - supporterId: string (required) - UUID of supporter account
 *
 * Process:
 *   1. Updates supporter status from 'pending_phone' to 'approved'
 *   2. Sets phone_verified to false
 *   3. Creates session for automatic login
 *   4. Sends welcome email to user
 *   5. Sends phone update reminder email
 *   6. Notifies admin of new registration
 *   7. Logs skip event and approval to audit trail
 *
 * Response cookies:
 *   - session_token: HttpOnly session token for automatic login
 */
export async function POST(request) {
  const supabase = getSupabase();
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
      .select('*')
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
    const updatedSupporter = { ...supporter, status: 'approved', approved_at: now, phone_verified: false };
    await sendAdminNewRegistrationEmail(updatedSupporter);

    // Set session cookie
    const response = NextResponse.json({
      ok: true,
      message: 'Account approved! You can update your phone number later in settings.',
    });

    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
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
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
