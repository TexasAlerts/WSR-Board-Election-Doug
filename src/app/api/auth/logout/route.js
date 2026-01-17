import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, validateSession, logAuditEvent } from '../../../../lib/auth';

export async function POST(request) {
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
        await logAuditEvent(supporter.id, 'LOGOUT', {}, request);
      }
    }

    // Clear session cookie
    const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
