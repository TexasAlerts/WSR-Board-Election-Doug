import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, validateSession } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

async function postHandler(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Get supporter before deleting session for audit log
      const supporter = await validateSession(sessionToken);

      // Delete session from database
      await deleteSession(sessionToken);

      // Log event
      if (supporter) {
        await logAudit({
          eventType: AuditEvents.LOGOUT,
          supporterId: supporter.id,
          details: { email: supporter.email },
          request,
          responseStatus: 200,
        });
      }
    }

    // Clear session cookie
    const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/logout',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const POST = withCSRF(postHandler);
