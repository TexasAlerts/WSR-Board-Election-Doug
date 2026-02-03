import crypto from 'crypto';

/**
 * Generate a consistent anonymous voter fingerprint from IP and User-Agent
 * This creates a pseudonymous identifier for duplicate vote prevention
 *
 * @param {string} ip - Visitor's IP address
 * @param {string} userAgent - Browser User-Agent string
 * @returns {string} SHA-256 hash of IP + User-Agent
 */
export function generateAnonymousVoterFingerprint(ip, userAgent) {
  const data = `${ip}:${userAgent || 'unknown'}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a secure random token for anonymous voter cookie
 * This is stored in the browser and checked server-side
 *
 * @returns {string} Random 32-character hex string
 */
export function generateAnonymousVoterToken() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Cookie name for anonymous voting session
 */
export const ANONYMOUS_VOTER_COOKIE = 'av_session';

/**
 * Cookie options for anonymous voting
 */
export const ANONYMOUS_VOTER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 365 * 24 * 60 * 60, // 1 year
};
