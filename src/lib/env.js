/**
 * Validate required environment variables at import time.
 * Import this module early in server-side code to fail fast on misconfiguration.
 */

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'NOTIFY_EMAIL',
  'SMTP_FROM',
  'SITE_URL',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0 && process.env.NODE_ENV === 'production') {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
      'Check your Vercel environment settings.'
  );
}

if (missing.length > 0 && process.env.NODE_ENV !== 'production') {
}

// Admin password: either hashed or plaintext must be set
if (!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
  const msg = 'Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set.';
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
}
