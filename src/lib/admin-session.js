import { getSupabase } from './supabase';
import { generateToken } from './auth';

/**
 * Create a persistent admin session stored in the existing sessions table.
 * Uses null supporter_id to distinguish from regular user sessions.
 * Returns a secure token to be stored as an httpOnly cookie.
 *
 * Admin sessions expire after 8 hours and are tracked by IP and user agent
 * for security audit purposes.
 *
 * @param {Request} request - The incoming HTTP request (for IP/UA extraction)
 * @returns {Promise<string|null>} The session token, or null on failure
 *
 * @example
 * const token = await createAdminSession(request);
 * if (token) {
 *   response.cookies.set('admin_session', token, { httpOnly: true });
 * }
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
 *
 * @param {string} token - The admin session token to validate
 * @returns {Promise<boolean>} True if session is valid and not expired
 *
 * @example
 * const isValid = await validateAdminSession(cookieToken);
 * if (!isValid) {
 *   return NextResponse.redirect('/admin/login');
 * }
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
 * Removes the session from the database to invalidate the token.
 *
 * @param {string} token - The admin session token to delete
 * @returns {Promise<void>}
 */
export async function deleteAdminSession(token) {
  if (!token) return;
  const supabase = getSupabase();
  await supabase.from('sessions').delete().eq('token', token).is('supporter_id', null);
}

/**
 * Check if the current request has a valid admin session.
 * Reads the admin_session cookie and validates it against the database.
 *
 * @param {Request} req - The incoming request with cookies
 * @returns {Promise<boolean>} True if admin session is valid
 *
 * @example
 * const isAdmin = await requireAdmin(request);
 * if (!isAdmin) {
 *   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 * }
 */
export async function requireAdmin(req) {
  const adminCookie = req.cookies.get('admin_session');
  if (adminCookie && (await validateAdminSession(adminCookie.value))) {
    return true;
  }
  return false;
}
