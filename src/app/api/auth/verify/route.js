/**
 * API Route: Email Verification and Password Setup
 *
 * Handles email verification during registration, sets initial password, and initiates SMS verification.
 * GET validates token, POST completes verification and advances to phone verification step.
 * Authentication: None (uses token from email)
 * Rate Limit: None (tokens are time-limited and single-use)
 */

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

/**
 * GET /api/auth/verify
 * Validates email verification token to ensure it's still valid.
 * Called when verification page loads.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, supporter: {...} }
 *   - 400: { ok: false, error: "Token required" | "Invalid or expired verification link" }
 *
 * Query parameters:
 *   - token: string (required) - Email verification token from registration email
 *
 * Response supporter object includes id, email, firstName, status
 */
export async function GET(request) {
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

/**
 * POST /api/auth/verify
 * Completes email verification by setting password and advancing to phone verification.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, message: "Email verified! Please check your phone...", supporterId, requiresPhoneVerification: true }
 *   - 400: { ok: false, error: "Validation error or token invalid" }
 *   - 500: { ok: false, error: "Failed to update account" }
 * @throws {Error} When database update fails
 *
 * Request body:
 *   - token: string (required) - Email verification token
 *   - password: string (required) - Initial password
 *     - Minimum 8 characters
 *     - Must contain uppercase letter
 *     - Must contain lowercase letter
 *     - Must contain number
 *
 * Process:
 *   1. Validates email verification token
 *   2. Checks account is in 'pending_email' status
 *   3. Hashes password using bcrypt
 *   4. Updates account: sets password, marks email verified, status='pending_phone'
 *   5. Marks verification token as used
 *   6. Creates and sends SMS verification code
 *   7. Logs email verification and password creation events
 */
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
      return NextResponse.json(
        { ok: false, error: 'Failed to update account' },
        { status: 500 }
      );
    }

    // Mark verification token as used
    await markEmailVerificationUsed(verification.id);

    // Create and send SMS verification code
    const smsCode = await createSMSVerification(supporter.id, supporter.phone);
    if (smsCode) {
      const smsResult = await sendVerificationSMS(supporter.phone, smsCode);
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
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
