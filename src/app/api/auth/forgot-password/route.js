/**
 * API Route: Password Reset Request
 *
 * Handles password reset requests for registered supporters.
 * Implements security measures including rate limiting and email enumeration prevention.
 * Authentication: None (public endpoint)
 * Rate Limit: 3 requests per hour per IP
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { getSupporterByEmail, createEmailVerification } from '../../../../lib/auth';
import { sendPasswordResetEmail } from '../../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

/**
 * POST /api/auth/forgot-password
 * Initiates a password reset request by sending a reset link to the user's email.
 * Always returns success to prevent email enumeration attacks.
 *
 * @param {Request} req - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, message: "If an account exists..." }
 *   - 400: { ok: false, error: "Validation error message" }
 *   - 429: { ok: false, error: "Too many requests. Please try again later." }
 * @throws {Error} Returns success response even on error to prevent information leakage
 *
 * Request body:
 *   - email: string (required, valid email format)
 *
 * Security features:
 *   - Rate limited to 3 requests per hour per IP
 *   - Returns generic success message to prevent email enumeration
 *   - Only sends email if account exists and is verified
 *   - Logs all reset requests for audit trail
 */
export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Stricter rate limit for password reset: 3 requests per hour
  if (!rateLimit(ip, 3, 3600000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const schema = z.object({
      email: z.string().email('Invalid email address'),
    });

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Look up supporter - but don't reveal if they exist or not (security measure)
    const supporter = await getSupporterByEmail(normalizedEmail);

    if (supporter) {
      // Only send email if supporter exists and has verified their email
      if (supporter.email_verified_at) {
        // Create password reset token (expires after configured time period)
        const token = await createEmailVerification(supporter.id, 'password_reset');

        if (token) {
          // Send password reset email
          await sendPasswordResetEmail(
            supporter.email,
            supporter.first_name,
            token
          );

          // Log the password reset request
          await logAudit({
            eventType: AuditEvents.PASSWORD_RESET_REQUESTED,
            supporterId: supporter.id,
            targetType: 'supporter',
            targetId: supporter.id,
            details: { email: normalizedEmail },
            request: req,
            responseStatus: 200,
          });
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      ok: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/forgot-password',
      method: 'POST',
      request: req,
    });

    // Still return success to prevent information leakage
    return NextResponse.json({
      ok: true,
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  }
}
