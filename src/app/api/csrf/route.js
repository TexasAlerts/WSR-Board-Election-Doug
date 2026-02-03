import { NextResponse } from 'next/server';
import { generateCSRFToken } from '../../../lib/csrf';

/**
 * GET /api/csrf
 * Returns a new CSRF token for the client to use in subsequent requests.
 * The token should be included in the 'x-csrf-token' header for POST/PUT/DELETE requests.
 */
export async function GET() {
  const token = generateCSRFToken();
  return NextResponse.json({ csrfToken: token });
}
