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
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { sanitizeText } from '../../../lib/sanitize';
import { verifyCaptcha } from '../../../lib/recaptcha';
import { validatePhoneNumber } from '../../../lib/phoneValidation';

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

    // Verify reCAPTCHA if token is provided
    if (recaptchaToken) {
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
    }
    const name = sanitizeText(rawName);
    const message = rawMessage ? sanitizeText(rawMessage) : null;

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

    const { data: interestRecord, error } = await supabase
      .from('interest')
      .insert({
        type,
        name,
        email,
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
    await Promise.all([
      sendEmail(
        email,
        'Thanks for getting involved',
        `Hi ${name},\n\nThanks for your interest in ${type}.\n${message ? `Message: ${message}\n\n` : ''}We will be in touch and you can check back for updates.\n\n--\nDoug Charles`
      ).catch(() => {}),
      sendNotificationEmail(
        'New interest submission',
        `Type: ${type}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nMessage: ${message || ''}`
      ).catch(() => {}),
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
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
