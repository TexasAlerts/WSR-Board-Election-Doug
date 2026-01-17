import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../../lib/auth';

// GET: Fetch replies for a comment (recursive threading)
export async function GET(request, { params }) {
  const supabase = getSupabase();
  const { id: parentId } = await params;
  const supporter = await getCurrentSupporter();

  // Get direct replies to this comment
  const { data: replies, error } = await supabase
    .from('comments')
    .select(`
      id,
      name,
      content,
      created_at,
      upvotes,
      downvotes,
      parent_id,
      supporter_id
    `)
    .eq('parent_id', parentId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (replies.length === 0) {
    return NextResponse.json({ ok: true, data: [] });
  }

  // Get user's votes on these replies
  let userVotes = {};
  if (supporter) {
    const replyIds = replies.map(r => r.id);
    const { data: votes } = await supabase
      .from('comment_votes')
      .select('comment_id, vote_type')
      .eq('supporter_id', supporter.id)
      .in('comment_id', replyIds);

    if (votes) {
      votes.forEach(v => {
        userVotes[v.comment_id] = v.vote_type;
      });
    }
  }

  // Get reply counts for each reply (nested replies)
  const replyIds = replies.map(r => r.id);
  let replyCounts = {};
  const { data: nestedReplies } = await supabase
    .from('comments')
    .select('parent_id')
    .eq('status', 'approved')
    .in('parent_id', replyIds);

  if (nestedReplies) {
    nestedReplies.forEach(r => {
      replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1;
    });
  }

  // Add user vote info and reply counts
  const repliesWithVotes = replies.map(r => ({
    ...r,
    user_vote: userVotes[r.id] || null,
    reply_count: replyCounts[r.id] || 0,
    is_own: supporter && r.supporter_id === supporter.id,
  }));

  return NextResponse.json({ ok: true, data: repliesWithVotes });
}
