import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, getVerifiedVoter } from '../../../../lib/auth';
import { rateLimit } from '../../../../lib/rateLimit';
import { logError, ErrorTypes } from '../../../../lib/logging';

export async function GET(request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Check for authenticated supporter
    const supporter = await getCurrentSupporter();
    const verifiedVoter = await getVerifiedVoter();

    // Determine user's email
    let userEmail = null;
    if (supporter) {
      userEmail = supporter.email.toLowerCase();
    } else if (verifiedVoter) {
      userEmail = verifiedVoter.email.toLowerCase();
    }

    // If no user identity, return empty
    if (!userEmail) {
      return NextResponse.json({ ok: true, data: {} });
    }

    // Fetch supported ideas for this email
    const { data: supports, error } = await supabase
      .from('idea_supports')
      .select('idea_id, supporter_email, created_at')
      .eq('supporter_email', userEmail);

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Failed to fetch supported ideas' },
        { status: 500 }
      );
    }

    // Transform into { ideaId: email } format for backward compatibility
    const supportedIdeas = {};
    supports?.forEach((support) => {
      supportedIdeas[support.idea_id] = support.supporter_email;
    });

    return NextResponse.json({ ok: true, data: supportedIdeas });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/ideas/my-support',
      method: 'GET',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
