/**
 * API Route: Admin Comment Moderation
 *
 * Handles comment moderation queue retrieval and approval/rejection actions.
 * Supports filtering by status and includes contextual information (poll/idea titles).
 * Authentication: Required (admin only)
 * Rate Limit: None
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { sendCommentApprovedEmail, sendCommentRejectedEmail } from '../../../../lib/emailService';
import { notifyParticipantsOfNewComment, notifyParentCommentAuthor } from '../../../../lib/notifications';

/**
 * GET /api/admin/comments
 * Retrieves comments for moderation with contextual information.
 * Returns poll and idea titles for each comment to provide context.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, data: Comment[] }
 *   - 401: { ok: false, error: "Unauthorized" }
 *   - 500: { ok: false, error: "Server error" }
 * @throws {Error} When database query fails
 *
 * Query parameters:
 *   - status: string (optional) - Filter by comment status
 *     Valid values: 'pending', 'approved', 'rejected', 'all'
 *     Default: 'pending'
 *
 * Response data includes:
 *   - Comment fields (id, name, email, content, status, upvotes, downvotes, etc.)
 *   - poll_title: string (if comment is on a poll)
 *   - idea_title: string (if comment is on an idea)
 */
export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  try {
    let query = supabase
      .from('comments')
      .select(`
        id,
        name,
        email,
        content,
        status,
        poll_id,
        idea_id,
        parent_id,
        upvotes,
        downvotes,
        rejection_reason,
        created_at,
        moderated_at,
        supporter_id
      `)
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/comments',
        method: 'GET',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Get poll and idea titles for context to display in moderation interface
    const pollIds = [...new Set(data.filter(c => c.poll_id).map(c => c.poll_id))];
    const ideaIds = [...new Set(data.filter(c => c.idea_id).map(c => c.idea_id))];

    let pollTitles = {};
    let ideaTitles = {};

    if (pollIds.length > 0) {
      const { data: polls } = await supabase
        .from('polls')
        .select('id, title')
        .in('id', pollIds);
      if (polls) {
        polls.forEach(p => pollTitles[p.id] = p.title);
      }
    }

    if (ideaIds.length > 0) {
      const { data: ideas } = await supabase
        .from('ideas')
        .select('id, title')
        .in('id', ideaIds);
      if (ideas) {
        ideas.forEach(i => ideaTitles[i.id] = i.title);
      }
    }

    const commentsWithContext = data.map(c => ({
      ...c,
      poll_title: c.poll_id ? pollTitles[c.poll_id] : null,
      idea_title: c.idea_id ? ideaTitles[c.idea_id] : null,
    }));

    return NextResponse.json({ ok: true, data: commentsWithContext });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/comments',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/comments
 * Approves or rejects a comment and sends notification emails.
 * Triggers participant notifications on approval.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true }
 *   - 400: { ok: false, error: "Validation error message" }
 *   - 401: { ok: false, error: "Unauthorized" }
 *   - 500: { ok: false, error: "Server error" }
 * @throws {Error} When database update fails
 *
 * Request body:
 *   - id: string (required) - Comment UUID
 *   - status: string (required) - New status ('approved' or 'rejected')
 *   - rejection_reason: string (optional) - Reason for rejection (used if status='rejected')
 *
 * Behavior on approval:
 *   - Updates comment status to 'approved'
 *   - Sends approval email to comment author
 *   - Notifies other participants in the discussion
 *   - Notifies parent comment author if it's a reply
 *   - Logs action to audit trail
 *
 * Behavior on rejection:
 *   - Updates comment status to 'rejected'
 *   - Stores rejection reason
 *   - Sends rejection email to comment author
 *   - Logs action to audit trail
 */
export async function PUT(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { id, status, rejection_reason } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Comment ID required' }, { status: 400 });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
    }

    // Get old comment for audit trail and notification emails
    const { data: oldComment } = await supabase
      .from('comments')
      .select('status, name, email, content, poll_id, idea_id')
      .eq('id', id)
      .single();

    const updates = {
      status,
      moderated_at: new Date().toISOString(),
      moderated_by: supporter.id,
    };

    if (status === 'rejected' && rejection_reason) {
      updates.rejection_reason = rejection_reason;
    }

    const { error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id);

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/comments',
        method: 'PUT',
        requestBody: body,
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Log the moderation action
    const eventType = status === 'approved' ? AuditEvents.COMMENT_APPROVED : AuditEvents.COMMENT_REJECTED;

    await logAudit({
      eventType,
      supporterId: supporter.id,
      targetId: id,
      targetType: 'comment',
      oldValues: { status: oldComment?.status },
      newValues: { status, rejection_reason: rejection_reason || null },
      details: {
        commentAuthor: oldComment?.name,
        commentEmail: oldComment?.email,
        commentContent: oldComment?.content?.substring(0, 100),
        pollId: oldComment?.poll_id,
        ideaId: oldComment?.idea_id,
        moderatedBy: `${supporter.first_name} ${supporter.last_name}`,
      },
      request,
      requestBody: body,
      responseStatus: 200,
    });

    // Send notifications (fire-and-forget)
    if (status === 'approved' && oldComment) {
      const contextTitle = oldComment.poll_id
        ? (await supabase.from('polls').select('title').eq('id', oldComment.poll_id).single()).data?.title
        : (await supabase.from('ideas').select('title').eq('id', oldComment.idea_id).single()).data?.title;
      const contextUrl = oldComment.poll_id
        ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dougcharles.com'}/polls/${oldComment.poll_id}`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dougcharles.com'}/ideas/${oldComment.idea_id}`;

      // Notify author of approval
      sendCommentApprovedEmail(
        oldComment.email, oldComment.name,
        oldComment.content.substring(0, 200),
        contextTitle || 'a discussion', contextUrl
      ).catch(() => {});

      // Notify other participants
      const fullComment = { ...oldComment, id, display_name: oldComment.name };
      notifyParticipantsOfNewComment(fullComment)
        .catch(() => {});

      // If it's a reply, notify parent author
      const { data: commentWithParent } = await supabase
        .from('comments')
        .select('parent_id')
        .eq('id', id)
        .single();
      if (commentWithParent?.parent_id) {
        notifyParentCommentAuthor({ ...fullComment, parent_id: commentWithParent.parent_id })
          .catch(() => {});
      }
    } else if (status === 'rejected' && oldComment) {
      sendCommentRejectedEmail(oldComment.email, oldComment.name, rejection_reason || '')
        .catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/comments',
      method: 'PUT',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 400 });
  }
}
