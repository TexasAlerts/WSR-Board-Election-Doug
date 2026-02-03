import { NextResponse } from 'next/server';
import { getCurrentSupporter } from '../../../../lib/auth';
import { logError, ErrorTypes } from '../../../../lib/logging';

/**
 * GET /api/supporter/me
 * Returns the currently authenticated supporter's information
 */
export async function GET() {
  try {
    const supporter = await getCurrentSupporter();

    if (!supporter) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Return safe supporter data (exclude sensitive fields)
    return NextResponse.json({
      ok: true,
      data: {
        id: supporter.id,
        email: supporter.email,
        name: supporter.name,
        is_admin: supporter.is_admin || false,
      },
    });
  } catch (error) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: error.message,
      errorStack: error.stack,
      endpoint: '/api/supporter/me',
      method: 'GET',
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
