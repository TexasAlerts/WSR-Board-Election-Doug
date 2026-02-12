/**
 * Volunteer Interest Submission API Endpoint
 *
 * POST /api/interest
 *
 * Captures volunteer interest and supporter sign-ups.
 * Used by the "Get Involved" form for various engagement types.
 *
 * Request Body:
 * - type: string (optional, default 'updates') - Interest type
 *   Values: 'volunteer', 'yard_sign', 'host_event', 'donate', 'updates'
 * - name: string (1-200 chars) - Full name
 * - email: string (valid email, max 200 chars)
 * - phone: string (optional, max 200 chars)
 * - message: string (optional, max 4000 chars) - Additional message
 * - consentEmail: boolean (optional, default false) - Email opt-in
 * - consentSms: boolean (optional, default false) - SMS opt-in
 * - recaptchaToken: string (optional) - reCAPTCHA v3 token
 *
 * Response (Success - 201):
 * - ok: true
 * - message: "Thank you for your interest!"
 * - interestId: string
 *
 * Response (Error):
 * - 400: Validation error or reCAPTCHA failed
 * - 429: Too many submissions (rate limit)
 * - 500: Server error
 *
 * Process Flow:
 * 1. Rate limit check (5 per minute per IP)
 * 2. Validate request body with Zod
 * 3. Verify reCAPTCHA token (if provided)
 * 4. Sanitize text inputs
 * 5. Insert into interest_submissions table
 * 6. Send notification email to admin
 * 7. Send confirmation email to submitter
 * 8. Log audit event
 *
 * Security Features:
 * - Rate limiting by IP
 * - reCAPTCHA v3 verification
 * - XSS protection via sanitizeText()
 * - Input validation with Zod
 * - Audit logging
 *
 * Notifications:
 * - Admin receives email with submission details
 * - Submitter receives confirmation email
 *
 * Authentication: None required (public form)
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { sendInterestVerificationEmail } from '../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { sanitizeText } from '../../../lib/sanitize';
import { verifyCaptcha } from '../../../lib/recaptcha';
import { validatePhoneNumber } from '../../../lib/phoneValidation';
import { ensureVerifiedVoter, getVerifiedVoterByEmail } from '../../../lib/verificationHelpers';

export async function POST(req) {
  const supabase = getSupabase();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const schema = z.object({
      type: z.string().max(200).optional().default('updates'),
      name: z.string().min(1, 'Name is required').max(200),
      email: z.string().email('Invalid email').max(200),
      phone: z.string().max(200).optional().nullable(),
      message: z.string().max(4000).optional().nullable(),
      consentEmail: z.boolean().optional().default(false),
      consentSms: z.boolean().optional().default(false),
      recaptchaToken: z.string().optional(),
    });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Interest form validation failed: ' + errorMessage,
        endpoint: '/api/interest',
        method: 'POST',
        request: req,
      });
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
    const {
      type,
      name: rawName,
      email,
      phone,
      message: rawMessage,
      consentEmail,
      consentSms,
      recaptchaToken,
    } = parsed.data;

    // Require reCAPTCHA verification
    if (!recaptchaToken) {
      return NextResponse.json(
        { ok: false, error: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }
    const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_interest');
    if (!captchaResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'reCAPTCHA verification failed',
        endpoint: '/api/interest',
        method: 'POST',
        request: req,
      });
      return NextResponse.json(
        { ok: false, error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }
    const name = sanitizeText(rawName);
    const message = rawMessage ? sanitizeText(rawMessage) : null;

    // Normalize email for consistent storage and lookups
    const normalizedEmail = email.trim().toLowerCase();

    // Validate phone number if provided
    let formattedPhone = null;
    if (phone && phone.trim()) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { ok: false, error: 'Invalid phone number format. Please use a valid US phone number.' },
          { status: 400 }
        );
      }
      formattedPhone = phoneValidation.formatted;
    }

    const { data: interestRecord, error} = await supabase
      .from('interest')
      .insert({
        type,
        name,
        email: normalizedEmail,
        phone: formattedPhone,
        message,
        consent_email: consentEmail,
        consent_sms: consentSms,
      })
      .select('id')
      .single();
    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/interest',
        method: 'POST',
        userEmail: email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Log interest submission
    await logAudit({
      eventType: AuditEvents.INTEREST_SUBMITTED,
      targetId: interestRecord?.id,
      targetType: 'interest',
      details: { type, name, email, hasPhone: !!phone, consentEmail, consentSms },
      request: req,
      responseStatus: 201,
    });

    // Check if email is already verified
    const verifiedVoter = await getVerifiedVoterByEmail(normalizedEmail);

    if (verifiedVoter) {
      // Already verified - link immediately
      const { error: updateError } = await supabase
        .from('interest')
        .update({
          verified_voter_id: verifiedVoter.id,
          verification_status: 'verified',
        })
        .eq('id', interestRecord.id);

      // Check if update succeeded before returning success
      if (updateError) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: `Failed to link interest to verified voter: ${updateError.message}`,
          endpoint: '/api/interest',
          method: 'POST',
          userEmail: email,
          request: req,
        });
        return NextResponse.json(
          { ok: false, error: 'Failed to link submission. Please try again.' },
          { status: 500 }
        );
      }

      // Send confirmation (not verification) email
      await Promise.all([
        sendEmail(
          normalizedEmail,
          'Thanks for getting involved',
          `Hi ${name},\n\nThanks for your interest in ${type}.\n${message ? `Message: ${message}\n\n` : ''}We will be in touch and you can check back for updates.\n\n--\nDoug Charles`
        ).catch(() => {}),
        sendNotificationEmail(
          'New interest submission',
          `Type: ${type}\nName: ${name}\nEmail: ${normalizedEmail}\nPhone: ${phone || ''}\nMessage: ${message || ''}`
        ).catch(() => {}),
      ]);

      return NextResponse.json({
        ok: true,
        message: 'Thank you! Your interest has been recorded.',
        alreadyVerified: true,
      }, { status: 201 });
    } else {
      // Not verified - create/update verified_voters record
      const { voterId, token } = await ensureVerifiedVoter(normalizedEmail, name);

      // Send verification email
      const emailResult = await sendInterestVerificationEmail(normalizedEmail, name, token, type);

      if (!emailResult.success) {
        await logError({
          errorType: ErrorTypes.EMAIL_ERROR,
          errorMessage: `Failed to send interest verification email: ${emailResult.error}`,
          endpoint: '/api/interest',
          method: 'POST',
          request: req,
        });
      }

      // Send admin notification
      await sendNotificationEmail(
        'New interest submission (pending verification)',
        `Type: ${type}\nName: ${name}\nEmail: ${normalizedEmail}\nPhone: ${phone || ''}\nMessage: ${message || ''}\nStatus: Awaiting email verification`
      ).catch(() => {});

      return NextResponse.json({
        ok: true,
        message: 'Thank you! Please check your email (including junk/spam folder) to verify and stay updated.',
        needsVerification: true,
      }, { status: 201 });
    }
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/interest',
      method: 'POST',
      request: req,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}
