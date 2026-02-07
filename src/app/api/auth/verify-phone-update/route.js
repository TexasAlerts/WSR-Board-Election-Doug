import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, validateSMSCode, incrementSMSAttempt } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

async function postHandler(request) {
  const supabase = getSupabase();
  try {
    const supporter = await getCurrentSupporter();
    if (!supporter) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { code } = parsed.data;

    // Validate SMS code
    const validation = await validateSMSCode(supporter.id, code);

    if (!validation.valid) {
      await incrementSMSAttempt(supporter.id);
      return NextResponse.json({ ok: false, error: validation.reason }, { status: 400 });
    }

    // Mark phone as verified
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        phone_verified: true,
        phone_verified_at: now,
      })
      .eq('id', supporter.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: 'Failed to verify phone' }, { status: 500 });
    }

    await logAudit({
      eventType: AuditEvents.PHONE_VERIFIED,
      supporterId: supporter.id,
      details: { phone: supporter.phone, context: 'settings_update' },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true, message: 'Phone verified successfully!' });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/verify-phone-update',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const POST = withCSRF(postHandler);
