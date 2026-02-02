/**
 * API Route: Admin Authentication
 *
 * Handles admin login authentication using password-based verification.
 * Creates secure admin session cookie on successful authentication.
 * Authentication: None (public endpoint for admin login)
 * Rate Limit: 3 attempts per 5 minutes per IP
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminSession } from '../../../../lib/admin-session';
import { rateLimit } from '../../../../lib/rateLimit';

/**
 * POST /api/admin/login
 * Authenticates admin user and creates a secure session.
 *
 * @param {Request} req - Next.js request object
 * @returns {Promise<Response>} JSON response with session cookie
 *   - 200: { ok: true } (with admin_session cookie set)
 *   - 401: { ok: false } (invalid credentials)
 *   - 429: { ok: false, error: "Too many login attempts..." }
 *   - 500: { ok: false, error: "Admin login not configured" }
 * @throws {Error} When admin password hash is not configured
 *
 * Request body:
 *   - password: string (required) - Admin password
 *
 * Response cookies:
 *   - admin_session: HttpOnly session token (8 hour expiry)
 *     - Secure flag enabled in production
 *     - SameSite: lax
 *
 * Security features:
 *   - Rate limited to prevent brute force attacks
 *   - Password compared against bcrypt hash
 *   - Session token stored in HttpOnly cookie
 */
export async function POST(req) {
  // Rate limit: 3 attempts per 5 minutes per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip, 3, 300000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  const body = await req.json();
  const password = (body.password || '').toString();

  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHash) {
    return NextResponse.json({ ok: false, error: 'Admin login not configured' }, { status: 500 });
  }
  const valid = await bcrypt.compare(password, storedHash);

  if (valid) {
    const token = await createAdminSession(req);
    const res = NextResponse.json({ ok: true });
    // Set secure cookie. In production the secure flag ensures HTTPS only.
    res.cookies.set('admin_session', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8,
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

