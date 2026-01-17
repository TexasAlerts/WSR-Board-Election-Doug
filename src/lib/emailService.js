/**
 * Email Service using Resend
 * Requires RESEND_API_KEY environment variable
 */

import { Resend } from 'resend';

let resendClient = null;

function getResendClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = 'Doug Charles Campaign <noreply@dougcharles.com>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dougcharles.com';

/**
 * Send email verification
 */
export async function sendVerificationEmail(email, name, token) {
  const client = getResendClient();
  if (!client) {
    console.error('Resend not configured');
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
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error('Email send error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send password reset email
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
 * Send welcome email after account is approved
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
 * Send comment approved notification
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
 * Send comment rejected notification
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
 * Send broadcast email to multiple recipients
 * @param {string} subject - Email subject
 * @param {string} htmlBody - HTML content
 * @param {Array<{email: string, name: string}>} recipients - Array of recipients
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
