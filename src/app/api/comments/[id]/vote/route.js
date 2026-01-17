import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../../../lib/rateLimit';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../../lib/logging';

// POST: Vote on a comment (up or down)
export async function POST(request, { params }) {
  const supabase = getSupabase();
  const { id: commentId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(`vote-${ip}`, 30, 60000)) {
    return NextResponse.json({ ok: false, error: 'Too many votes. Please wait.' }, { status: 429 });
  }

  const supporter = await getCurrentSupporter();
  if (!supporter) {
    return NextResponse.json({ ok: false, error: 'Please sign in to vote' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const schema = z.object({
      vote_type: z.enum(['up', 'down']),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid vote type' }, { status: 400 });
    }

    const { vote_type } = parsed.data;

    // Check if comment exists
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .select('id, upvotes, downvotes, supporter_id')
      .eq('id', commentId)
      .eq('status', 'approved')
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ ok: false, error: 'Comment not found' }, { status: 404 });
    }

    // Can't vote on your own comment
    if (comment.supporter_id === supporter.id) {
      return NextResponse.json({ ok: false, error: 'Cannot vote on your own comment' }, { status: 400 });
    }

    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('id, vote_type')
      .eq('comment_id', commentId)
      .eq('supporter_id', supporter.id)
      .single();

    let newUpvotes = comment.upvotes;
    let newDownvotes = comment.downvotes;

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Same vote - remove it (toggle off)
        await supabase
          .from('comment_votes')
          .delete()
          .eq('id', existingVote.id);

        if (vote_type === 'up') {
          newUpvotes = Math.max(0, newUpvotes - 1);
        } else {
          newDownvotes = Math.max(0, newDownvotes - 1);
        }
      } else {
        // Different vote - change it
        await supabase
          .from('comment_votes')
          .update({ vote_type })
          .eq('id', existingVote.id);

        if (vote_type === 'up') {
          newUpvotes += 1;
          newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes += 1;
          newUpvotes = Math.max(0, newUpvotes - 1);
        }
      }
    } else {
      // New vote
      const { error: voteError } = await supabase
        .from('comment_votes')
        .insert({
          comment_id: commentId,
          supporter_id: supporter.id,
          vote_type,
        });

      if (voteError) {
        if (voteError.code === '23505') {
          return NextResponse.json({ ok: false, error: 'Already voted' }, { status: 400 });
        }
        console.error('Vote insert error:', voteError);
        return NextResponse.json({ ok: false, error: 'Failed to record vote' }, { status: 500 });
      }

      if (vote_type === 'up') {
        newUpvotes += 1;
      } else {
        newDownvotes += 1;
      }
    }

    // Update comment vote counts
    const { error: updateError } = await supabase
      .from('comments')
      .update({ upvotes: newUpvotes, downvotes: newDownvotes })
      .eq('id', commentId);

    if (updateError) {
      console.error('Vote count update error:', updateError);
    }

    // Get new user vote status
    const { data: newVote } = await supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId)
      .eq('supporter_id', supporter.id)
      .single();

    // Log comment vote
    await logAudit({
      eventType: AuditEvents.COMMENT_VOTE,
      supporterId: supporter.id,
      targetId: commentId,
      targetType: 'comment',
      details: {
        voteType: vote_type,
        previousVote: existingVote?.vote_type || null,
        action: existingVote
          ? existingVote.vote_type === vote_type
            ? 'removed'
            : 'changed'
          : 'added',
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      user_vote: newVote?.vote_type || null,
    });
  } catch (err) {
    console.error('Vote error:', err);
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/comments/${commentId}/vote`,
      method: 'POST',
      userId: supporter?.id,
      userEmail: supporter?.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
