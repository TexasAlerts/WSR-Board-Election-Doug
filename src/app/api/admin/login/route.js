import { NextResponse } from 'next/server';
import { createSession } from '../../../../lib/admin-session';

export async function POST(req) {
  const body = await req.json();
  const password = (body.password || '').toString();
  if (password === process.env.ADMIN_PASSWORD) {
    const token = createSession();
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

