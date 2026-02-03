import { getSupabase } from './supabase';
import { generateToken } from './auth';

/**
 * Create a persistent admin session stored in the existing sessions table.
 * Uses null supporter_id to distinguish from regular user sessions.
 * Returns a secure token to be stored as an httpOnly cookie.
 */
export async function createAdminSession(request) {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);

  const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request?.headers?.get('user-agent') || 'unknown';

  const { error } = await supabase.from('sessions').insert({
    supporter_id: null,
    token,
    expires_at: expiresAt.toISOString(),
    ip_address: ip,
    user_agent: userAgent,
  });

  if (error) {
    return null;
  }

  return token;
}

/**
 * Validate an admin session token against Supabase.
 * Returns true if the session exists, has null supporter_id, and has not expired.
 */
export async function validateAdminSession(token) {
  if (!token) return false;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('sessions')
    .select('id')
    .eq('token', token)
    .is('supporter_id', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  return !error && !!data;
}

/**
 * Delete an admin session (logout).
 */
export async function deleteAdminSession(token) {
  if (!token) return;
  const supabase = getSupabase();
  await supabase.from('sessions').delete().eq('token', token).is('supporter_id', null);
}

/**
 * Check if the current request has a valid admin session.
 */
export async function requireAdmin(req) {
  const adminCookie = req.cookies.get('admin_session');
  if (adminCookie && (await validateAdminSession(adminCookie.value))) {
    return true;
  }
  return false;
}
