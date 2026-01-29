import { NextResponse } from 'next/server';
import { getCurrentSupporter } from '../../../../lib/auth';

export async function GET() {
  try {
    const supporter = await getCurrentSupporter();

    if (!supporter) {
      // Return 200 with authenticated: false instead of 401 to avoid browser console errors
      // The client checks the 'authenticated' field to determine auth state
      return NextResponse.json({ ok: true, authenticated: false });
    }

    return NextResponse.json({
      ok: true,
      authenticated: true,
      supporter: {
        id: supporter.id,
        first_name: supporter.first_name,
        last_name: supporter.last_name,
        email: supporter.email,
        email_verified_at: supporter.email_verified_at,
        phone: supporter.phone,
        phone_verified: supporter.phone_verified,
        street_address: supporter.street_address,
        city: supporter.city,
        state: supporter.state,
        zip_code: supporter.zip_code,
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
