/**
 * Environment variable validation module.
 * Validates required environment variables at import time for fail-fast behavior.
 * Import this module early in server-side code to catch configuration issues before runtime.
 *
 * Required variables:
 * - SUPABASE_URL: Supabase project URL
 * - SUPABASE_ANON_KEY: Supabase anonymous (public) API key
 * - SUPABASE_SERVICE_ROLE: Supabase service role key for admin operations
 * - RESEND_API_KEY: Resend API key for sending emails
 * - NOTIFY_EMAIL: Email address for internal notifications
 * - SMTP_FROM: From address for outgoing emails
 * - SITE_URL: Base URL of the website
 * - ADMIN_PASSWORD_HASH or ADMIN_PASSWORD: Admin authentication credential
 *
 * @module env
 * @throws {Error} In production when required variables are missing
 */

const required = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE',
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
  // In development, log warning but don't throw
}

// Admin password: either hashed or plaintext must be set
if (!process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD) {
  const msg = 'Neither ADMIN_PASSWORD_HASH nor ADMIN_PASSWORD is set.';
  if (process.env.NODE_ENV === 'production') {
    throw new Error(msg);
  }
}
