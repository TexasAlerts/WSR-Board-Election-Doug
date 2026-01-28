import { getSupabase } from './supabase';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { validateAdminSession } from './admin-session';

// Generate secure random token
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

// Generate 6-digit SMS code using cryptographically secure random
export function generateSMSCode() {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Generate number between 100000 and 999999
  const code = 100000 + (array[0] % 900000);
  return code.toString();
}

// Hash password
export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Create session
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
    console.error('Create session error:', error);
    return null;
  }

  return { token, expiresAt };
}

// Validate session and get supporter
export async function validateSession(token) {
  if (!token) return null;

  const supabase = getSupabase();
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      supporter:supporters(*)
    `)
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !session) return null;

  return session.supporter;
}

// Get current session from cookies
// Checks session_token (supporter login) and admin_session (password-based admin login)
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

// Delete session (logout)
export async function deleteSession(token) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('token', token);

  return !error;
}

// Delete all sessions for a supporter
export async function deleteAllSessions(supporterId) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('supporter_id', supporterId);

  return !error;
}

// Create email verification token
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
    console.error('Create email verification error:', error);
    return null;
  }

  return token;
}

// Validate email verification token
export async function validateEmailVerification(token, purpose = 'verify') {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('email_verifications')
    .select('*, supporter:supporters(*)')
    .eq('token', token)
    .eq('purpose', purpose)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;

  return data;
}

// Mark email verification as used
export async function markEmailVerificationUsed(id) {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('email_verifications')
    .update({ used_at: new Date().toISOString() })
    .eq('id', id);

  return !error;
}

// Create SMS verification
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
    console.error('Create SMS verification error:', error);
    return null;
  }

  return code;
}

// Validate SMS code
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

// Increment SMS attempt counter
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

// Log audit event
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

// Get supporter by email
export async function getSupporterByEmail(email) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) return null;
  return data;
}

// Get supporter by ID
export async function getSupporterById(id) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

// Update supporter
export async function updateSupporter(id, updates) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('supporters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update supporter error:', error);
    return null;
  }
  return data;
}

// Check if user is admin
export function isAdmin(supporter) {
  return supporter?.role === 'admin' || supporter?.role === 'super_admin';
}

// Check if user is super admin
export function isSuperAdmin(supporter) {
  return supporter?.role === 'super_admin';
}
