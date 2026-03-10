import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { createSMSVerification } from '../../../../lib/auth';
import { sendVerificationSMS } from '../../../../lib/smsService';
import { validatePhoneNumber } from '../../../../lib/phoneValidation';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { sendWelcomeEmail } from '../../../../lib/emailService';
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
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
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
      .select('id, email, phone, status, first_name')
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

    // If no phone on file, skip SMS and auto-approve the account
    if (!supporter.phone || !supporter.phone.trim()) {
      await supabase
        .from('supporters')
        .update({ status: 'approved' })
        .eq('id', supporterId);

      await logAudit({
        eventType: AuditEvents.ACCOUNT_APPROVED || 'ACCOUNT_APPROVED',
        supporterId,
        details: { reason: 'No phone on file, auto-approved' },
        request,
        responseStatus: 200,
      });

      await sendWelcomeEmail(supporter.email, supporter.first_name);

      return NextResponse.json({
        ok: true,
        message: 'Your account has been approved. No phone verification needed.',
        autoApproved: true,
      });
    }

    // Validate phone format before sending SMS
    const phoneValidation = validatePhoneNumber(supporter.phone);
    if (!phoneValidation.valid) {
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: `Cannot send SMS: invalid phone format - ${phoneValidation.error}`,
        endpoint: '/api/auth/send-sms-code',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Phone number is invalid. Please update your profile with a valid US phone number.' },
        { status: 400 }
      );
    }

    // Create new SMS code with validated E.164 phone
    const code = await createSMSVerification(supporterId, phoneValidation.formatted);
    if (!code) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: `Failed to create SMS verification code for supporter ${supporterId}`,
        endpoint: '/api/auth/send-sms-code',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    // Send SMS using validated E.164 formatted phone
    const smsResult = await sendVerificationSMS(phoneValidation.formatted, code);

    if (!smsResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: `Failed to send SMS verification code: ${smsResult.error}`,
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
