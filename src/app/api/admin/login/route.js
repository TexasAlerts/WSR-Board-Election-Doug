import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminSession } from '../../../../lib/admin-session';
import { rateLimit } from '../../../../lib/rateLimit';

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
