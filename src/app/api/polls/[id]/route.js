import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const supabase = getSupabase();
  const { id } = await params;
  const supporter = await getCurrentSupporter();
  const isAuthenticated = !!supporter;

  // Get poll with choices
  const { data: poll, error } = await supabase
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
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !poll) {
    return NextResponse.json({ ok: false, error: 'Poll not found' }, { status: 404 });
  }

  // Check visibility permissions
  if (poll.visibility === 'authenticated' && !isAuthenticated) {
    return NextResponse.json(
      { ok: false, error: 'Please sign in to view this poll' },
      { status: 401 }
    );
  }

  // Get vote data for results
  const { data: votes, error: votesError } = await supabase
    .from('poll_votes')
    .select('vote_data')
    .eq('poll_id', id);

  if (votesError) {
      // silently ignored
    }

  // Calculate vote counts per choice
  const choiceVotes = {};
  let totalVotes = 0;

  if (votes) {
    totalVotes = votes.length;
    votes.forEach(v => {
      if (poll.poll_type === 'single_choice' && v.vote_data?.choice_id) {
        choiceVotes[v.vote_data.choice_id] = (choiceVotes[v.vote_data.choice_id] || 0) + 1;
      } else if (poll.poll_type === 'multiple_choice' && v.vote_data?.choice_ids) {
        v.vote_data.choice_ids.forEach(cid => {
          choiceVotes[cid] = (choiceVotes[cid] || 0) + 1;
        });
      }
    });
  }

  // Check if current user has voted
  let userVoted = false;
  if (supporter) {
    const { data: userVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id)
      .eq('supporter_id', supporter.id)
      .single();
    userVoted = !!userVote;
  }

  // Get approved comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id, name, display_name, content, created_at, upvotes, downvotes')
    .eq('poll_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (commentsError) {
      // silently ignored
    }

  // Build response
  const choices = poll.poll_choices
    ?.sort((a, b) => a.display_order - b.display_order)
    .map(c => ({
      id: c.id,
      text: c.choice_text,
      votes: choiceVotes[c.id] || 0,
      percentage: totalVotes > 0 ? Math.round((choiceVotes[c.id] || 0) / totalVotes * 100) : 0,
    })) || [];

  return NextResponse.json({
    ok: true,
    data: {
      ...poll,
      choices,
      total_votes: totalVotes,
      comments: comments || [],
      user_voted: userVoted,
      can_vote: poll.visibility === 'public' || (poll.visibility === 'authenticated' && isAuthenticated),
      view_only: poll.visibility === 'public_view' && !isAuthenticated,
    },
    isAuthenticated,
  });
}
