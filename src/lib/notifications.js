/**
 * Notification orchestration module.
 * Handles triggering email notifications for comments, replies, and participant updates.
 * Respects user notification preferences and unsubscribe tokens.
 *
 * @module notifications
 */

import { getSupabase } from './supabase';
import { sendNewCommentNotificationEmail, sendNewReplyNotificationEmail } from './emailService';
import { getUserDisplayName } from './formatDisplayName';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dougcharles.com';

/**
 * Notify all participants when a new comment is approved on a poll or idea.
 * Finds voters and commenters, checks their notification preferences, and sends emails.
 * Excludes the comment author from notifications.
 *
 * @param {Object} comment - The approved comment object
 * @param {string} comment.poll_id - Poll ID if comment is on a poll
 * @param {string} comment.idea_id - Idea ID if comment is on an idea
 * @param {string} comment.email - Email of comment author (excluded from notifications)
 * @param {string} comment.display_name - Display name of commenter
 * @param {string} comment.name - Full name of commenter
 * @param {string} comment.content - Comment content
 * @returns {Promise<void>}
 *
 * @example
 * // After approving a comment
 * await notifyParticipantsOfNewComment(approvedComment);
 */
export async function notifyParticipantsOfNewComment(comment) {
  const supabase = getSupabase();
  const contextType = comment.poll_id ? 'poll' : 'idea';
  const contextId = comment.poll_id || comment.idea_id;

  // Get context title
  let contextTitle = '';
  let contextUrl = '';
  if (comment.poll_id) {
    const { data: poll } = await supabase.from('polls').select('title').eq('id', comment.poll_id).single();
    contextTitle = poll?.title || 'a poll';
    contextUrl = `${SITE_URL}/polls/${comment.poll_id}`;
  } else {
    const { data: idea } = await supabase.from('ideas').select('title').eq('id', comment.idea_id).single();
    contextTitle = idea?.title || 'an idea';
    contextUrl = `${SITE_URL}/ideas/${comment.idea_id}`;
  }

  // Find all participants (voters + commenters) excluding the comment author
  const participantEmails = new Set();

  if (comment.poll_id) {
    const { data: voters } = await supabase
      .from('poll_votes')
      .select('voter_email')
      .eq('poll_id', contextId);
    voters?.forEach(v => { if (v.voter_email) participantEmails.add(v.voter_email); });
  }

  // Add commenters on this poll/idea
  const commentFilter = comment.poll_id ? { poll_id: contextId } : { idea_id: contextId };
  const { data: commenters } = await supabase
    .from('comments')
    .select('email')
    .match(commentFilter)
    .eq('status', 'approved');
  commenters?.forEach(c => { if (c.email) participantEmails.add(c.email); });

  // Remove the comment author
  participantEmails.delete(comment.email);

  if (participantEmails.size === 0) return;

  // Check notification preferences for each
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('email, email_on_new_comment, unsubscribe_token')
    .in('email', Array.from(participantEmails));

  const prefsMap = {};
  prefs?.forEach(p => { prefsMap[p.email] = p; });

  const commenterName = comment.display_name || getUserDisplayName({ name: comment.name });
  const preview = comment.content.substring(0, 200);

  for (const email of participantEmails) {
    const pref = prefsMap[email];
    // Skip if explicitly opted out
    if (pref && pref.email_on_new_comment === false) continue;

    const token = pref?.unsubscribe_token || '';
    sendNewCommentNotificationEmail(email, commenterName, preview, contextTitle, contextUrl, token)
      .catch(() => {});
  }
}

/**
 * Notify the author of a parent comment when someone replies to it.
 * Checks notification preferences and only sends if user hasn't opted out.
 * Does not notify if replier is the same as parent author.
 *
 * @param {Object} replyComment - The approved reply comment object
 * @param {string} replyComment.parent_id - ID of parent comment being replied to
 * @param {string} replyComment.email - Email of reply author
 * @param {string} replyComment.display_name - Display name of replier
 * @param {string} replyComment.name - Full name of replier
 * @param {string} replyComment.content - Reply content
 * @returns {Promise<void>}
 *
 * @example
 * // After approving a reply comment
 * await notifyParentCommentAuthor(replyComment);
 */
export async function notifyParentCommentAuthor(replyComment) {
  if (!replyComment.parent_id) return;

  const supabase = getSupabase();

  const { data: parent } = await supabase
    .from('comments')
    .select('email, name, display_name, content, poll_id, idea_id')
    .eq('id', replyComment.parent_id)
    .single();

  if (!parent || parent.email === replyComment.email) return;

  // Check notification preference
  const { data: pref } = await supabase
    .from('notification_preferences')
    .select('email_on_new_reply, unsubscribe_token')
    .eq('email', parent.email)
    .single();

  if (pref && pref.email_on_new_reply === false) return;

  let contextUrl = SITE_URL;
  if (parent.poll_id) contextUrl = `${SITE_URL}/polls/${parent.poll_id}`;
  else if (parent.idea_id) contextUrl = `${SITE_URL}/ideas/${parent.idea_id}`;

  const replierName = replyComment.display_name || getUserDisplayName({ name: replyComment.name });
  const replyPreview = replyComment.content.substring(0, 200);
  const parentPreview = parent.content.substring(0, 200);
  const token = pref?.unsubscribe_token || '';

  sendNewReplyNotificationEmail(parent.email, replierName, replyPreview, parentPreview, contextUrl, token)
    .catch(() => {});
}
