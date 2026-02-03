import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, getVerifiedVoter } from '../../../../lib/auth';
import { rateLimit } from '../../../../lib/rateLimit';
import {
  ANONYMOUS_VOTER_COOKIE,
  generateAnonymousVoterFingerprint,
} from '../../../../lib/anonymousVoting';

export async function GET(request) {
  const supabase = getSupabase();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Check for authenticated supporter
    const supporter = await getCurrentSupporter();
    const verifiedVoter = await getVerifiedVoter();

    // Get anonymous voter token from cookie
    const cookies = request.headers.get('cookie') || '';
    const cookieMatch = cookies.match(new RegExp(`${ANONYMOUS_VOTER_COOKIE}=([^;]+)`));
    const anonymousVoterToken = cookieMatch ? cookieMatch[1] : null;

    // Generate browser fingerprint
    const userAgent = request.headers.get('user-agent') || '';
    const anonymousVoterFingerprint = generateAnonymousVoterFingerprint(ip, userAgent);

    // Build query to fetch user's voted polls
    let votesQuery = supabase.from('poll_votes').select('poll_id, voter_email, created_at');

    if (supporter) {
      // Authenticated user - fetch by supporter_id
      votesQuery = votesQuery.eq('supporter_id', supporter.id);
    } else if (verifiedVoter) {
      // Verified voter - fetch by email
      votesQuery = votesQuery.eq('voter_email', verifiedVoter.email.toLowerCase());
    } else if (anonymousVoterToken || anonymousVoterFingerprint) {
      // Anonymous voter - fetch by token OR fingerprint
      const orConditions = [];
      if (anonymousVoterToken) {
        orConditions.push(`anonymous_voter_token.eq.${anonymousVoterToken}`);
      }
      if (anonymousVoterFingerprint) {
        orConditions.push(`anonymous_voter_fingerprint.eq.${anonymousVoterFingerprint}`);
      }
      if (orConditions.length > 0) {
        votesQuery = votesQuery.or(orConditions.join(','));
      } else {
        // No way to identify user - return empty
        return NextResponse.json({ ok: true, data: {} });
      }
    } else {
      // No way to identify user - return empty
      return NextResponse.json({ ok: true, data: {} });
    }

    const { data: votes, error } = await votesQuery;

    if (error) {
      return NextResponse.json({ ok: false, error: 'Failed to fetch votes' }, { status: 500 });
    }

    // Transform into { pollId: email } format for backward compatibility
    // For anonymous votes, use 'anonymous' as the email value
    const votedPolls = {};
    votes?.forEach((vote) => {
      votedPolls[vote.poll_id] = vote.voter_email || 'anonymous';
    });

    return NextResponse.json({ ok: true, data: votedPolls });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
