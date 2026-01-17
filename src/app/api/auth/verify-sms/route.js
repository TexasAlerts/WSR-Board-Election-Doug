import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { validateSMSCode, incrementSMSAttempt, createSession } from '../../../../lib/auth';
import { sendWelcomeEmail, sendAdminNewRegistrationEmail } from '../../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

const verifySchema = z.object({
  supporterId: z.string().uuid('Invalid supporter ID'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { supporterId, code } = parsed.data;

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

    // Validate SMS code
    const validation = await validateSMSCode(supporterId, code);

    if (!validation.valid) {
      await incrementSMSAttempt(supporterId);
      return NextResponse.json({ ok: false, error: validation.reason }, { status: 400 });
    }

    // Update supporter: mark phone verified, set status to approved
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        phone_verified: true,
        phone_verified_at: now,
        status: 'approved',
        approved_at: now,
      })
      .eq('id', supporterId);

    if (updateError) {
      console.error('Update supporter error:', updateError);
      return NextResponse.json({ ok: false, error: 'Failed to update account' }, { status: 500 });
    }

    // Create session
    const session = await createSession(supporterId, request);
    if (!session) {
      return NextResponse.json({ ok: false, error: 'Failed to create session' }, { status: 500 });
    }

    // Log events
    await logAudit({
      eventType: AuditEvents.PHONE_VERIFIED,
      supporterId,
      details: { phone: supporter.phone },
      request,
      responseStatus: 200,
    });

    // Note: Account is auto-approved after phone verification
    await logAudit({
      eventType: AuditEvents.SUPPORTER_APPROVED,
      supporterId,
      targetId: supporterId,
      targetType: 'supporter',
      oldValues: { status: 'pending_phone' },
      newValues: { status: 'approved' },
      details: {
        method: 'auto-approval after phone verification',
        email: supporter.email,
      },
      request,
      sessionId: session.id,
      responseStatus: 200,
    });

    // Send welcome email
    await sendWelcomeEmail(supporter.email, supporter.first_name);

    // Notify admin of new registration
    const updatedSupporter = { ...supporter, status: 'approved', approved_at: now };
    await sendAdminNewRegistrationEmail(updatedSupporter);

    // Set session cookie
    const response = NextResponse.json({
      ok: true,
      message: 'Account verified! Welcome aboard!',
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
    console.error('SMS verify error:', err);
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/verify-sms',
      method: 'POST',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
