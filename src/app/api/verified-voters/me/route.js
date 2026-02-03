import { NextResponse } from 'next/server';
import { getVerifiedVoter } from '../../../../lib/auth';

/**
 * GET /api/verified-voters/me
 * Returns the current verified voter's information from cookie
 */
export async function GET() {
  try {
    const voter = await getVerifiedVoter();

    if (!voter) {
      return NextResponse.json({ ok: false, error: 'Not verified' }, { status: 401 });
    }

    // Return safe voter data
    return NextResponse.json({
      ok: true,
      data: {
        id: voter.id,
        email: voter.email,
        name: voter.name,
        first_name: voter.first_name,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
