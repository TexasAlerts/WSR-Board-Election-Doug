/**
 * User Registration API Endpoint
 *
 * POST /api/auth/register
 *
 * Creates a new supporter account with address validation.
 *
 * Request Body:
 * - firstName: string (1-50 chars)
 * - lastName: string (1-50 chars)
 * - email: string (valid email)
 * - phone: string (optional, US phone number)
 * - streetAddress: string (5-100 chars)
 * - city: string (2-50 chars)
 * - state: string (2 chars, default 'TX')
 * - zipCode: string (5-10 chars)
 * - emailConsent: boolean (default true)
 * - smsConsent: boolean (default true)
 *
 * Response (Success - 200):
 * - ok: true
 * - message: "Registration successful! Please check your email to verify your account."
 * - supporterId: string
 *
 * Response (Error):
 * - 400: Validation error, duplicate email, invalid address
 * - 403: Account suspended
 * - 429: Too many registration attempts (5 per hour per IP)
 * - 500: Server error
 *
 * Process Flow:
 * 1. Validate input with Zod schema
 * 2. Check for duplicate email
 * 3. Validate US phone number format
 * 4. Validate address with USPS API
 * 5. Create supporter record (status: pending_email)
 * 6. Generate email verification token
 * 7. Send verification email
 * 8. Log audit event
 *
 * Authentication: None required
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { validatePhoneNumber } from '../../../../lib/phoneValidation';
import { validateAddress } from '../../../../lib/uspsValidation';
import { createEmailVerification } from '../../../../lib/auth';
import { sendVerificationEmail } from '../../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required').optional().or(z.literal('')),
  streetAddress: z.string().min(5, 'Street address is required').max(100),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string().length(2, 'State must be 2 letters').default('TX'),
  zipCode: z.string().min(5, 'ZIP code is required').max(10),
  emailConsent: z.boolean().default(true),
  smsConsent: z.boolean().default(true),
  engagementPreferences: z
    .object({
      updates: z.boolean().default(true),
      host_event: z.boolean().default(false),
      volunteer: z.boolean().default(false),
    })
    .optional(),
});

export async function POST(request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 5 registrations per IP per hour
  if (!(await rateLimit(ip, 5, 3600000))) {
    return NextResponse.json(
      { ok: false, error: 'Too many registration attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      emailConsent,
      smsConsent,
      engagementPreferences,
    } = parsed.data;

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('supporters')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      if (existingUser.status === 'suspended') {
        return NextResponse.json(
          { ok: false, error: 'This account has been suspended.' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { ok: false, error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // Validate phone number (optional)
    let phoneFormatted = null;
    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return NextResponse.json({ ok: false, error: phoneValidation.error }, { status: 400 });
      }
      phoneFormatted = phoneValidation.formatted;
    }

    // Validate address with USPS
    const addressValidation = await validateAddress({
      street: streetAddress,
      city,
      state,
      zip: zipCode,
    });

    if (!addressValidation.valid) {
      return NextResponse.json(
        { ok: false, error: addressValidation.error || 'Invalid address' },
        { status: 400 }
      );
    }

    // Create supporter record
    const { data: supporter, error: createError } = await supabase
      .from('supporters')
      .insert({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.toLowerCase().trim(),
        phone: phoneFormatted,
        street_address: streetAddress.trim(),
        street_address_standardized: addressValidation.standardized?.street || streetAddress.trim(),
        city: addressValidation.standardized?.city || city.trim(),
        state: addressValidation.standardized?.state || state.toUpperCase(),
        zip_code: addressValidation.standardized?.zip || zipCode.trim(),
        address_validated: !addressValidation.skipped,
        email_consent: emailConsent,
        sms_consent: smsConsent,
        consent_timestamp: emailConsent || smsConsent ? new Date().toISOString() : null,
        status: 'pending_email',
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        return NextResponse.json(
          { ok: false, error: 'An account with this email already exists.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { ok: false, error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }

    // Create email verification token
    const token = await createEmailVerification(supporter.id, 'verify');
    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create verification. Please try again.' },
        { status: 500 }
      );
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(supporter.email, supporter.first_name, token);

    if (!emailResult.success) {
      // Don't fail registration, just log the error
    }

    // Insert engagement preference interest rows
    if (engagementPreferences) {
      const interestRows = Object.entries(engagementPreferences)
        .filter(([, checked]) => checked)
        .map(([type]) => ({
          type,
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: email.toLowerCase().trim(),
          phone: phoneFormatted,
          consent_email: emailConsent,
          consent_sms: smsConsent,
        }));

      if (interestRows.length > 0) {
        await supabase.from('interest').insert(interestRows);
      }
    }

    // Log successful registration
    await logAudit({
      eventType: AuditEvents.REGISTER,
      supporterId: supporter.id,
      details: {
        email: supporter.email,
        firstName: supporter.first_name,
        lastName: supporter.last_name,
        city: supporter.city,
        emailConsent,
        smsConsent,
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Registration successful! Please check your email to verify your account.',
      supporterId: supporter.id,
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/register',
      method: 'POST',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
