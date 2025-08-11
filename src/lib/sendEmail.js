import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email to an arbitrary recipient using the Resend API.
 *
 * @param {string} to - Destination email address.
 * @param {string} subject - The email subject line.
 * @param {string} text - Plain text body of the message.
 */
export async function sendEmail(to, subject, text) {
  const from = process.env.SMTP_FROM;
  if (!from || !to) {
    throw new Error('SMTP_FROM and recipient email must be configured');
  }
  await resend.emails.send({ from, to, subject, text });
}

/**
 * Send an internal notification email to the configured NOTIFY_EMAIL.
 *
 * @param {string} subject - The email subject line.
 * @param {string} text - Plain text body of the message.
 */
export async function sendNotificationEmail(subject, text) {
  const to = process.env.NOTIFY_EMAIL;
  await sendEmail(to, subject, text);
}
