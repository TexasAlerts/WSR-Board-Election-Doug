import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../../../lib/rateLimit';
import { sendNotificationEmail } from '../../../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../../lib/logging';

export async function POST(request, { params }) {
  const supabase = getSupabase();
  const { id } = await params;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    // Check if user is authenticated
    const supporter = await getCurrentSupporter();
    const isAuthenticated = !!supporter;

    const body = await request.json();

    // Schema depends on whether user is authenticated
    const schema = isAuthenticated
      ? z.object({
          choice_id: z.string().uuid().optional(),
          choice_ids: z.array(z.string().uuid()).optional(),
          rankings: z.array(z.string().uuid()).optional(),
          comment: z.string().max(2000).optional(),
        })
      : z.object({
          email: z.string().email('Valid email required'),
          name: z.string().min(1, 'Name required').max(200),
          choice_id: z.string().uuid().optional(),
          choice_ids: z.array(z.string().uuid()).optional(),
          rankings: z.array(z.string().uuid()).optional(),
          comment: z.string().max(2000).optional(),
        });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { email, name, choice_id, choice_ids, rankings, comment } = parsed.data;

    // Check if poll exists and is active
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('id, title, poll_type, status, visibility, allow_comments')
      .eq('id', id)
      .single();

    if (pollError || !poll || poll.status !== 'active') {
      return NextResponse.json({ ok: false, error: 'Poll not available' }, { status: 400 });
    }

    // Check visibility permissions
    if (poll.visibility === 'authenticated' && !isAuthenticated) {
      return NextResponse.json(
        { ok: false, error: 'Please sign in to vote on this poll' },
        { status: 401 }
      );
    }

    if (poll.visibility === 'public_view') {
      return NextResponse.json(
        { ok: false, error: 'This poll is view-only' },
        { status: 403 }
      );
    }

    // Determine voter identity
    let voterId;
    let voterEmail;
    let voterName;

    if (isAuthenticated) {
      voterId = supporter.id;
      voterEmail = supporter.email;
      voterName = `${supporter.first_name} ${supporter.last_name}`;
    } else {
      // Public poll - check for verified voter or create one
      voterEmail = email.toLowerCase();
      voterName = name;

      // Check if email is verified for public polls
      const { data: verifiedVoter } = await supabase
        .from('verified_voters')
        .select('id, verified_at')
        .eq('email', voterEmail)
        .single();

      if (!verifiedVoter || !verifiedVoter.verified_at) {
        // For now, allow voting without email verification
        // In production, you might want to require verification
        // return NextResponse.json(
        //   { ok: false, error: 'Please verify your email first', requiresVerification: true },
        //   { status: 400 }
        // );
      }
    }

    // Check if already voted
    let existingVoteQuery = supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id);

    if (isAuthenticated) {
      existingVoteQuery = existingVoteQuery.eq('supporter_id', voterId);
    } else {
      existingVoteQuery = existingVoteQuery.eq('voter_email', voterEmail);
    }

    const { data: existingVote } = await existingVoteQuery.single();

    if (existingVote) {
      return NextResponse.json(
        { ok: false, error: 'You have already voted on this poll' },
        { status: 400 }
      );
    }

    // Build vote data
    let vote_data;
    if (poll.poll_type === 'single_choice') {
      if (!choice_id) {
        return NextResponse.json({ ok: false, error: 'Please select an option' }, { status: 400 });
      }
      vote_data = { choice_id };
    } else if (poll.poll_type === 'multiple_choice') {
      if (!choice_ids || choice_ids.length === 0) {
        return NextResponse.json({ ok: false, error: 'Please select at least one option' }, { status: 400 });
      }
      vote_data = { choice_ids };
    } else if (poll.poll_type === 'ranked_choice') {
      if (!rankings || rankings.length === 0) {
        return NextResponse.json({ ok: false, error: 'Please rank your choices' }, { status: 400 });
      }
      // Store rankings as array of choice_ids in preference order (index 0 = 1st choice)
      vote_data = { rankings };
    }

    // Insert vote
    const voteRecord = {
      poll_id: id,
      vote_data,
      ip_address: ip,
    };

    if (isAuthenticated) {
      voteRecord.supporter_id = voterId;
      voteRecord.voter_email = voterEmail;
    } else {
      voteRecord.voter_email = voterEmail;
    }

    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert(voteRecord);

    if (voteError) {
      if (voteError.code === '23505') {
        return NextResponse.json({ ok: false, error: 'You have already voted' }, { status: 400 });
      }
      console.error('Vote insert error:', voteError);
      return NextResponse.json({ ok: false, error: 'Failed to record vote' }, { status: 500 });
    }

    // Insert comment if provided (supporters only for authenticated polls)
    if (comment && comment.trim() && poll.allow_comments) {
      const commentRecord = {
        poll_id: id,
        content: comment.trim(),
        status: 'pending',
      };

      if (isAuthenticated) {
        commentRecord.supporter_id = voterId;
        commentRecord.name = voterName;
        commentRecord.email = voterEmail;
      } else {
        commentRecord.name = voterName;
        commentRecord.email = voterEmail;
      }

      const { error: commentError } = await supabase
        .from('comments')
        .insert(commentRecord);

      if (commentError) {
        console.error('Error saving comment:', commentError);
      } else {
        // Log comment creation
        await logAudit({
          eventType: AuditEvents.COMMENT_CREATED,
          supporterId: isAuthenticated ? voterId : null,
          targetId: id,
          targetType: 'poll',
          details: {
            pollTitle: poll.title,
            voterName,
            voterEmail,
            contentPreview: comment.trim().substring(0, 100),
          },
          request,
          responseStatus: 201,
        });

        sendNotificationEmail(
          'New poll comment submitted',
          `Poll: ${poll.title}\nName: ${voterName}\nEmail: ${voterEmail}\nComment: ${comment.trim()}`
        ).catch(err => console.error('Admin email failed:', err));
      }
    }

    // Log poll vote
    await logAudit({
      eventType: AuditEvents.POLL_VOTE,
      supporterId: isAuthenticated ? voterId : null,
      targetId: id,
      targetType: 'poll',
      details: {
        pollTitle: poll.title,
        pollType: poll.poll_type,
        voterName,
        voterEmail,
        isAuthenticated,
      },
      request,
      responseStatus: 201,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Vote error:', err);
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/polls/${id}/vote`,
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
