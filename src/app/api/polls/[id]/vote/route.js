import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter } from '../../../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../../../lib/rateLimit';
import { sendNotificationEmail } from '../../../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../../lib/logging';
import { getUserDisplayName } from '../../../../../lib/formatDisplayName';
import {
  generateAnonymousVoterFingerprint,
  generateAnonymousVoterToken,
  ANONYMOUS_VOTER_COOKIE,
  ANONYMOUS_VOTER_COOKIE_OPTIONS,
} from '../../../../../lib/anonymousVoting';

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

    // Schema for voting - email/name optional for anonymous voting
    const schema = isAuthenticated
      ? z.object({
          choice_id: z.string().uuid().optional(),
          choice_ids: z.array(z.string().uuid()).optional(),
          rankings: z.array(z.string().uuid()).optional(),
          comment: z.string().max(2000).optional(),
          other_text: z.string().max(500).optional(),
        })
      : z.object({
          email: z.string().email('Valid email required').optional(),
          name: z.string().min(1, 'Name required').max(200).optional(),
          choice_id: z.string().uuid().optional(),
          choice_ids: z.array(z.string().uuid()).optional(),
          rankings: z.array(z.string().uuid()).optional(),
          comment: z.string().max(2000).optional(),
          other_text: z.string().max(500).optional(),
        });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { email, name, choice_id, choice_ids, rankings, comment, other_text } = parsed.data;

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

    // Determine voter identity and voting mode
    let voterId;
    let voterEmail;
    let voterName;
    let isAnonymous = false;
    let anonymousVoterToken = null;
    let anonymousVoterFingerprint = null;

    if (isAuthenticated) {
      // Fully registered supporter
      voterId = supporter.id;
      voterEmail = supporter.email;
      voterName = `${supporter.first_name} ${supporter.last_name}`;
    } else if (email && name) {
      // Has provided email/name - check if verified voter
      voterEmail = email.toLowerCase();
      voterName = name;

      const { data: verifiedVoter } = await supabase
        .from('verified_voters')
        .select('id, verified_at')
        .eq('email', voterEmail)
        .single();

      if (!verifiedVoter || !verifiedVoter.verified_at) {
        // Email not verified yet
        return NextResponse.json(
          { ok: false, error: 'Please verify your email first', requiresVerification: true },
          { status: 400 }
        );
      }
    } else {
      // Anonymous voting - no email/name provided
      isAnonymous = true;

      // Get or generate anonymous voter token from cookie
      const cookies = request.headers.get('cookie') || '';
      const cookieMatch = cookies.match(new RegExp(`${ANONYMOUS_VOTER_COOKIE}=([^;]+)`));
      anonymousVoterToken = cookieMatch ? cookieMatch[1] : generateAnonymousVoterToken();

      // Generate browser fingerprint for additional duplicate prevention
      const userAgent = request.headers.get('user-agent') || '';
      anonymousVoterFingerprint = generateAnonymousVoterFingerprint(ip, userAgent);
    }

    // Check if already voted
    let existingVoteQuery = supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', id);

    if (isAuthenticated) {
      // Check by supporter_id
      existingVoteQuery = existingVoteQuery.eq('supporter_id', voterId);
    } else if (isAnonymous) {
      // Check by anonymous token OR fingerprint (either match = already voted)
      existingVoteQuery = existingVoteQuery.or(`anonymous_voter_token.eq.${anonymousVoterToken},anonymous_voter_fingerprint.eq.${anonymousVoterFingerprint}`);
    } else {
      // Check by verified voter email
      existingVoteQuery = existingVoteQuery.eq('voter_email', voterEmail);
    }

    const { data: existingVote } = await existingVoteQuery.single();

    if (existingVote) {
      return NextResponse.json(
        { ok: false, error: 'You have already voted on this poll' },
        { status: 400 }
      );
    }

    // Validate "Other" option: if choice is an "Other" option, other_text is required
    if (choice_id) {
      const { data: choiceData } = await supabase
        .from('poll_choices')
        .select('is_other_option')
        .eq('id', choice_id)
        .single();

      if (choiceData?.is_other_option && (!other_text || !other_text.trim())) {
        return NextResponse.json({ ok: false, error: 'Please specify your "Other" answer' }, { status: 400 });
      }
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
      vote_data = { rankings };
    }

    // Insert vote
    const voteRecord = {
      poll_id: id,
      vote_data,
      ip_address: ip,
      other_text: other_text?.trim() || null,
    };

    if (isAuthenticated) {
      voteRecord.supporter_id = voterId;
      voteRecord.voter_email = voterEmail;
    } else if (isAnonymous) {
      // Anonymous vote - store token and fingerprint for duplicate prevention
      voteRecord.anonymous_voter_token = anonymousVoterToken;
      voteRecord.anonymous_voter_fingerprint = anonymousVoterFingerprint;
    } else {
      // Verified voter (has email but not fully registered)
      voteRecord.voter_email = voterEmail;
    }

    const { error: voteError } = await supabase
      .from('poll_votes')
      .insert(voteRecord);

    if (voteError) {
      if (voteError.code === '23505') {
        return NextResponse.json({ ok: false, error: 'You have already voted' }, { status: 400 });
      }
      return NextResponse.json({ ok: false, error: 'Failed to record vote' }, { status: 500 });
    }

    // Set anonymous voter cookie if this was an anonymous vote
    const response = NextResponse.json({ ok: true }, { status: 201 });
    if (isAnonymous) {
      response.cookies.set(ANONYMOUS_VOTER_COOKIE, anonymousVoterToken, ANONYMOUS_VOTER_COOKIE_OPTIONS);
    }

    // Insert comment if provided and user is a registered supporter
    if (comment && comment.trim() && poll.allow_comments && isAuthenticated) {
      const displayName = getUserDisplayName(supporter);
      const commentRecord = {
        poll_id: id,
        content: comment.trim(),
        status: 'pending',
        supporter_id: voterId,
        name: voterName,
        email: voterEmail,
        display_name: displayName,
      };

      const { error: commentError } = await supabase
        .from('comments')
        .insert(commentRecord);

      if (commentError) {
      // silently ignored
    } else {
        await logAudit({
          eventType: AuditEvents.COMMENT_CREATED,
          supporterId: voterId,
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
        ).catch(() => {});
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
        voterName: voterName || 'Anonymous',
        voterEmail: voterEmail || null,
        isAuthenticated,
        isAnonymous,
        otherText: other_text?.trim() || null,
      },
      request,
      responseStatus: 201,
    });

    return response;
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/polls/${id}/vote`,
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}
