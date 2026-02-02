/**
 * Authentication and authorization module.
 * Handles user sessions, password management, email/SMS verification, and audit logging.
 * Supports both regular supporter authentication and admin authentication.
 *
 * @module auth
 */

import { getSupabase } from './supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { validateAdminSession } from './admin-session';

/**
 * Generate a cryptographically secure random token.
 * Uses Web Crypto API for secure random generation.
 *
 * @param {number} [length=32] - Length of the token to generate
 * @returns {string} Alphanumeric token string
 *
 * @example
 * const sessionToken = generateToken(64);
 * const verificationToken = generateToken(32);
 */
export function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

/**
 * Generate a 6-digit SMS verification code.
 * Uses cryptographically secure random generation to produce codes between 100000-999999.
 *
 * @returns {string} 6-digit numeric code as a string
 *
 * @example
 * const code = generateSMSCode(); // '123456'
 */
export function generateSMSCode() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Generate number between 100000 and 999999
  const code = 100000 + (array[0] % 900000);
  return code.toString();
}

/**
 * Hash a password using bcrypt with cost factor 12.
 *
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} Bcrypt hash string
 *
 * @example
 * const hash = await hashPassword('myPassword123');
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 *
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Bcrypt hash to compare against
 * @returns {Promise<boolean>} True if password matches hash, false otherwise
 *
 * @example
 * const isValid = await verifyPassword(inputPassword, storedHash);
 * if (!isValid) {
 *   return Response.json({ error: 'Invalid password' }, { status: 401 });
 * }
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new supporter session after successful authentication.
 * Generates a secure token and stores session metadata including IP and user agent.
 *
 * @param {string} supporterId - ID of the supporter to create session for
 * @param {Request} request - HTTP request object for extracting metadata
 * @returns {Promise<{token: string, expiresAt: Date}|null>} Session data if successful, null on error
 *
 * @example
 * const session = await createSession(supporter.id, request);
 * if (session) {
 *   cookies().set('session_token', session.token, {
 *     httpOnly: true,
 *     expires: session.expiresAt
 *   });
 * }
 */
export async function createSession(supporterId, request) {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (parseInt(process.env.SESSION_EXPIRY_HOURS) || 48));

  const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request?.headers?.get('user-agent') || 'unknown';

  const { data, error } = await supabase
    .from('sessions')
    .insert({
      supporter_id: supporterId,
      token,
      expires_at: expiresAt.toISOString(),
      ip_address: ip,
      user_agent: userAgent,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return { token, expiresAt };
}

/**
 * Validate a session token and retrieve the associated supporter data.
 * Checks token existence, expiration, and returns full supporter object.
 *
 * @param {string} token - Session token to validate
 * @returns {Promise<Object|null>} Supporter object if valid, null if invalid or expired
 *
 * @example
 * const supporter = await validateSession(token);
 * if (!supporter) {
 *   return Response.json({ error: 'Session expired' }, { status: 401 });
 * }
 */
export async function validateSession(token) {
  if (!token) return null;

  const supabase = getSupabase();
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      supporter:supporters(id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at)
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) return null;

  return session.supporter;
}

/**
 * Get the currently authenticated supporter from cookies.
 * Checks both supporter session token and admin session token.
 * Returns synthetic admin object for password-based admin sessions.
 *
 * @returns {Promise<Object|null>} Supporter object if authenticated, null otherwise
 *
 * @example
 * const supporter = await getCurrentSupporter();
 * if (!supporter) {
 *   redirect('/auth/login');
 * }
 */
export async function getCurrentSupporter() {
  const cookieStore = await cookies();

  // Check supporter session first
  const sessionToken = cookieStore.get('session_token')?.value;
  if (sessionToken) {
    const supporter = await validateSession(sessionToken);
    if (supporter) return supporter;
  }

  // Fallback: check password-based admin session
  const adminToken = cookieStore.get('admin_session')?.value;
  if (adminToken && await validateAdminSession(adminToken)) {
    // Return a synthetic admin supporter object
    return { id: 'admin', role: 'super_admin', first_name: 'Admin', last_name: '' };
  }

  return null;
}

/**
 * Delete a session from the database (logout).
 *
 * @param {string} token - Session token to delete
 * @returns {Promise<boolean>} True if deletion succeeded, false on error
 *
 * @example
 * const success = await deleteSession(token);
 * if (success) {
 *   cookies().delete('session_token');
 * }
 */
export async function deleteSession(token) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', token);

  return !error;
}

