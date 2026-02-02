import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { getCurrentSupporter } from '../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { sanitizeText } from '../../../lib/sanitize';
import { getUserDisplayName } from '../../../lib/formatDisplayName';

// GET: Fetch comments for a poll or idea
export async function GET(request) {
  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const pollId = searchParams.get('poll_id');
  const ideaId = searchParams.get('idea_id');
  const parentId = searchParams.get('parent_id');

  if (!pollId && !ideaId) {
    return NextResponse.json({ ok: false, error: 'poll_id or idea_id required' }, { status: 400 });
  }

  const supporter = await getCurrentSupporter();

  let query = supabase
    .from('comments')
    .select(`
      id,
      display_name,
      content,
      created_at,
      upvotes,
      downvotes,
      parent_id,
      supporter_id
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (pollId) {
    query = query.eq('poll_id', pollId);
  } else {
    query = query.eq('idea_id', ideaId);
  }

  // Filter by parent_id for threaded replies
  if (parentId) {
    query = query.eq('parent_id', parentId);
  } else {
    query = query.is('parent_id', null); // Top-level comments only
  }

  const { data: comments, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  // Get user's votes on these comments
  let userVotes = {};
  if (supporter && comments.length > 0) {
    const commentIds = comments.map(c => c.id);
    const { data: votes } = await supabase
      .from('comment_votes')
      .select('comment_id, vote_type')
      .eq('supporter_id', supporter.id)
      .in('comment_id', commentIds);

    if (votes) {
      votes.forEach(v => {
        userVotes[v.comment_id] = v.vote_type;
      });
    }
  }

  // Get reply counts for each comment
  const commentIds = comments.map(c => c.id);
  let replyCounts = {};
  if (commentIds.length > 0) {
    const { data: replies } = await supabase
      .from('comments')
      .select('parent_id')
      .eq('status', 'approved')
      .in('parent_id', commentIds);

    if (replies) {
      replies.forEach(r => {
        replyCounts[r.parent_id] = (replyCounts[r.parent_id] || 0) + 1;
      });
    }
  }

  // Add user vote info and reply counts to comments
  const commentsWithVotes = comments.map(c => ({
    ...c,
    user_vote: userVotes[c.id] || null,
    reply_count: replyCounts[c.id] || 0,
    is_own: supporter && c.supporter_id === supporter.id,
  }));

  return NextResponse.json({ ok: true, data: commentsWithVotes });
}

// POST: Create a new comment (supporters only)
export async function POST(request) {
  const supabase = getSupabase();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(`comment-${ip}`, 10, 60000)) {
    return NextResponse.json({ ok: false, error: 'Too many comments. Please wait.' }, { status: 429 });
  }

  const supporter = await getCurrentSupporter();
  if (!supporter) {
    return NextResponse.json({ ok: false, error: 'Please sign in to comment' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const schema = z.object({
      poll_id: z.string().uuid().optional(),
      idea_id: z.string().uuid().optional(),
      parent_id: z.string().uuid().optional(),
      content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment too long'),
    }).refine(data => data.poll_id || data.idea_id, {
      message: 'poll_id or idea_id required',
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { poll_id, idea_id, parent_id, content: rawContent } = parsed.data;
    const content = sanitizeText(rawContent);

    // Verify parent comment exists if replying
    if (parent_id) {
      const { data: parentComment } = await supabase
        .from('comments')
        .select('id, poll_id, idea_id')
        .eq('id', parent_id)
        .eq('status', 'approved')
        .single();

      if (!parentComment) {
        return NextResponse.json({ ok: false, error: 'Parent comment not found' }, { status: 404 });
      }

      // Ensure reply is on the same poll/idea as parent
      if (poll_id && parentComment.poll_id !== poll_id) {
        return NextResponse.json({ ok: false, error: 'Invalid parent comment' }, { status: 400 });
      }
      if (idea_id && parentComment.idea_id !== idea_id) {
        return NextResponse.json({ ok: false, error: 'Invalid parent comment' }, { status: 400 });
      }
    }

    // Insert comment
    const displayName = getUserDisplayName(supporter);
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        poll_id: poll_id || null,
        idea_id: idea_id || null,
        parent_id: parent_id || null,
        supporter_id: supporter.id,
        name: `${supporter.first_name} ${supporter.last_name}`,
        email: supporter.email,
        display_name: displayName,
        content: content.trim(),
        status: 'pending', // Requires moderation
        upvotes: 0,
        downvotes: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Comment insert error:', error);
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/comments',
        method: 'POST',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Failed to post comment' }, { status: 500 });
    }

    // Log comment creation
    const targetType = poll_id ? 'poll' : 'idea';
    await logAudit({
      eventType: AuditEvents.COMMENT_CREATED,
      supporterId: supporter.id,
      targetId: comment.id,
      targetType: 'comment',
      details: {
        onType: targetType,
        onId: poll_id || idea_id,
        isReply: !!parent_id,
        contentPreview: content.trim().substring(0, 100),
      },
      request,
      responseStatus: 201,
    });

    // Notify admin
    sendNotificationEmail(
      `New ${parent_id ? 'reply' : 'comment'} pending approval`,
      `From: ${supporter.first_name} ${supporter.last_name} (${supporter.email})\nOn: ${targetType}\nContent: ${content.trim()}`
    ).catch(err => console.error('Admin email failed:', err));

    return NextResponse.json({
      ok: true,
      message: 'Comment submitted for approval',
      data: comment,
    }, { status: 201 });
  } catch (err) {
    console.error('Comment error:', err);
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/comments',
      method: 'POST',
      userId: supporter?.id,
      userEmail: supporter?.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}
