import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../../../lib/rateLimit';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../../lib/logging';

// POST: Vote on an idea (up or down) - supporters only
export async function POST(request, { params }) {
  const supabase = getSupabase();
  const { id: ideaId } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(`idea-vote-${ip}`, 30, 60000)) {
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

    // Check if idea exists
    const { data: idea, error: ideaError } = await supabase
      .from('ideas')
      .select('id, upvotes, downvotes')
      .eq('id', ideaId)
      .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ ok: false, error: 'Idea not found' }, { status: 404 });
    }

    // Check for existing vote
    const { data: existingVote } = await supabase
      .from('idea_votes')
      .select('id, vote_type')
      .eq('idea_id', ideaId)
      .eq('supporter_id', supporter.id)
      .single();

    let newUpvotes = idea.upvotes || 0;
    let newDownvotes = idea.downvotes || 0;

    if (existingVote) {
      if (existingVote.vote_type === vote_type) {
        // Same vote - remove it (toggle off)
        await supabase
          .from('idea_votes')
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
          .from('idea_votes')
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
        .from('idea_votes')
        .insert({
          idea_id: ideaId,
          supporter_id: supporter.id,
          vote_type,
        });

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

    // Update idea vote counts
    const { error: updateError } = await supabase
      .from('ideas')
      .update({ upvotes: newUpvotes, downvotes: newDownvotes })
      .eq('id', ideaId);

    if (updateError) {
    }

    // Get new user vote status
    const { data: newVote } = await supabase
      .from('idea_votes')
      .select('vote_type')
      .eq('idea_id', ideaId)
      .eq('supporter_id', supporter.id)
      .single();

    // Log idea vote
    await logAudit({
      eventType: AuditEvents.IDEA_VOTE,
      supporterId: supporter.id,
      targetId: ideaId,
      targetType: 'idea',
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
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/ideas/${ideaId}/vote`,
      method: 'POST',
      userId: supporter?.id,
      userEmail: supporter?.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}
