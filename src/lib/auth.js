import { getSupabase } from './supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { validateAdminSession } from './admin-session';

/**
 * @typedef {import('@/types').Supporter} Supporter
 * @typedef {import('@/types').EmailVerification} EmailVerification
 * @typedef {import('@/types').SMSVerification} SMSVerification
 * @typedef {import('@/types').VerifiedVoter} VerifiedVoter
 */

/**
 * @typedef {Object} SessionData
 * @property {string} token
 * @property {Date} expiresAt
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid
 * @property {string} [reason]
 * @property {SMSVerification} [verification]
 */

/**
 * @typedef {Object} RequestHeaders
 * @property {{ get: (key: string) => string | null }} [headers]
 */

/**
 * Generate secure random token
 * @param {number} [length=32] - Token length
 * @returns {string}
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
 * Generate 6-digit SMS code using cryptographically secure random
 * @returns {string}
 */
export function generateSMSCode() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Generate number between 100000 and 999999
  const code = 100000 + (array[0] % 900000);
  return code.toString();
}

/**
 * Hash password
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Create session
 * @param {string} supporterId
 * @param {RequestHeaders} [request]
 * @returns {Promise<SessionData | null>}
 */
export async function createSession(supporterId, request) {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (parseInt(process.env.SESSION_EXPIRY_HOURS) || 48));

  const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request?.headers?.get('user-agent') || 'unknown';

  const { error } = await supabase
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
 * Validate session and get supporter
 * @param {string} token
 * @returns {Promise<Supporter | null>}
 */
