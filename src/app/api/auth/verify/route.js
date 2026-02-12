import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import {
  validateEmailVerification,
  markEmailVerificationUsed,
  hashPassword,
  createSMSVerification,
} from '../../../../lib/auth';
import { sendVerificationSMS } from '../../../../lib/smsService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { rateLimit } from '../../../../lib/rateLimit';

// GET: Check if token is valid
export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 10 token validations per minute per IP
  if (!rateLimit(ip, 10, 60000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many verification attempts. Please wait.' },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Token required' }, { status: 400 });
  }

  const verification = await validateEmailVerification(token, 'verify');

  if (!verification) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or expired verification link' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    ok: true,
    supporter: {
      id: verification.supporter.id,
      email: verification.supporter.email,
      firstName: verification.supporter.first_name,
      status: verification.supporter.status,
    },
  });
}

// POST: Verify email and set password
const verifySchema = z.object({
  token: z.string().min(1, 'Token required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
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

    const { token, password } = parsed.data;

    // Validate token
    const verification = await validateEmailVerification(token, 'verify');
    if (!verification) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired verification link' },
        { status: 400 }
      );
    }

    const supporter = verification.supporter;

    // Check if already verified
    if (supporter.status !== 'pending_email') {
      return NextResponse.json(
        { ok: false, error: 'This account has already been verified' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Update supporter: set password, mark email verified, move to pending_phone
    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        password_hash: passwordHash,
        email_verified_at: new Date().toISOString(),
        status: 'pending_phone',
      })
      .eq('id', supporter.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: 'Failed to update account' }, { status: 500 });
    }

    // Mark verification token as used
    await markEmailVerificationUsed(verification.id);

    // Create and send SMS verification code
    // Validate phone exists and is in valid format before sending SMS
    if (!supporter.phone || !supporter.phone.trim()) {
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Cannot send SMS: phone number is missing',
        endpoint: '/api/auth/verify',
        method: 'POST',
        userEmail: supporter.email,
        request,
      });
    } else {
      const smsCode = await createSMSVerification(supporter.id, supporter.phone);
      if (smsCode) {
        const smsResult = await sendVerificationSMS(supporter.phone, smsCode);
        if (!smsResult.success) {
          await logError({
            errorType: ErrorTypes.EXTERNAL_SERVICE,
            errorMessage: `SMS verification send failed: ${smsResult.error}`,
            endpoint: '/api/auth/verify',
            method: 'POST',
            userEmail: supporter.email,
            request,
          });
        }
      } else {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: 'Failed to create SMS verification code',
          endpoint: '/api/auth/verify',
          method: 'POST',
          userEmail: supporter.email,
          request,
        });
      }
    }

    // Log event
    await logAudit({
      eventType: AuditEvents.EMAIL_VERIFIED,
      supporterId: supporter.id,
      details: { email: supporter.email },
      request,
      responseStatus: 200,
    });

    await logAudit({
      eventType: AuditEvents.PASSWORD_CREATED,
      supporterId: supporter.id,
      details: { email: supporter.email },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Email verified! Please check your phone for the verification code.',
      supporterId: supporter.id,
      requiresPhoneVerification: true,
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/verify',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