/**
 * Delete all sessions for a specific supporter.
 * Useful for security actions like password reset or account suspension.
 *
 * @param {string} supporterId - ID of supporter whose sessions should be deleted
 * @returns {Promise<boolean>} True if deletion succeeded, false on error
 *
 * @example
 * // After password reset
 * await deleteAllSessions(supporter.id);
 */
export async function deleteAllSessions(supporterId) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('supporter_id', supporterId);

  return !error;
}

/**
 * Create an email verification token for a supporter.
 * Used for email verification, password reset, or other email-based workflows.
 *
 * @param {string} supporterId - ID of supporter to create verification for
 * @param {string} [purpose='verify'] - Purpose of verification ('verify', 'reset', etc.)
 * @returns {Promise<string|null>} Verification token if successful, null on error
 *
 * @example
 * const token = await createEmailVerification(supporter.id, 'verify');
 * await sendVerificationEmail(supporter.email, supporter.first_name, token);
 */
export async function createEmailVerification(supporterId, purpose = 'verify') {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (parseInt(process.env.VERIFICATION_EXPIRY_HOURS) || 24));

  const { data, error } = await supabase
    .from('email_verifications')
    .insert({
      supporter_id: supporterId,
      token,
      expires_at: expiresAt.toISOString(),
      purpose,
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return token;
}

/**
 * Validate an email verification token.
 * Checks token existence, purpose match, usage status, and expiration.
 *
 * @param {string} token - Verification token to validate
 * @param {string} [purpose='verify'] - Expected purpose of the token
 * @returns {Promise<Object|null>} Verification object with supporter data if valid, null otherwise
 *
 * @example
 * const verification = await validateEmailVerification(token, 'verify');
 * if (!verification) {
 *   return Response.json({ error: 'Invalid or expired token' }, { status: 400 });
 * }
 */
export async function validateEmailVerification(token, purpose = 'verify') {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_verifications')
    .select('*, supporter:supporters(id, first_name, last_name, email, status, role)')
    .eq('token', token)
    .eq('purpose', purpose)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;

  return data;
}

/**
 * Mark an email verification token as used.
 * Prevents token reuse by setting the used_at timestamp.
 *
 * @param {string} id - ID of the email verification record
 * @returns {Promise<boolean>} True if update succeeded, false on error
 *
 * @example
 * await markEmailVerificationUsed(verification.id);
 */
export async function markEmailVerificationUsed(id) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('email_verifications')
    .update({ used_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

/**
 * Create an SMS verification code for phone verification.
 * Generates a 6-digit code and invalidates any existing unused codes for the supporter.
 *
 * @param {string} supporterId - ID of supporter to create verification for
 * @param {string} phone - Phone number to associate with verification (E.164 format)
 * @returns {Promise<string|null>} 6-digit verification code if successful, null on error
 *
 * @example
 * const code = await createSMSVerification(supporter.id, supporter.phone);
 * await sendVerificationSMS(supporter.phone, code);
 */
export async function createSMSVerification(supporterId, phone) {
  const supabase = getSupabase();
  const code = generateSMSCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + (parseInt(process.env.SMS_CODE_EXPIRY_MINUTES) || 10));

  // Invalidate any existing codes for this supporter
  await supabase
    .from('sms_verifications')
    .delete()
    .eq('supporter_id', supporterId)
    .is('verified_at', null);

  const { data, error } = await supabase
    .from('sms_verifications')
    .insert({
      supporter_id: supporterId,
      phone,
      code,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return code;
}

/**
 * Validate an SMS verification code.
 * Checks code correctness, expiration, and attempt limits (max 5 attempts).
 * Automatically marks code as verified if valid.
 *
 * @param {string} supporterId - ID of supporter who received the code
 * @param {string} code - 6-digit code to validate
 * @returns {Promise<{valid: boolean, reason?: string, verification?: Object}>} Validation result
 *
 * @example
 * const result = await validateSMSCode(supporter.id, userEnteredCode);
 * if (!result.valid) {
 *   return Response.json({ error: result.reason }, { status: 400 });
 * }
 */
export async function validateSMSCode(supporterId, code) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sms_verifications')
    .select('*')
    .eq('supporter_id', supporterId)
    .eq('code', code)
    .is('verified_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return { valid: false, reason: 'Invalid or expired code' };

  if (data.attempts >= 5) {
    return { valid: false, reason: 'Too many attempts. Please request a new code.' };
  }

  // Mark as verified
  await supabase
    .from('sms_verifications')
    .update({ verified_at: new Date().toISOString() })
    .eq('id', data.id);

  return { valid: true, verification: data };
}

/**
 * Increment the attempt counter for the most recent SMS verification.
 * Tracks failed verification attempts to enforce rate limiting.
 *
 * @param {string} supporterId - ID of supporter to increment attempts for
 * @returns {Promise<void>}
 *
 * @example
 * await incrementSMSAttempt(supporter.id);
 */
export async function incrementSMSAttempt(supporterId) {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('sms_verifications')
    .select('id, attempts')
    .eq('supporter_id', supporterId)
    .is('verified_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (data) {
    await supabase
      .from('sms_verifications')
      .update({ attempts: data.attempts + 1 })
      .eq('id', data.id);
  }
}

/**
 * Log an audit event for tracking user actions.
 * Records security-relevant events with metadata including IP and user agent.
 *
 * @param {string} supporterId - ID of supporter performing the action
 * @param {string} eventType - Type of event (e.g., 'LOGIN_SUCCESS', 'PROFILE_UPDATED')
 * @param {Object} details - Additional event details
 * @param {Request} request - HTTP request object for extracting metadata
 * @returns {Promise<void>}
 *
 * @example
 * await logAuditEvent(
 *   supporter.id,
 *   'PASSWORD_RESET',
 *   { method: 'email' },
 *   request
 * );
 */
export async function logAuditEvent(supporterId, eventType, details, request) {
  const supabase = getSupabase();
  const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request?.headers?.get('user-agent') || 'unknown';

  await supabase.from('audit_logs').insert({
    supporter_id: supporterId,
    event_type: eventType,
    details,
    ip_address: ip,
    user_agent: userAgent,
  });
}

/**
 * Retrieve a supporter by their email address.
 * Returns full supporter record including password hash (be careful with this data).
 *
 * @param {string} email - Email address to search for (case-insensitive)
 * @returns {Promise<Object|null>} Supporter object if found, null otherwise
 *
 * @example
 * const supporter = await getSupporterByEmail(email.toLowerCase());
 * if (!supporter) {
 *   return Response.json({ error: 'Email not found' }, { status: 404 });
 * }
 */
export async function getSupporterByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select('id, first_name, last_name, email, password_hash, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at')
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return data;
}

/**
 * Retrieve a supporter by their ID.
 * Returns supporter data without password hash (safe for general use).
 *
 * @param {string} id - Supporter ID (UUID)
 * @returns {Promise<Object|null>} Supporter object if found, null otherwise
 *
 * @example
 * const supporter = await getSupporterById(supporterId);
 */
export async function getSupporterById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select('id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

/**
 * Update a supporter's profile data.
 *
 * @param {string} id - Supporter ID to update
 * @param {Object} updates - Object containing fields to update
 * @returns {Promise<Object|null>} Updated supporter object if successful, null on error
 *
 * @example
 * const updated = await updateSupporter(supporter.id, {
 *   phone: '+19725551234',
 *   phone_verified_at: new Date().toISOString()
 * });
 */
export async function updateSupporter(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return null;
  }
  return data;
}

/**
 * Check if a supporter has admin privileges.
 *
 * @param {Object} supporter - Supporter object to check
 * @param {string} supporter.role - Role of the supporter
 * @returns {boolean} True if supporter is admin or super_admin
 *
 * @example
 * if (!isAdmin(supporter)) {
 *   return Response.json({ error: 'Forbidden' }, { status: 403 });
 * }
 */
export function isAdmin(supporter) {
  return supporter?.role === 'admin' || supporter?.role === 'super_admin';
}

/**
 * Check if a supporter has super admin privileges.
 *
 * @param {Object} supporter - Supporter object to check
 * @param {string} supporter.role - Role of the supporter
 * @returns {boolean} True if supporter is super_admin
 *
 * @example
 * if (isSuperAdmin(supporter)) {
 *   // Allow access to sensitive operations
 * }
 */
export function isSuperAdmin(supporter) {
  return supporter?.role === 'super_admin';
}

/**
 * Get the verified voter from cookies.
 * Verified voters are lightweight email-verified users who can vote on public polls
 * without creating a full supporter account.
 *
 * @returns {Promise<Object|null>} Verified voter object if authenticated, null otherwise
 *
 * @example
 * const voter = await getVerifiedVoter();
 * if (!voter) {
 *   return Response.json({ error: 'Please verify your email to vote' }, { status: 401 });
 * }
 */
export async function getVerifiedVoter() {
  const cookieStore = await cookies();
  const voterId = cookieStore.get('verified_voter_id')?.value;
  if (!voterId) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('verified_voters')
    .select('*')
    .eq('id', voterId)
    .not('verified_at', 'is', null)
    .single();

  if (error || !data) return null;
  return data;
}
