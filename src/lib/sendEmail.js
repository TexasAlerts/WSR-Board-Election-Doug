import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export async function sendNotificationEmail(subject, text) {
  const {
    RESEND_API_KEY,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    NOTIFY_EMAIL,
    SMTP_FROM,
  } = process.env;

  if (!NOTIFY_EMAIL) {
    console.error('Missing email environment variables.');
    return;
  }

  if (RESEND_API_KEY) {
    try {
      const resend = new Resend(RESEND_API_KEY);
      await resend.emails.send({
        from: SMTP_FROM || 'no-reply@example.com',
        to: NOTIFY_EMAIL,
        subject,
        text,
      });
      return;
    } catch (err) {
      console.error('Failed to send email via Resend', err);
    }
  }

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.error('Missing SMTP configuration.');
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? parseInt(SMTP_PORT, 10) : 587,
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: NOTIFY_EMAIL,
      subject,
      text,
    });
  } catch (err) {
    console.error('Failed to send email', err);
  }
}
