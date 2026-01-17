import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { validatePhoneNumber } from '../../../../lib/phoneValidation';
import { validateAddress } from '../../../../lib/uspsValidation';
import { createEmailVerification } from '../../../../lib/auth';
import { sendVerificationEmail } from '../../../../lib/emailService';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  streetAddress: z.string().min(5, 'Street address is required').max(100),
  city: z.string().min(2, 'City is required').max(50),
  state: z.string().length(2, 'State must be 2 letters').default('TX'),
  zipCode: z.string().min(5, 'ZIP code is required').max(10),
  emailConsent: z.boolean().default(true),
  smsConsent: z.boolean().default(true),
});

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

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { ok: false, error: phoneValidation.error },
        { status: 400 }
      );
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
        phone: phoneValidation.formatted,
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
      console.error('Create supporter error:', createError);
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
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration, just log the error
    }

    return NextResponse.json({
      ok: true,
      message: 'Registration successful! Please check your email to verify your account.',
      supporterId: supporter.id,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
