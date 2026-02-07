import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { createSMSVerification } from '../../../../lib/auth';
import { sendVerificationSMS } from '../../../../lib/smsService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

const sendCodeSchema = z.object({
  supporterId: z.string().uuid('Invalid supporter ID'),
});

// Per-supporterId rate limiting to prevent spam attacks on specific accounts
const supporterRateLimits = new Map();

function rateLimitBySupporterId(supporterId) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000; // 10 minutes
  const maxAttempts = 3;

  const attempts = supporterRateLimits.get(supporterId) || [];
  const recentAttempts = attempts.filter((t) => now - t < windowMs);

  if (recentAttempts.length >= maxAttempts) return false;

  recentAttempts.push(now);
  supporterRateLimits.set(supporterId, recentAttempts);

  // Clean up old entries periodically
  if (supporterRateLimits.size > 1000) {
    for (const [key, val] of supporterRateLimits.entries()) {
      if (val.every((t) => now - t >= windowMs)) {
        supporterRateLimits.delete(key);
      }
    }
  }

  return true;
}

async function postHandler(request) {
  const supabase = getSupabase();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 3 SMS per IP per 10 minutes
  if (!rateLimit(`sms-${ip}`, 3, 600000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please wait before requesting another code.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = sendCodeSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'SMS code request validation failed: ' + errorMessage,
        endpoint: '/api/auth/send-sms-code',
        method: 'POST',
        request,
      });
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { supporterId } = parsed.data;

    // Per-supporterId rate limit to prevent targeting specific accounts
    if (!rateLimitBySupporterId(supporterId)) {
      return NextResponse.json(
        { ok: false, error: 'Too many SMS requests for this account. Please wait 10 minutes.' },
        { status: 429 }
      );
    }

    // Get supporter
    const { data: supporter, error: fetchError } = await supabase
      .from('supporters')
      .select('id, phone, status, first_name')
      .eq('id', supporterId)
      .single();

    if (fetchError || !supporter) {
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 404 });
    }

    if (supporter.status !== 'pending_phone') {
      return NextResponse.json(
        { ok: false, error: 'Phone verification not available for this account' },
        { status: 400 }
      );
    }

    // Create new SMS code
    const code = await createSMSVerification(supporterId, supporter.phone);
    if (!code) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    // Send SMS
    const smsResult = await sendVerificationSMS(supporter.phone, code);

    if (!smsResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'Failed to send SMS verification code',
        endpoint: '/api/auth/send-sms-code',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    await logAudit({
      eventType: AuditEvents.SMS_CODE_SENT || 'SMS_CODE_SENT',
      supporterId,
      details: { phone: supporter.phone },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Verification code sent to your phone.',
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/send-sms-code',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const POST = withCSRF(postHandler);
