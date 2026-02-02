import { NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '../../../../lib/rateLimit';
import { getSupporterByEmail, verifyPassword, createSession } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 10 attempts per IP per 15 minutes
  if (!rateLimit(`login-${ip}`, 10, 900000)) {
    return NextResponse.json(
      { ok: false, error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Get supporter
    const supporter = await getSupporterByEmail(email);

    if (!supporter) {
      // Log failed attempt
      await logAudit({
        eventType: AuditEvents.LOGIN_FAILED,
        details: { email, reason: 'User not found' },
        request,
        responseStatus: 401,
      });
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account status
    if (supporter.status === 'suspended') {
      await logAudit({
        eventType: AuditEvents.LOGIN_FAILED,
        supporterId: supporter.id,
        details: { email, reason: 'Account suspended' },
        request,
        responseStatus: 403,
      });
      return NextResponse.json(
        { ok: false, error: 'This account has been suspended.' },
        { status: 403 }
      );
    }

    if (supporter.status === 'pending_email') {
      return NextResponse.json(
        { ok: false, error: 'Please verify your email address first.' },
        { status: 403 }
      );
    }

    if (supporter.status === 'pending_phone') {
      return NextResponse.json(
        { ok: false, error: 'Please complete phone verification first.', requiresPhoneVerification: true, supporterId: supporter.id },
        { status: 403 }
      );
    }

    // Check password
    if (!supporter.password_hash) {
      return NextResponse.json(
        { ok: false, error: 'Please complete your registration by setting a password.' },
        { status: 403 }
      );
    }

    const passwordValid = await verifyPassword(password, supporter.password_hash);

    if (!passwordValid) {
      await logAudit({
        eventType: AuditEvents.LOGIN_FAILED,
        supporterId: supporter.id,
        details: { email, reason: 'Invalid password' },
        request,
        responseStatus: 401,
      });
      return NextResponse.json(
        { ok: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session
    const session = await createSession(supporter.id, request);
    if (!session) {
      await logError({
        errorType: ErrorTypes.SERVER_ERROR,
        errorMessage: 'Failed to create session',
        endpoint: '/api/auth/login',
        method: 'POST',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Log successful login
    await logAudit({
      eventType: AuditEvents.LOGIN_SUCCESS,
      supporterId: supporter.id,
      details: {
        email: supporter.email,
        role: supporter.role,
      },
      request,
      sessionId: session.id,
      responseStatus: 200,
    });

    // Set session cookie
    const response = NextResponse.json({
      ok: true,
      message: 'Login successful',
      supporter: {
        id: supporter.id,
        firstName: supporter.first_name,
        lastName: supporter.last_name,
        email: supporter.email,
        role: supporter.role,
      },
    });

    response.cookies.set('session_token', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: session.expiresAt,
      path: '/',
    });

    return response;
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/login',
      method: 'POST',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
