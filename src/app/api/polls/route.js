import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getCurrentSupporter, getVerifiedVoter } from '../../../lib/auth';
import { logError, ErrorTypes } from '../../../lib/logging';
import {
  ANONYMOUS_VOTER_COOKIE,
  generateAnonymousVoterFingerprint,
} from '../../../lib/anonymousVoting';

// API routes should be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const supporter = await getCurrentSupporter();
  const isAuthenticated = !!supporter;
  const verifiedVoter = await getVerifiedVoter();

  // Get anonymous voter token from cookie
  const cookies = request.headers.get('cookie') || '';
  const cookieMatch = cookies.match(new RegExp(`${ANONYMOUS_VOTER_COOKIE}=([^;]+)`));
  const anonymousVoterToken = cookieMatch ? cookieMatch[1] : null;

  // Generate fingerprint for anonymous voters
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const anonymousVoterFingerprint = generateAnonymousVoterFingerprint(ip, userAgent);

  // Get active polls with their choices
  let query = supabase
    .from('polls')
    .select(
      `
      id,
      title,
      description,
      poll_type,
      status,
      visibility,
      show_results_before_vote,
      allow_comments,
      closes_at,
      created_at,
      published_at,
      poll_choices (
        id,
        choice_text,
        display_order
      )
    `
    )
    .eq('status', 'active')
    .order('published_at', { ascending: false });

  // Filter by visibility based on auth status
  if (isAuthenticated) {
    // Authenticated users can see all polls
    // No additional filter needed
  } else {
    // Public users can only see 'public' and 'public_view' polls
    query = query.in('visibility', ['public', 'public_view']);
  }

  const { data: polls, error } = await query;

  if (error) {
    await logError({
      errorType: ErrorTypes.DATABASE_ERROR,
      errorMessage: error.message,
      endpoint: '/api/polls',
      method: 'GET',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  // Get vote counts for each poll
  const pollIds = polls.map((p) => p.id);

  if (pollIds.length === 0) {
    return NextResponse.json({ ok: true, data: [] });
  }

  const { data: voteCounts, error: voteError } = await supabase
    .from('poll_votes')
    .select('poll_id')
    .in('poll_id', pollIds);

  if (voteError) {
    await logError({
      errorType: ErrorTypes.DATABASE_ERROR,
      errorMessage: voteError.message,
      endpoint: '/api/polls',
      method: 'GET',
      request,
    });
  }

  // Count votes per poll
  const voteCountMap = {};
  if (voteCounts) {
    voteCounts.forEach((v) => {
      voteCountMap[v.poll_id] = (voteCountMap[v.poll_id] || 0) + 1;
    });
  }

  // Get comment counts for each poll
  const { data: commentCounts, error: commentError } = await supabase
    .from('comments')
    .select('poll_id')
    .eq('status', 'approved')
    .in('poll_id', pollIds);

  if (commentError) {
    await logError({
      errorType: ErrorTypes.DATABASE_ERROR,
      errorMessage: commentError.message,
      endpoint: '/api/polls',
      method: 'GET',
      request,
    });
  }

  // Count comments per poll
  const commentCountMap = {};
  if (commentCounts) {
    commentCounts.forEach((c) => {
      commentCountMap[c.poll_id] = (commentCountMap[c.poll_id] || 0) + 1;
    });
  }

  // Check if current user has voted on any polls
  // Supports: authenticated supporters, verified voters, and anonymous voters
  let userVotedPolls = {};

  if (pollIds.length > 0) {
    let votesQuery = null;

    if (supporter) {
      // Authenticated user - check by supporter_id
      votesQuery = supabase
        .from('poll_votes')
        .select('poll_id')
        .eq('supporter_id', supporter.id)
        .in('poll_id', pollIds);
    } else if (verifiedVoter) {
      // Verified voter - check by email
      votesQuery = supabase
        .from('poll_votes')
        .select('poll_id')
        .eq('voter_email', verifiedVoter.email.toLowerCase())
        .in('poll_id', pollIds);
    } else if (anonymousVoterToken || anonymousVoterFingerprint) {
      // Anonymous voter - check by token OR fingerprint
      const orConditions = [];
      if (anonymousVoterToken) {
        orConditions.push(`anonymous_voter_token.eq.${anonymousVoterToken}`);
      }
      if (anonymousVoterFingerprint) {
        orConditions.push(`anonymous_voter_fingerprint.eq.${anonymousVoterFingerprint}`);
      }
      votesQuery = supabase
        .from('poll_votes')
        .select('poll_id')
        .or(orConditions.join(','))
        .in('poll_id', pollIds);
    }

    if (votesQuery) {
      const { data: userVotes } = await votesQuery;
      if (userVotes) {
        userVotes.forEach((v) => {
          userVotedPolls[v.poll_id] = true;
        });
      }
    }
  }

  // Add vote counts, comment counts, and visibility info to polls
  const pollsWithCounts = polls.map((p) => ({
    ...p,
    vote_count: voteCountMap[p.id] || 0,
    comment_count: commentCountMap[p.id] || 0,
    choices: p.poll_choices?.sort((a, b) => a.display_order - b.display_order) || [],
    user_voted: userVotedPolls[p.id] || false,
    can_vote: p.visibility === 'public' || (p.visibility === 'authenticated' && isAuthenticated),
    view_only: p.visibility === 'public_view' && !isAuthenticated,
  }));

  const response = NextResponse.json({
    ok: true,
    data: pollsWithCounts,
    isAuthenticated,
  });

  // Add Cache-Control headers
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  return response;
}
