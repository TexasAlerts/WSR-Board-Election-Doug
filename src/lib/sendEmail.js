/**
 * Simple email utility module using Resend API.
 * Provides basic email sending functionality for plain text messages.
 * Used primarily for internal notifications and simple transactional emails.
 *
 * @module sendEmail
 * @requires RESEND_API_KEY environment variable
 * @requires SMTP_FROM environment variable
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
function getResend() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Send a plain text email to a recipient using the Resend API.
 * Uses SMTP_FROM environment variable as the sender address.
 *
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text message body
 * @returns {Promise<void>}
 * @throws {Error} When SMTP_FROM or recipient email is not configured
 *
 * @example
 * await sendEmail(
 *   'user@example.com',
 *   'Account Update',
 *   'Your account has been updated successfully.'
 * );
 */
export async function sendEmail(to, subject, text) {
  const resend = getResend();
  if (!resend) {
    return;
  }
  const from = process.env.SMTP_FROM;
  if (!from || !to) {
    throw new Error('SMTP_FROM and recipient email must be configured');
  }
  await resend.emails.send({ from, to, subject, text });
}

/**
 * Send an internal notification email to the configured NOTIFY_EMAIL address.
 * Convenience wrapper for sending admin/developer notifications.
 *
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text message body
 * @returns {Promise<void>}
 * @throws {Error} When NOTIFY_EMAIL is not configured
 *
 * @example
 * await sendNotificationEmail(
 *   'New Error Logged',
 *   'A database error occurred at /api/polls/vote'
 * );
 */
export async function sendNotificationEmail(subject, text) {
  const to = process.env.NOTIFY_EMAIL;
  await sendEmail(to, subject, text);
}
