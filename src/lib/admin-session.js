/**
 * Admin session management module for password-based authentication.
 * Manages admin sessions separately from regular supporter sessions using null supporter_id.
 * Sessions are stored in the same sessions table but distinguished by null supporter_id.
 *
 * @module admin-session
 */

import { getSupabase } from './supabase';
import { generateToken } from './auth';

/**
 * Create a new admin session after successful password authentication.
 * Stores session in the sessions table with null supporter_id to distinguish from regular sessions.
 * Session token should be stored as an httpOnly cookie for security.
 *
 * @param {Request} request - HTTP request object for extracting IP and user agent
 * @returns {Promise<string|null>} Session token if successful, null if creation failed
 *
 * @example
 * // After verifying admin password
 * const token = await createAdminSession(request);
 * if (token) {
 *   cookies().set('admin_session', token, {
 *     httpOnly: true,
 *     secure: true,
 *     maxAge: 8 * 60 * 60
 *   });
 * }
 */
export async function createAdminSession(request) {
  const supabase = getSupabase();
  const token = generateToken(64);
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 8);

  const ip = request?.headers?.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request?.headers?.get('user-agent') || 'unknown';

  const { error } = await supabase
    .from('sessions')
    .insert({
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
 * Validate an admin session token.
 * Checks if the token exists, belongs to an admin session (null supporter_id), and hasn't expired.
 *
 * @param {string} token - Admin session token to validate
 * @returns {Promise<boolean>} True if valid and not expired, false otherwise
 *
 * @example
 * const token = cookies().get('admin_session')?.value;
 * const isValid = await validateAdminSession(token);
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
 * Delete an admin session from the database.
 * Called during admin logout to invalidate the session.
 *
 * @param {string} token - Admin session token to delete
 * @returns {Promise<void>}
 *
 * @example
 * await deleteAdminSession(token);
 * cookies().delete('admin_session');
 */
export async function deleteAdminSession(token) {
  if (!token) return;
  const supabase = getSupabase();
  await supabase.from('sessions').delete().eq('token', token).is('supporter_id', null);
}

/**
 * Check if the current request has a valid admin session.
 * Convenience function for protecting admin routes.
 *
 * @param {Object} req - Request object with cookies property
 * @param {Function} req.cookies.get - Method to get cookie value
 * @returns {Promise<boolean>} True if request has valid admin session, false otherwise
 *
 * @example
 * // In an API route
 * if (!await requireAdmin(request)) {
 *   return Response.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 */
export async function requireAdmin(req) {
  const adminCookie = req.cookies.get('admin_session');
  if (adminCookie && await validateAdminSession(adminCookie.value)) {
    return true;
  }
  return false;
}
