import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createAdminSession } from '../../../../lib/admin-session';
import { rateLimit } from '../../../../lib/rateLimit';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { z } from 'zod';

const loginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req) {
  // Rate limit: 3 attempts per 5 minutes per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!(await rateLimit(ip, 3, 300000))) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Admin login validation failed: ' + parsed.error.errors[0].message,
        endpoint: '/api/admin/login',
        method: 'POST',
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 });
    }

    const { password } = parsed.data;

    const storedHash = process.env.ADMIN_PASSWORD_HASH;
    if (!storedHash) {
      return NextResponse.json({ ok: false, error: 'Admin login not configured' }, { status: 500 });
    }

    // Validate that the stored hash is actually a bcrypt hash
    if (!storedHash.startsWith('$2a$') && !storedHash.startsWith('$2b$')) {
      await logError({
        errorType: ErrorTypes.CONFIG_ERROR || 'CONFIG_ERROR',
        errorMessage: 'ADMIN_PASSWORD_HASH is not a valid bcrypt hash',
        endpoint: '/api/admin/login',
        method: 'POST',
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Admin login misconfigured' }, { status: 500 });
    }

    const valid = await bcrypt.compare(password, storedHash);

    if (valid) {
      const token = await createAdminSession(req);
      const res = NextResponse.json({ ok: true });
      res.cookies.set('admin_session', token, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 8,
      });

      await logAudit({
        eventType: AuditEvents.ADMIN_LOGIN || 'ADMIN_LOGIN',
        details: { ip },
        request: req,
        responseStatus: 200,
      });

      return res;
    }

    await logAudit({
      eventType: AuditEvents.ADMIN_LOGIN_FAILED || 'ADMIN_LOGIN_FAILED',
      details: { ip, reason: 'Invalid password' },
      request: req,
      responseStatus: 401,
    });

    return NextResponse.json({ ok: false }, { status: 401 });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/login',
      method: 'POST',
      request: req,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
