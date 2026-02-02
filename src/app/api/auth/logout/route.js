/**
 * API Route: User Logout
 *
 * Handles user logout by deleting session and clearing cookies.
 * Logs logout events for audit trail.
 * Authentication: Required (session token)
 * Rate Limit: None
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, validateSession } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

/**
 * POST /api/auth/logout
 * Logs out the current user by deleting their session.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response with cleared session cookie
 *   - 200: { ok: true, message: "Logged out successfully" }
 *   - 500: { ok: false, error: "An unexpected error occurred" }
 * @throws {Error} When session deletion fails
 *
 * Behavior:
 *   - Validates existing session to get user info for logging
 *   - Deletes session from database
 *   - Clears session_token cookie
 *   - Logs logout event to audit trail
 *   - Returns success even if no session exists
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session_token')?.value;

    if (sessionToken) {
      // Get supporter info before deleting session (needed for audit log)
      const supporter = await validateSession(sessionToken);

      // Delete session from database to invalidate the token
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
      sameSite: 'lax',
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
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
