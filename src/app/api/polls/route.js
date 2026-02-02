import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getCurrentSupporter } from '../../../lib/auth';

export async function GET(request) {
  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();
  const isAuthenticated = !!supporter;

  // Get active polls with their choices
  let query = supabase
    .from('polls')
    .select(`
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
    `)
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
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  // Get vote counts for each poll
  const pollIds = polls.map(p => p.id);

  if (pollIds.length === 0) {
    return NextResponse.json({ ok: true, data: [] });
  }

  const { data: voteCounts, error: voteError } = await supabase
    .from('poll_votes')
    .select('poll_id')
    .in('poll_id', pollIds);

  if (voteError) {
  }

  // Count votes per poll
  const voteCountMap = {};
  if (voteCounts) {
    voteCounts.forEach(v => {
      voteCountMap[v.poll_id] = (voteCountMap[v.poll_id] || 0) + 1;
    });
  }

  // Check if current user has voted on any polls
  let userVotedPolls = {};
  if (supporter) {
    const { data: userVotes } = await supabase
      .from('poll_votes')
      .select('poll_id')
      .eq('supporter_id', supporter.id)
      .in('poll_id', pollIds);

    if (userVotes) {
      userVotes.forEach(v => {
        userVotedPolls[v.poll_id] = true;
      });
    }
  }

  // Add vote counts and visibility info to polls
  const pollsWithCounts = polls.map(p => ({
    ...p,
    vote_count: voteCountMap[p.id] || 0,
    choices: p.poll_choices?.sort((a, b) => a.display_order - b.display_order) || [],
    user_voted: userVotedPolls[p.id] || false,
    can_vote: p.visibility === 'public' || (p.visibility === 'authenticated' && isAuthenticated),
    view_only: p.visibility === 'public_view' && !isAuthenticated,
  }));

  return NextResponse.json({
    ok: true,
    data: pollsWithCounts,
    isAuthenticated,
  });
}
