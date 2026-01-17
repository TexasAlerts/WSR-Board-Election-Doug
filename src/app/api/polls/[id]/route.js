import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(request, { params }) {
  const { id } = await params;

  // Get poll with choices
  const { data: poll, error } = await supabase
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
    .eq('id', id)
    .eq('status', 'active')
    .single();

  if (error || !poll) {
    return NextResponse.json({ ok: false, error: 'Poll not found' }, { status: 404 });
  }

  // Get vote data for results
  const { data: votes, error: votesError } = await supabase
    .from('poll_votes')
    .select('vote_data')
    .eq('poll_id', id);

  if (votesError) {
    console.error('Error fetching votes:', votesError);
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

  // Get approved comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id, name, content, created_at')
    .eq('poll_id', id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
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
    },
  });
}
