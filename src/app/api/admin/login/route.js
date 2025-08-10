import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
  const password = (body.password || '').toString();
  if (password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    // Set secure cookie. In production the secure flag ensures HTTPS only.
    res.cookies.set('admin_session', '1', { path: '/', httpOnly: true, secure: true, maxAge: 60 * 60 * 8 });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}