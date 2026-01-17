import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();
  const { id } = await params;

  const { data: idea, error } = await supabase
    .from('ideas')
    .select('id, name, category, title, content, status, support_count, upvotes, downvotes, admin_response, created_at')
    .eq('id', id)
    .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
    .eq('is_public', true)
    .single();

  if (error || !idea) {
    return NextResponse.json({ ok: false, error: 'Idea not found' }, { status: 404 });
  }

  // Get user's vote if authenticated
  let userVote = null;
  if (supporter) {
    const { data: vote } = await supabase
      .from('idea_votes')
      .select('vote_type')
      .eq('idea_id', id)
      .eq('supporter_id', supporter.id)
      .single();

    if (vote) {
      userVote = vote.vote_type;
    }
  }

  // Get approved comments with vote info
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('id, name, content, upvotes, downvotes, created_at, supporter_id')
    .eq('idea_id', id)
    .eq('status', 'approved')
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (commentsError) {
    console.error('Error fetching comments:', commentsError);
  }

  // Get user's comment votes and reply counts if authenticated
  let userCommentVotes = {};
  let replyCounts = {};
  if (comments && comments.length > 0) {
    const commentIds = comments.map(c => c.id);

    // Get reply counts
    const { data: replies } = await supabase
      .from('comments')
      .select('parent_id')
      .in('parent_id', commentIds)
      .eq('status', 'approved');

    if (replies) {
      replies.forEach(r => {
        replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1;
      });
    }

    // Get user's votes
    if (supporter) {
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id, vote_type')
        .eq('supporter_id', supporter.id)
        .in('comment_id', commentIds);

      if (votes) {
        votes.forEach(v => {
          userCommentVotes[v.comment_id] = v.vote_type;
        });
      }
    }
  }

  // Add vote info to comments
  const commentsWithVotes = (comments || []).map(c => ({
    ...c,
    user_vote: userCommentVotes[c.id] || null,
    reply_count: replyCounts[c.id] || 0,
    is_own: supporter ? c.supporter_id === supporter.id : false,
  }));

  return NextResponse.json({
    ok: true,
    data: {
      ...idea,
      user_vote: userVote,
      comments: commentsWithVotes,
    },
    isAuthenticated: !!supporter,
  });
}
