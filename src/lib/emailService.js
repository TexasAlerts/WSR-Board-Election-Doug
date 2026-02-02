/**
 * Email service module using Resend API.
 * Handles transactional emails including verification, notifications, and broadcasts.
 * Uses lazy initialization of the Resend client to avoid build-time errors.
 *
 * @module emailService
 * @requires RESEND_API_KEY environment variable
 */

import { Resend } from 'resend';

let resendClient = null;

/**
 * Get the singleton Resend client instance.
 * Lazily initializes the client on first use.
 *
 * @private
 * @returns {Resend|null} Resend client if API key is configured, null otherwise
 */
function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = 'Doug Charles Campaign <noreply@dougcharles.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dougcharles.com';

/**
 * Send an email verification message to a new supporter.
 * Includes a link to verify email and create password.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient's first name for personalization
 * @param {string} token - Verification token to include in the link
 * @returns {Promise<{success: boolean, error?: string, id?: string}>} Result with success status and message ID
 *
 * @example
 * const result = await sendVerificationEmail(
 *   supporter.email,
 *   supporter.first_name,
 *   verificationToken
 * );
 */
export async function sendVerificationEmail(email, name, token) {
  const client = getResendClient();
  if (!client) {
    return { success: false, error: 'Email service not configured' };
  }

  const verifyUrl = `${SITE_URL}/auth/verify?token=${token}`;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email - Doug Charles for Prosper',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Welcome, ${name}!</h2>
          <p>Thank you for signing up as a supporter. Please verify your email address to continue.</p>
          <p style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #c41e3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email & Create Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 24 hours. If you didn't sign up, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Doug Charles for Prosper Town Council<br>
            <a href="${SITE_URL}" style="color: #1e3a5f;">www.dougcharles.com</a>
          </p>
        </div>
      `,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send a password reset email with a time-limited reset link.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient's first name for personalization
 * @param {string} token - Password reset token to include in the link
 * @returns {Promise<{success: boolean, error?: string, id?: string}>} Result with success status and message ID
 *
 * @example
 * const result = await sendPasswordResetEmail(
 *   supporter.email,
 *   supporter.first_name,
 *   resetToken
 * );
 */
export async function sendPasswordResetEmail(email, name, token) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your password - Doug Charles for Prosper',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Password Reset Request</h2>
          <p>Hi ${name}, we received a request to reset your password.</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #1e3a5f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 1 hour. If you didn't request this, you can ignore this email.
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send a welcome email after a supporter account is approved.
 * Includes information about supporter benefits and next steps.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient's first name for personalization
 * @returns {Promise<{success: boolean, error?: string, id?: string}>} Result with success status and message ID
 *
 * @example
 * await sendWelcomeEmail(supporter.email, supporter.first_name);
 */
export async function sendWelcomeEmail(email, name) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to Doug Charles for Prosper!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Welcome, ${name}!</h2>
          <p>Your account has been verified and you're now an official supporter!</p>
          <p>As a supporter, you can:</p>
          <ul>
            <li>Vote on all polls (public and supporter-only)</li>
            <li>Comment on polls and ideas</li>
            <li>Submit and vote on community ideas</li>
            <li>Receive campaign updates</li>
          </ul>
          <p style="margin: 30px 0;">
            <a href="${SITE_URL}/polls" style="background-color: #c41e3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Active Polls
            </a>
          </p>
          <p>Thank you for your support!</p>
          <p><strong>Doug Charles</strong><br>Candidate for Prosper Town Council, Place 5</p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Notify a user that their comment has been approved and is now visible.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient's first name for personalization
 * @param {string} commentPreview - Preview of the approved comment (truncated)
 * @param {string} contextTitle - Title of the poll or idea commented on
 * @param {string} contextUrl - URL to view the comment in context
 * @returns {Promise<{success: boolean, error?: string, id?: string}>} Result with success status and message ID
 *
 * @example
 * await sendCommentApprovedEmail(
 *   comment.email,
 *   comment.name,
 *   comment.content.substring(0, 100),
 *   poll.title,
 *   `/polls/${poll.id}`
 * );
 */
export async function sendCommentApprovedEmail(email, name, commentPreview, contextTitle, contextUrl) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your comment has been approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Comment Approved</h2>
          <p>Hi ${name}, your comment on "${contextTitle}" has been approved and is now visible.</p>
          <blockquote style="border-left: 3px solid #1e3a5f; padding-left: 15px; color: #666; margin: 20px 0;">
            "${commentPreview}"
          </blockquote>
          <p>
            <a href="${contextUrl}" style="color: #1e3a5f;">View the discussion</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Notify a user that their comment was not approved for posting.
 *
 * @param {string} email - Recipient email address
 * @param {string} name - Recipient's first name for personalization
 * @param {string} reason - Optional reason for rejection
 * @returns {Promise<{success: boolean, error?: string, id?: string}>} Result with success status and message ID
 *
 * @example
 * await sendCommentRejectedEmail(
 *   comment.email,
 *   comment.name,
 *   'Comment contained inappropriate content'
 * );
 */
export async function sendCommentRejectedEmail(email, name, reason) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Comment not approved',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Comment Not Approved</h2>
          <p>Hi ${name}, your recent comment was not approved for posting.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>If you have questions, please contact us.</p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send phone update reminder email (sent when user skips phone verification)
 */
export async function sendPhoneUpdateReminderEmail(email, name) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Update Your Phone Number - Doug Charles for Prosper',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Update Your Phone Number</h2>
          <p>Hi ${name},</p>
          <p>Welcome to the campaign! You skipped phone verification during signup. To stay informed on polls, comments, and ideas via text message, we recommend updating your phone to a cell number.</p>
          <p style="margin: 30px 0;">
            <a href="${SITE_URL}/settings" style="background-color: #c41e3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Update Phone Number
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            You can update your phone number and verify it anytime in your <a href="${SITE_URL}/settings" style="color: #1e3a5f;">account settings</a>.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Doug Charles for Prosper Town Council<br>
            <a href="${SITE_URL}" style="color: #1e3a5f;">www.dougcharles.com</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send admin notification for new registration
 */
export async function sendAdminNewRegistrationEmail(supporter) {
  const client = getResendClient();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!client || !adminEmail) return { success: false, error: 'Not configured' };

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New Supporter: ${supporter.first_name} ${supporter.last_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">New Supporter Registration</h2>
          <p><strong>Name:</strong> ${supporter.first_name} ${supporter.last_name}</p>
          <p><strong>Email:</strong> ${supporter.email}</p>
          <p><strong>Phone:</strong> ${supporter.phone}</p>
          <p><strong>Address:</strong> ${supporter.street_address}, ${supporter.city}, ${supporter.state} ${supporter.zip_code}</p>
          <p><strong>Status:</strong> ${supporter.status}</p>
          <p>
            <a href="${SITE_URL}/admin/supporters" style="color: #1e3a5f;">View in Admin Panel</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send admin notification for pending comment
 */
export async function sendAdminPendingCommentEmail(comment, contextTitle) {
  const client = getResendClient();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!client || !adminEmail) return { success: false, error: 'Not configured' };

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New Comment Pending: ${contextTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Comment Awaiting Moderation</h2>
          <p><strong>On:</strong> ${contextTitle}</p>
          <p><strong>From:</strong> ${comment.name} (${comment.email})</p>
          <blockquote style="border-left: 3px solid #1e3a5f; padding-left: 15px; color: #666; margin: 20px 0;">
            "${comment.content}"
          </blockquote>
          <p>
            <a href="${SITE_URL}/admin/comments" style="background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Comment
            </a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send voter email verification (lightweight, no account needed)
 */
export async function sendVoterVerificationEmail(email, name, token) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  const verifyUrl = `${SITE_URL}/auth/verify-voter?token=${token}`;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your email to vote - Doug Charles for Prosper',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Hi ${name}!</h2>
          <p>Thank you for wanting to participate in our community polls. Please verify your email to cast your vote.</p>
          <p style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #c41e3a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email & Vote
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link expires in 24 hours. If you didn't request this, you can ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            Doug Charles for Prosper Town Council<br>
            <a href="${SITE_URL}" style="color: #1e3a5f;">www.dougcharles.com</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send new comment notification to poll/idea participants
 */
export async function sendNewCommentNotificationEmail(email, commenterName, commentPreview, contextTitle, contextUrl, unsubscribeToken) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  const unsubscribeUrl = `${SITE_URL}/notifications/unsubscribe?token=${unsubscribeToken}&type=email_on_new_comment`;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `New comment on "${contextTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">New Comment</h2>
          <p>${commenterName} commented on "${contextTitle}":</p>
          <blockquote style="border-left: 3px solid #1e3a5f; padding-left: 15px; color: #666; margin: 20px 0;">
            "${commentPreview}"
          </blockquote>
          <p>
            <a href="${contextUrl}" style="background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Discussion
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from comment notifications</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send reply notification to parent comment author
 */
export async function sendNewReplyNotificationEmail(email, replierName, replyPreview, parentPreview, contextUrl, unsubscribeToken) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  const unsubscribeUrl = `${SITE_URL}/notifications/unsubscribe?token=${unsubscribeToken}&type=email_on_new_reply`;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Someone replied to your comment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">New Reply</h2>
          <p>${replierName} replied to your comment:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">Your comment:</p>
            <p style="color: #666; margin: 0;">"${parentPreview}"</p>
          </div>
          <div style="background: #f0f7ff; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="color: #999; font-size: 13px; margin: 0 0 8px 0;">${replierName}'s reply:</p>
            <p style="color: #333; margin: 0;">"${replyPreview}"</p>
          </div>
          <p>
            <a href="${contextUrl}" style="background-color: #1e3a5f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Reply
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from reply notifications</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigestEmail(email, name, digestData, unsubscribeToken) {
  const client = getResendClient();
  if (!client) return { success: false, error: 'Email service not configured' };

  const unsubscribeUrl = `${SITE_URL}/notifications/unsubscribe?token=${unsubscribeToken}&type=email_on_weekly_digest`;

  const pollItems = (digestData.polls || []).map(p =>
    `<li><strong>${p.title}</strong> — ${p.newVotes} new vote${p.newVotes !== 1 ? 's' : ''}, ${p.totalVotes} total</li>`
  ).join('');

  const ideaItems = (digestData.ideas || []).map(i =>
    `<li><strong>${i.title}</strong> — ${i.newVotes} new vote${i.newVotes !== 1 ? 's' : ''}</li>`
  ).join('');

  const commentCount = digestData.newComments || 0;

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Weekly Activity Digest - Doug Charles for Prosper',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">Weekly Digest</h2>
          <p>Hi ${name}, here's what happened this week on polls and ideas you participated in:</p>
          ${pollItems ? `<h3 style="color: #1e3a5f;">Polls</h3><ul>${pollItems}</ul>` : ''}
          ${ideaItems ? `<h3 style="color: #1e3a5f;">Ideas</h3><ul>${ideaItems}</ul>` : ''}
          ${commentCount > 0 ? `<p>${commentCount} new comment${commentCount !== 1 ? 's' : ''} on discussions you follow.</p>` : ''}
          <p style="margin: 20px 0;">
            <a href="${SITE_URL}/polls" style="background-color: #c41e3a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Polls
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            <a href="${unsubscribeUrl}" style="color: #999;">Unsubscribe from weekly digest</a>
          </p>
        </div>
      `,
    });

    if (error) return { success: false, error: error.message };
    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Send a broadcast email to multiple recipients in batches.
 * Uses Resend's batch API for efficient delivery (max 100 per request).
 * Automatically includes unsubscribe link in each email.
 *
 * @param {string} subject - Email subject line
 * @param {string} htmlBody - HTML content of the email body
 * @param {Array<{email: string, name: string}>} recipients - Array of recipient objects
 * @returns {Promise<{sent: number, failed: number, errors: string[]}>} Delivery results
 *
 * @example
 * const recipients = supporters.map(s => ({
 *   email: s.email,
 *   name: s.first_name
 * }));
 * const result = await sendBroadcastEmail(
 *   'Campaign Update',
 *   '<h1>Important News</h1><p>Details here...</p>',
 *   recipients
 * );
 * console.log(`Sent: ${result.sent}, Failed: ${result.failed}`);
 */
export async function sendBroadcastEmail(subject, htmlBody, recipients) {
  const client = getResendClient();
  if (!client) return { sent: 0, failed: recipients.length, errors: ['Email service not configured'] };

  const results = { sent: 0, failed: 0, errors: [] };

  // Resend batch API supports up to 100 emails per request
  const batchSize = 100;

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);

    try {
      const emails = batch.map((r) => ({
        from: FROM_EMAIL,
        to: r.email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            ${htmlBody}
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">
              You're receiving this because you signed up as a supporter.<br>
              <a href="${SITE_URL}/auth/unsubscribe?email=${encodeURIComponent(r.email)}" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        `,
      }));

      const { data, error } = await client.batch.send(emails);

      if (error) {
        results.failed += batch.length;
        results.errors.push(error.message);
      } else {
        results.sent += batch.length;
      }
    } catch (err) {
      results.failed += batch.length;
      results.errors.push(err.message);
    }
  }

  return results;
}
