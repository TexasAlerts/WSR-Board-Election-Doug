import { NextResponse } from 'next/server';
import { deleteAdminSession } from '../../../../lib/admin-session';
import { logAudit, AuditEvents } from '../../../../lib/logging';

export async function POST(request) {
  const adminCookie = request.cookies.get('admin_session');

  if (adminCookie?.value) {
    await deleteAdminSession(adminCookie.value);

    await logAudit({
      eventType: AuditEvents.ADMIN_LOGOUT || 'ADMIN_LOGOUT',
      details: { action: 'Admin session terminated' },
      request,
      responseStatus: 200,
    });
  }

  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' });

  // Clear the admin session cookie
  response.cookies.set('admin_session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });

  return response;
}
