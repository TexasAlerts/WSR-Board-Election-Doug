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

  // Check for authenticated supporter OR verified voter
  const supporter = await getCurrentSupporter();
  let verifiedVoter = null;

  if (!supporter) {
    // Check for verified voter
    try {
      const voterRes = await fetch(new URL('/api/verified-voters/me', request.url), {
        headers: { cookie: request.headers.get('cookie') || '' }
      });
      const voterData = await voterRes.json();
      if (voterData.ok && voterData.data) {
        verifiedVoter = voterData.data;
      }
    } catch (err) {
      // Not a verified voter
    }
  }

  if (!supporter && !verifiedVoter) {
    return NextResponse.json({ ok: false, error: 'Please sign in or verify your email to vote' }, { status: 401 });
  }

  // Determine voter identity
  const voterId = supporter?.id || null;
  const voterEmail = supporter?.email || verifiedVoter?.email || null;

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

    // Can't vote on your own comment (only check for authenticated supporters)
    if (supporter && comment.supporter_id === supporter.id) {
      return NextResponse.json({ ok: false, error: 'Cannot vote on your own comment' }, { status: 400 });
    }

    // Check for existing vote
    let existingVoteQuery = supabase
      .from('comment_votes')
      .select('id, vote_type')
      .eq('comment_id', commentId);

    if (supporter) {
      existingVoteQuery = existingVoteQuery.eq('supporter_id', voterId);
    } else {
      existingVoteQuery = existingVoteQuery.eq('voter_email', voterEmail);
    }

    const { data: existingVote } = await existingVoteQuery.single();

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
      const voteInsert = {
        comment_id: commentId,
        vote_type,
      };

      if (supporter) {
        voteInsert.supporter_id = voterId;
      } else {
        voteInsert.voter_email = voterEmail;
      }

      const { error: voteError } = await supabase
        .from('comment_votes')
        .insert(voteInsert);

      if (voteError) {
        if (voteError.code === '23505') {
          return NextResponse.json({ ok: false, error: 'Already voted' }, { status: 400 });
        }
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
      // silently ignored
    }

    // Get new user vote status
    let newVoteQuery = supabase
      .from('comment_votes')
      .select('vote_type')
      .eq('comment_id', commentId);

    if (supporter) {
      newVoteQuery = newVoteQuery.eq('supporter_id', voterId);
    } else {
      newVoteQuery = newVoteQuery.eq('voter_email', voterEmail);
    }

    const { data: newVote } = await newVoteQuery.single();

    // Log comment vote (only for authenticated supporters)
    if (supporter) {
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
    }

    return NextResponse.json({
      ok: true,
      upvotes: newUpvotes,
      downvotes: newDownvotes,
      user_vote: newVote?.vote_type || null,
    });
  } catch (err) {
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
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}
