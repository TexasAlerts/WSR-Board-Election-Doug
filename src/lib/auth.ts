import { getSupabase } from './supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { validateAdminSession } from './admin-session';
import type { Supporter, EmailVerification, SMSVerification, VerifiedVoter } from '@/types';

interface SessionData {
  token: string;
  expiresAt: Date;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
  verification?: SMSVerification;
}

interface RequestHeaders {
  headers?: {
    get: (key: string) => string | null;
  };
}

// Generate secure random token
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += chars[array[i]! % chars.length];
  }
  return token;
}

// Generate 6-digit SMS code using cryptographically secure random
export function generateSMSCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Generate number between 100000 and 999999
  const code = 100000 + (array[0]! % 900000);
  return code.toString();
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create session
export async function createSession(
  supporterId: string,
  request?: RequestHeaders
): Promise<SessionData | null> {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (parseInt(process.env.SESSION_EXPIRY_HOURS!) || 48));

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

// Validate session and get supporter
export async function validateSession(token: string): Promise<Supporter | null> {
  if (!token) return null;

  const supabase = getSupabase();
  const { data: session, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      supporter:supporters(id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at)
    `
    )
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) return null;

  return session.supporter as unknown as Supporter;
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
 * @returns {Promise<Supporter|null>} Supporter object, synthetic admin object, or null
 *
 * @example
 * const currentUser = await getCurrentSupporter();
 * if (currentUser?.role === 'super_admin') {
 *   // Show admin features
 * }
 */
export async function getCurrentSupporter(): Promise<Supporter | null> {
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
    return {
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
    } as Supporter;
  }

  return null;
}

/**
 * Delete a session (logout)
 *
 * @param {string} token - The session token to delete
 * @returns {Promise<boolean>} True if deletion succeeded
 */
export async function deleteSession(token: string): Promise<boolean> {
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
export async function deleteAllSessions(supporterId: string): Promise<boolean> {
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
 * @param {'verify'|'password_reset'} [purpose='verify'] - Purpose of the token
 * @returns {Promise<string|null>} The verification token or null on failure
 *
 * @example
 * const token = await createEmailVerification(supporter.id, 'verify');
 * await sendVerificationEmail(supporter.email, supporter.first_name, token);
 */
export async function createEmailVerification(
  supporterId: string,
  purpose: 'verify' | 'password_reset' = 'verify'
): Promise<string | null> {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(
    expiresAt.getHours() + (parseInt(process.env.VERIFICATION_EXPIRY_HOURS!) || 24)
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
 * @param {'verify'|'password_reset'} [purpose='verify'] - Expected purpose of the token
 * @returns {Promise<EmailVerification|null>} Verification object or null if invalid
 */
export async function validateEmailVerification(
  token: string,
  purpose: 'verify' | 'password_reset' = 'verify'
): Promise<EmailVerification | null> {
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

  return data as unknown as EmailVerification;
}

/**
 * Mark an email verification as used
 *
 * Sets the used_at timestamp to prevent token reuse.
 *
 * @param {string} id - The verification record ID
 * @returns {Promise<boolean>} True if update succeeded
 */
export async function markEmailVerificationUsed(id: string): Promise<boolean> {
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
 * @returns {Promise<string|null>} The 6-digit code or null on failure
 *
 * @example
 * const code = await createSMSVerification(supporter.id, '+19725551234');
 * await sendVerificationSMS(phone, code);
 */
export async function createSMSVerification(
  supporterId: string,
  phone: string
): Promise<string | null> {
  const supabase = getSupabase();
  const code = generateSMSCode();
  const expiresAt = new Date();
  expiresAt.setMinutes(
    expiresAt.getMinutes() + (parseInt(process.env.SMS_CODE_EXPIRY_MINUTES!) || 10)
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
    return null;
  }

  return code;
}

// Validate SMS code
export async function validateSMSCode(
  supporterId: string,
  code: string
): Promise<ValidationResult> {
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

  return { valid: true, verification: data as SMSVerification };
}

// Increment SMS attempt counter
export async function incrementSMSAttempt(supporterId: string): Promise<void> {
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

// Log audit event
export async function logAuditEvent(
  supporterId: string | null,
  eventType: string,
  details: Record<string, unknown>,
  request?: RequestHeaders
): Promise<void> {
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

// Get supporter by email
export async function getSupporterByEmail(email: string): Promise<Supporter | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select(
      'id, first_name, last_name, email, password_hash, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at'
    )
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return data as Supporter;
}

// Get supporter by ID
export async function getSupporterById(id: string): Promise<Supporter | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select(
      'id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at'
    )
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Supporter;
}

// Update supporter
export async function updateSupporter(
  id: string,
  updates: Partial<Supporter>
): Promise<Supporter | null> {
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
  return data as Supporter;
}

// Check if user is admin
export function isAdmin(supporter: Supporter | null): boolean {
  return supporter?.role === 'admin' || supporter?.role === 'super_admin';
}

// Check if user is super admin
export function isSuperAdmin(supporter: Supporter | null): boolean {
  return supporter?.role === 'super_admin';
}

// Get verified voter from cookie (lightweight email-verified user for polls)
export async function getVerifiedVoter(): Promise<VerifiedVoter | null> {
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
  return data as VerifiedVoter;
}
