import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { rateLimit } from '../../../../lib/rateLimit';
import { z } from 'zod';
import { linkPendingSubmissions } from '../../../../lib/verificationHelpers';

const schema = z.object({
  token: z.string().min(1, 'Token required'),
});

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 10 attempts per minute per IP to prevent token enumeration
  if (!(await rateLimit(ip, 10, 60000))) {
    return NextResponse.json(
      { ok: false, error: 'Too many verification attempts. Please wait a minute.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }

    const { token } = parsed.data;
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
    }

    const { data: voter, error } = await supabase
      .from('verified_voters')
      .select('id, email, name, first_name, last_name, address, verification_token, token_expires_at, verified_at')
      .eq('verification_token', token)
      .gt('token_expires_at', new Date().toISOString())
      .is('verified_at', null)
      .single();

    if (error || !voter) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid or expired verification link. Please request a new one.',
          expired: true,
        },
        { status: 400 }
      );
    }

    // Mark as verified
    const now = new Date().toISOString();
    const { error: updateError } = await supabase.from('verified_voters').update({ verified_at: now }).eq('id', voter.id);
    if (updateError) {
      throw new Error(`Failed to mark voter verified: ${updateError.message}`);
    }

    // Create default notification preferences
    const { error: upsertError } = await supabase.from('notification_preferences').upsert(
      {
        email: voter.email,
        email_on_comment_moderation: true,
        email_on_new_comment: true,
        email_on_new_reply: true,
        email_on_weekly_digest: true,
      },
      { onConflict: 'email' }
    );
    if (upsertError) {
      console.error('Failed to create notification preferences:', upsertError.message);
    }

    // Link all pending submissions to this verified voter
    const linkedCounts = await linkPendingSubmissions(voter.id, voter.email);

    // Log successful linking
    if (linkedCounts.interestCount > 0 || linkedCounts.questionCount > 0) {
      await logAudit({
        eventType: 'SUBMISSIONS_LINKED',
        targetId: voter.id,
        targetType: 'verified_voter',
        details: {
          email: voter.email,
          linkedInterest: linkedCounts.interestCount,
          linkedQuestions: linkedCounts.questionCount,
        },
        request,
        responseStatus: 200,
      });
    }

    // Audit log
    await logAudit({
      eventType: AuditEvents.VOTER_VERIFIED || 'VOTER_VERIFIED',
      targetId: voter.id,
      targetType: 'verified_voter',
      details: { email: voter.email, name: voter.name },
      request,
      responseStatus: 200,
    });

    // Set cookie for verified voter
    const response = NextResponse.json({
      ok: true,
      voter: { id: voter.id, email: voter.email, name: voter.name, first_name: voter.first_name },
      linked: {
        interests: linkedCounts.interestCount,
        questions: linkedCounts.questionCount,
      },
    });

    response.cookies.set('verified_voter_id', voter.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      path: '/',
    });

    return response;
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/verified-voters/verify',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