export async function validateSession(token) {
  if (!token) return null;

  const supabase = getSupabase();
  const { data: session, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      supporter:supporters(id, first_name, last_name, email, phone, phone_verified, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at)
    `
    )
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) return null;

  return /** @type {Supporter} */ (session.supporter);
}

/**
 * Get the currently logged-in supporter from cookies
 *
 * Checks two cookie types:
 * 1. session_token - Regular supporter login
 * 2. admin_session - Password-based admin login
 *
 * Returns a synthetic admin object for admin sessions.
 *
 * @returns {Promise<Supporter | null>} Supporter object, synthetic admin object, or null
 *
 * @example
 * const currentUser = await getCurrentSupporter();
 * if (currentUser?.role === 'super_admin') {
 *   // Show admin features
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
  if (adminToken && (await validateAdminSession(adminToken))) {
    // Return a synthetic admin supporter object
    return /** @type {Supporter} */ ({
      id: 'admin',
      role: 'super_admin',
      first_name: 'Admin',
      last_name: '',
      email: '',
      phone: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      email_consent: false,
      sms_consent: false,
      status: 'approved',
      created_at: new Date().toISOString(),
      email_verified_at: null,
      phone_verified_at: null,
      approved_at: null,
    });
  }

  return null;
}

/**
 * Delete a session (logout)
 *
 * @param {string} token - The session token to delete
 * @returns {Promise<boolean>} True if deletion succeeded
 */
export async function deleteSession(token) {
  const supabase = getSupabase();
  const { error } = await supabase.from('sessions').delete().eq('token', token);

  return !error;
}

/**
 * Delete all sessions for a supporter (logout from all devices)
 *
 * @param {string} supporterId - The supporter's database ID
 * @returns {Promise<boolean>} True if deletion succeeded
 */
export async function deleteAllSessions(supporterId) {
  const supabase = getSupabase();
  const { error } = await supabase.from('sessions').delete().eq('supporter_id', supporterId);

  return !error;
}

/**
 * Create an email verification token
 *
 * Generates a secure token that expires in 24 hours (configurable via VERIFICATION_EXPIRY_HOURS).
 * Can be used for email verification or password reset flows.
 *
 * @param {string} supporterId - The supporter's database ID
 * @param {'verify' | 'password_reset'} [purpose='verify'] - Purpose of the token
 * @returns {Promise<string | null>} The verification token or null on failure
 *
 * @example
 * const token = await createEmailVerification(supporter.id, 'verify');
 * await sendVerificationEmail(supporter.email, supporter.first_name, token);
 */
export async function createEmailVerification(supporterId, purpose = 'verify') {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(
    expiresAt.getHours() + (parseInt(process.env.VERIFICATION_EXPIRY_HOURS) || 24)
  );

  const { error } = await supabase
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
 * Validate an email verification token
 *
 * Checks token validity, expiration, and usage status.
 * Returns the verification record with associated supporter data.
 *
 * @param {string} token - The verification token to validate
 * @param {'verify' | 'password_reset'} [purpose='verify'] - Expected purpose of the token
 * @returns {Promise<EmailVerification | null>} Verification object or null if invalid
 */
export async function validateEmailVerification(token, purpose = 'verify') {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_verifications')
    .select('*, supporter:supporters(id, first_name, last_name, email, phone, status, role)')
    .eq('token', token)
    .eq('purpose', purpose)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;

  return /** @type {EmailVerification} */ (data);
}

/**
 * Mark an email verification as used
 *
 * Sets the used_at timestamp to prevent token reuse.
 *
 * @param {string} id - The verification record ID
 * @returns {Promise<boolean>} True if update succeeded
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
 * Create an SMS verification code
 *
 * Generates a 6-digit code that expires in 10 minutes (configurable via SMS_CODE_EXPIRY_MINUTES).
 * Invalidates any existing unused codes for the supporter.
 *
 * @param {string} supporterId - The supporter's database ID
 * @param {string} phone - Phone number in E.164 format
 * @returns {Promise<string | null>} The 6-digit code or null on failure
 *
 * @example
 * const code = await createSMSVerification(supporter.id, '+19725551234');
 * await sendVerificationSMS(phone, code);
 */
export async function createSMSVerification(supporterId, phone) {
  const supabase = getSupabase();
  const code = generateSMSCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + (parseInt(process.env.SMS_CODE_EXPIRY_MINUTES) || 10)
  );

  // Invalidate any existing codes for this supporter
  await supabase
    .from('sms_verifications')
    .delete()
    .eq('supporter_id', supporterId)
    .is('verified_at', null);

  const { error } = await supabase.from('sms_verifications').insert({
    supporter_id: supporterId,
    phone,
    code,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error('SMS verification insert error:', error.message, {
      supporterId,
      code: error.code,
      details: error.details,
    });
    return null;
  }

  return code;
}

/**
 * Validate SMS code
 * @param {string} supporterId
 * @param {string} code
 * @returns {Promise<ValidationResult>}
 */
export async function validateSMSCode(supporterId, code) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sms_verifications')
    .select('id, supporter_id, code, attempts, expires_at, verified_at')
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

  return { valid: true, verification: /** @type {SMSVerification} */ (data) };
}

/**
 * Increment SMS attempt counter
 * @param {string} supporterId
 * @returns {Promise<void>}
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
 * Log audit event
 * @param {string | null} supporterId
 * @param {string} eventType
 * @param {Record<string, unknown>} details
 * @param {RequestHeaders} [request]
 * @returns {Promise<void>}
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
 * Get supporter by email
 * @param {string} email
 * @returns {Promise<Supporter | null>}
 */
export async function getSupporterByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select(
      'id, first_name, last_name, email, password_hash, phone, phone_verified, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at'
    )
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return /** @type {Supporter} */ (data);
}

/**
 * Get supporter by ID
 * @param {string} id
 * @returns {Promise<Supporter | null>}
 */
export async function getSupporterById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select(
      'id, first_name, last_name, email, phone, phone_verified, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at'
    )
    .eq('id', id)
    .single();

  if (error) return null;
  return /** @type {Supporter} */ (data);
}

/**
 * Update supporter
 * @param {string} id
 * @param {Partial<Supporter>} updates
 * @returns {Promise<Supporter | null>}
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
  return /** @type {Supporter} */ (data);
}

/**
 * Check if user is admin
 * @param {Supporter | null} supporter
 * @returns {boolean}
 */
export function isAdmin(supporter) {
  return supporter?.role === 'admin' || supporter?.role === 'super_admin';
}

/**
 * Check if user is super admin
 * @param {Supporter | null} supporter
 * @returns {boolean}
 */
export function isSuperAdmin(supporter) {
  return supporter?.role === 'super_admin';
}

/**
 * Check if a supporter can manage roles (assign admin/super_admin)
 * Only super_admins can assign or modify roles
 * @param {Supporter | null} supporter
 * @returns {boolean}
 */
export function canManageRoles(supporter) {
  return supporter?.role === 'super_admin';
}

/**
 * Check if a supporter can moderate content (approve/reject comments, ideas, polls)
 * Both admins and super_admins can moderate content
 * @param {Supporter | null} supporter
 * @returns {boolean}
 */
export function canModerateContent(supporter) {
  return supporter?.role === 'admin' || supporter?.role === 'super_admin';
}

/**
 * Check if a supporter can delete/suspend supporters or verified voters
 * Only super_admins can delete or suspend users
 * @param {Supporter | null} supporter
 * @returns {boolean}
 */
export function canDeleteSupporters(supporter) {
  return supporter?.role === 'super_admin';
}

/**
 * Get verified voter from cookie (lightweight email-verified user for polls)
 * @returns {Promise<VerifiedVoter | null>}
 */
export async function getVerifiedVoter() {
  const cookieStore = await cookies();
  const voterId = cookieStore.get('verified_voter_id')?.value;
  if (!voterId) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('verified_voters')
    .select('id, email, name, first_name, last_name, address, verified_at')
    .eq('id', voterId)
    .not('verified_at', 'is', null)
    .single();

  if (error || !data) return null;
  return /** @type {VerifiedVoter} */ (data);
}
