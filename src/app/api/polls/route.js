import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET() {
  // Get active polls with their choices
  const { data: polls, error } = await supabase
    .from('polls')
    .select(`
      id,
      title,
      description,
      poll_type,
      status,
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

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  // Get vote counts for each poll
  const pollIds = polls.map(p => p.id);
  const { data: voteCounts, error: voteError } = await supabase
    .from('poll_votes')
    .select('poll_id')
    .in('poll_id', pollIds);

  if (voteError) {
    console.error('Error fetching vote counts:', voteError);
  }

  // Count votes per poll
  const voteCountMap = {};
  if (voteCounts) {
    voteCounts.forEach(v => {
      voteCountMap[v.poll_id] = (voteCountMap[v.poll_id] || 0) + 1;
    });
  }

  // Add vote counts to polls
  const pollsWithCounts = polls.map(p => ({
    ...p,
    vote_count: voteCountMap[p.id] || 0,
    choices: p.poll_choices?.sort((a, b) => a.display_order - b.display_order) || [],
  }));

  return NextResponse.json({ ok: true, data: pollsWithCounts });
}
