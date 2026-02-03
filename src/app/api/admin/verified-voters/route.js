import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

/**
 * GET /api/admin/verified-voters
 * List all verified voters with vote counts
 * Query params: status=all|suspended
 */
export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  try {
    const supabase = getSupabase();

    let query = supabase
      .from('verified_voters')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by suspension status
    if (status === 'suspended') {
      query = query.not('suspended_at', 'is', null);
    } else if (status === 'active') {
      query = query.is('suspended_at', null);
    }

    const { data: voters, error } = await query;

    if (error) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Get vote counts for each voter by email
    const voterEmails = voters.map((v) => v.email);
    let voteCounts = {};

    if (voterEmails.length > 0) {
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('voter_email')
        .in('voter_email', voterEmails)
        .is('supporter_id', null); // Only count votes where they weren't fully registered

      if (votes) {
        votes.forEach((v) => {
          voteCounts[v.voter_email] = (voteCounts[v.voter_email] || 0) + 1;
        });
      }
    }

    // Add vote counts to voters
    const votersWithCounts = voters.map((v) => ({
      ...v,
      vote_count: voteCounts[v.email] || 0,
    }));

    return NextResponse.json({ ok: true, data: votersWithCounts });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/verified-voters',
      method: 'GET',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
