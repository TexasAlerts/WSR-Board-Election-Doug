/**
 * API Route: Current User Profile
 *
 * Returns the currently authenticated user's profile information.
 * Used by client to check authentication status and get user data.
 * Authentication: Optional (returns authenticated: false if not logged in)
 * Rate Limit: None
 */

import { NextResponse } from 'next/server';
import { getCurrentSupporter } from '../../../../lib/auth';

/**
 * GET /api/auth/me
 * Retrieves the current user's profile data.
 * Returns authenticated: false if no valid session exists (200 status to avoid console errors).
 *
 * @param {Request} req - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, authenticated: true, supporter: {...} }
 *   - 200: { ok: true, authenticated: false } (no session)
 *   - 500: { ok: false, error: "An unexpected error occurred" }
 *
 * Response supporter object includes:
 *   - id: string
 *   - first_name: string
 *   - last_name: string
 *   - email: string
 *   - email_verified_at: timestamp | null
 *   - phone: string | null
 *   - phone_verified: boolean
 *   - street_address: string
 *   - city: string
 *   - state: string
 *   - zip_code: string
 *   - role: string
 *   - status: string
 *
 * Note: Returns 200 (not 401) for unauthenticated requests to prevent
 * browser console errors. Client checks 'authenticated' field.
 */
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
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
