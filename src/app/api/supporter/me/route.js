import { NextResponse } from 'next/server';
import { getCurrentSupporter } from '../../../../lib/auth';

/**
 * GET /api/supporter/me
 * Returns the currently authenticated supporter's information
 */
export async function GET() {
  try {
    const supporter = await getCurrentSupporter();

    if (!supporter) {
      return NextResponse.json(
        { ok: false, error: 'Not authenticated' },
        { status: 401 }
      );
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
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
