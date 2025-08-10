import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNotificationEmail(subject, text) {
  const { RESEND_API_KEY, NOTIFY_EMAIL, SMTP_FROM } = process.env;
  if (!RESEND_API_KEY || !NOTIFY_EMAIL || !SMTP_FROM) {
    console.error('Missing email environment variables.');
    return;
  }
  try {
    await resend.emails.send({
      from: SMTP_FROM,
      to: NOTIFY_EMAIL,
      subject,
      text,
    });
  } catch (err) {
    console.error('Failed to send email', err);
  }
}

