import nodemailer from 'nodemailer';

export async function sendNotificationEmail(subject, text) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, NOTIFY_EMAIL, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !NOTIFY_EMAIL) {
    console.error('Missing email environment variables.');
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
