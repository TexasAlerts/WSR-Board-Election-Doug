import { NextResponse } from 'next/server';
import { getCurrentSupporter, isAdmin } from '../../../../../lib/auth';
import { getSessionReconstruction } from '../../../../../lib/sessionTracking';
import { logError, ErrorTypes } from '../../../../../lib/logging';

/**
 * Get session reconstruction for admin debugging
 * Returns full timeline of visitor actions, errors, and audit events
 */
export async function GET(request, { params }) {
  try {
    const supporter = await getCurrentSupporter();
    if (!supporter || !isAdmin(supporter)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Session ID required' }, { status: 400 });
    }

    const sessionData = await getSessionReconstruction(id);

    if (!sessionData) {
      return NextResponse.json({ ok: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, data: sessionData });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/admin/sessions/${(await params)?.id}`,
      method: 'GET',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to get session reconstruction' },
      { status: 500 }
    );
  }
}
