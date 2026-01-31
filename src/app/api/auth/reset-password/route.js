import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateEmailVerification,
  markEmailVerificationUsed,
  hashPassword,
  updateSupporter,
  deleteAllSessions,
} from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

// GET - Validate token (for page load)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { ok: false, error: 'No token provided' },
      { status: 400 }
    );
  }

  try {
    const verification = await validateEmailVerification(token, 'password_reset');

    if (!verification) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      endpoint: '/api/auth/reset-password',
      method: 'GET',
    });

    return NextResponse.json(
      { ok: false, error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}

// POST - Reset password
export async function POST(req) {
  try {
    const schema = z.object({
      token: z.string().min(1, 'Token is required'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
    });

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    // Validate token
    const verification = await validateEmailVerification(token, 'password_reset');

    if (!verification) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    const supporter = verification.supporter;

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update supporter's password
    const updated = await updateSupporter(supporter.id, {
      password_hash: passwordHash,
    });

    if (!updated) {
      throw new Error('Failed to update password');
    }

    // Mark verification token as used
    await markEmailVerificationUsed(verification.id);

    // Delete all existing sessions for security
    await deleteAllSessions(supporter.id);

    // Log the password reset
    await logAudit({
      eventType: AuditEvents.PASSWORD_RESET_COMPLETED,
      supporterId: supporter.id,
      targetType: 'supporter',
      targetId: supporter.id,
      details: { email: supporter.email },
      request: req,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Password has been reset successfully. Please sign in with your new password.',
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/reset-password',
      method: 'POST',
      request: req,
    });

    return NextResponse.json(
      { ok: false, error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}
