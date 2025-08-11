import { Resend } from 'resend';

let resend;

function getResend() {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY must be configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

/**
 * Send a notification email using the Resend API.
 *
 * @param {string} subject - The email subject line.
 * @param {string} text - Plain text body of the message.
 * @returns {Promise<void>} Resolves when the email request has been sent.
 */
export async function sendNotificationEmail(subject, text) {
  const from = process.env.SMTP_FROM;
  const to = process.env.NOTIFY_EMAIL;
  if (!from || !to) {
    throw new Error('SMTP_FROM and NOTIFY_EMAIL must be configured');
  }
  await getResend().emails.send({
    from,
    to,
    subject,
    text,
  });
}
