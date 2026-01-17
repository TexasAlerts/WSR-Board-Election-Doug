import { NextResponse } from 'next/server';
import { getCurrentSupporter } from '../../../../lib/auth';

export async function GET() {
  try {
    const supporter = await getCurrentSupporter();

    if (!supporter) {
      return NextResponse.json({ ok: false, authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      supporter: {
        id: supporter.id,
        firstName: supporter.first_name,
        lastName: supporter.last_name,
        email: supporter.email,
        role: supporter.role,
        status: supporter.status,
      },
    });
  } catch (err) {
    console.error('Get current user error:', err);
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
