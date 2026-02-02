/**
 * API Route: User Registration
 *
 * Handles new user account creation with address and phone validation.
 * Creates supporter record, sends verification email, and logs registration.
 * Authentication: None (public endpoint)
 * Rate Limit: 5 registrations per hour per IP
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
});

/**
 * POST /api/auth/register
 * Creates a new user account with full validation.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, message: "Registration successful...", supporterId: string }
 *   - 400: { ok: false, error: "Validation error or duplicate email" }
 *   - 403: { ok: false, error: "This account has been suspended" }
 *   - 429: { ok: false, error: "Too many registration attempts..." }
 *   - 500: { ok: false, error: "Failed to create account..." }
 * @throws {Error} When database operations fail
 *
 * Request body:
 *   - firstName: string (required, max 50 chars)
 *   - lastName: string (required, max 50 chars)
 *   - email: string (required, valid email format)
 *   - phone: string (optional, min 10 chars)
 *   - streetAddress: string (required, min 5 chars, max 100)
 *   - city: string (required, min 2 chars, max 50)
 *   - state: string (required, 2 letters, default: TX)
 *   - zipCode: string (required, 5-10 chars)
 *   - emailConsent: boolean (default: true)
 *   - smsConsent: boolean (default: true)
 *
 * Validation process:
 *   1. Checks for existing email (case-insensitive)
 *   2. Validates and formats phone number if provided
 *   3. Validates address with USPS API
 *   4. Stores standardized address from USPS if available
 *   5. Creates supporter record with status='pending_email'
 *   6. Generates and sends email verification token
 *   7. Logs registration to audit trail
 *
 * Security features:
 *   - Rate limited to prevent spam registrations
 *   - Email normalized to lowercase
 *   - Phone number validated and formatted
 *   - Address validated against USPS database
 *   - Requires email verification before login
 */
export async function POST(request) {
  const supabase = getSupabase();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 5 registrations per IP per hour
  if (!rateLimit(ip, 5, 3600000)) {
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
        return NextResponse.json(
          { ok: false, error: phoneValidation.error },
          { status: 400 }
        );
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
        consent_timestamp: (emailConsent || smsConsent) ? new Date().toISOString() : null,
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
    const emailResult = await sendVerificationEmail(
      supporter.email,
      supporter.first_name,
      token
    );

    if (!emailResult.success) {
      // Don't fail registration, just log the error
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
