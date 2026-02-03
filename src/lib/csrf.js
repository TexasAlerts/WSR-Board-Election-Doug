import crypto from 'crypto';

// Require a proper secret in production - fail fast if missing
const CSRF_SECRET = process.env.CSRF_SECRET || process.env.NEXTAUTH_SECRET;
if (!CSRF_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CSRF_SECRET or NEXTAUTH_SECRET environment variable is required in production');
}
// Use a development-only fallback for local testing
const SECRET = CSRF_SECRET || 'dev-only-csrf-secret-not-for-production';
const CSRF_TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

/**
 * Generate a CSRF token with embedded timestamp for expiry validation.
 * The token is a signed combination of random bytes and timestamp.
 *
 * @returns {string} A CSRF token string
 */
export function generateCSRFToken() {
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const data = `${randomBytes}.${timestamp}`;
  const signature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
  return `${data}.${signature}`;
}

/**
 * Validate a CSRF token.
 * Checks signature integrity and expiry time.
 *
 * @param {string} token - The CSRF token to validate
 * @returns {boolean} True if the token is valid and not expired
 */
export function validateCSRFToken(token) {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [randomBytes, timestamp, signature] = parts;
  const data = `${randomBytes}.${timestamp}`;

  // Verify signature
  const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');

  // Guard against length mismatch - timingSafeEqual throws if lengths differ
  if (signature.length !== expectedSignature.length) {
    return false;
  }

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return false;
  }

  // Check expiry
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime) || Date.now() - tokenTime > CSRF_TOKEN_EXPIRY) {
    return false;
  }

  return true;
}

/**
 * Middleware helper to validate CSRF token from request headers.
 * Looks for the token in 'x-csrf-token' header.
 *
 * @param {Request} request - The incoming request
 * @returns {boolean} True if CSRF token is valid
 */
export function validateCSRFFromRequest(request) {
  const token = request.headers.get('x-csrf-token');
  return validateCSRFToken(token);
}
