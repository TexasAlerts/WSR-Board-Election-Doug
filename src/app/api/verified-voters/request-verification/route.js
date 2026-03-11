import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { generateToken } from '../../../../lib/auth';
import { sendVoterVerificationEmail } from '../../../../lib/emailService';
import { rateLimit } from '../../../../lib/rateLimit';
import { parseNameParts } from '../../../../lib/formatDisplayName';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(1, 'Name required').max(200),
});

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!(await rateLimit(ip, 3, 60_000))) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Voter verification request validation failed: ' + parsed.error.errors[0].message,
        endpoint: '/api/verified-voters/request-verification',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
    }

    // Check if already a registered supporter with verified email
    const { data: supporter } = await supabase
      .from('supporters')
      .select('id, email_verified_at')
      .eq('email', normalizedEmail)
      .single();

    if (supporter && supporter.email_verified_at) {
      return NextResponse.json(
        {
          ok: false,
          error: 'This email is registered as a supporter. Please sign in to vote.',
          isRegistered: true,
        },
        { status: 400 }
      );
    }

    // Check if already verified
    const { data: existing } = await supabase
      .from('verified_voters')
      .select('id, verified_at')
      .eq('email', normalizedEmail)
      .single();

    if (existing && existing.verified_at) {
      return NextResponse.json({
        ok: true,
        alreadyVerified: true,
        message: 'Email already verified. You can vote now.',
      });
    }

    const token = generateToken(64);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const { first_name, last_initial } = parseNameParts(name);

    if (existing) {
      // Update existing unverified record
      await supabase
        .from('verified_voters')
        .update({
          name,
          first_name,
          last_initial,
          verification_token: token,
          token_expires_at: expiresAt.toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Create new record
      await supabase.from('verified_voters').insert({
        email: normalizedEmail,
        name,
        first_name,
        last_initial,
        verification_token: token,
        token_expires_at: expiresAt.toISOString(),
      });
    }

    // Send verification email
    const emailResult = await sendVoterVerificationEmail(normalizedEmail, name, token);
    if (!emailResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'Failed to send voter verification email',
        endpoint: '/api/verified-voters/request-verification',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    await logAudit({
      eventType: AuditEvents.VOTER_VERIFICATION_REQUESTED || 'VOTER_VERIFICATION_REQUESTED',
      targetType: 'verified_voter',
      details: { email: normalizedEmail, name },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      message: 'Verification email sent. Please check your inbox.',
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/verified-voters/request-verification',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
