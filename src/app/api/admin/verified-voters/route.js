import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logAudit, AuditEvents } from '../../../../lib/logging';

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

    // Get vote counts for each voter
    const voterIds = voters.map(v => v.id);
    let voteCounts = {};

    if (voterIds.length > 0) {
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('verified_voter_id')
        .in('verified_voter_id', voterIds);

      if (votes) {
        votes.forEach(v => {
          voteCounts[v.verified_voter_id] = (voteCounts[v.verified_voter_id] || 0) + 1;
        });
      }
    }

    // Add vote counts to voters
    const votersWithCounts = voters.map(v => ({
      ...v,
      vote_count: voteCounts[v.id] || 0,
    }));

    return NextResponse.json({ ok: true, data: votersWithCounts });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
