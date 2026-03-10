import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { generateToken } from '../../../../lib/auth';
import { sendVoterVerificationEmail } from '../../../../lib/emailService';
import { rateLimit } from '../../../../lib/rateLimit';
import { z } from 'zod';
import { logError, ErrorTypes } from '../../../../lib/logging';

const schema = z.object({
  email: z.string().email('Valid email required'),
});

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip, 2, 60_000)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Valid email required' }, { status: 400 });
    }

    const normalizedEmail = parsed.data.email.toLowerCase().trim();
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
    }

    const { data: voter } = await supabase
      .from('verified_voters')
      .select('id, name, verified_at')
      .eq('email', normalizedEmail)
      .single();

    if (!voter) {
      // Don't reveal whether email exists
      return NextResponse.json({
        ok: true,
        message: 'If that email is in our system, a verification link has been sent.',
      });
    }

    if (voter.verified_at) {
      return NextResponse.json({
        ok: true,
        alreadyVerified: true,
        message: 'Email already verified.',
      });
    }

    const token = generateToken(64);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await supabase
      .from('verified_voters')
      .update({
        verification_token: token,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', voter.id);

    await sendVoterVerificationEmail(normalizedEmail, voter.name || 'Voter', token);

    return NextResponse.json({ ok: true, message: 'Verification email sent.' });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/verified-voters/resend',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
