import { NextResponse } from 'next/server';

/**
 * Redirect /auth/unsubscribe to /api/notifications/unsubscribe
 * This maintains backward compatibility with email links that reference /auth/unsubscribe
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  // If email parameter is provided, we need to look up the unsubscribe token
  // For now, redirect to the notifications unsubscribe page with email parameter
  // The page can handle token lookup or display instructions
  if (email) {
    const redirectUrl = new URL('/notifications/unsubscribe', request.url);
    redirectUrl.searchParams.set('email', email);
    return NextResponse.redirect(redirectUrl);
  }

  // If token is provided, pass it through to the API endpoint
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (token) {
    const redirectUrl = new URL('/api/notifications/unsubscribe', request.url);
    redirectUrl.searchParams.set('token', token);
    if (type) {
      redirectUrl.searchParams.set('type', type);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // No parameters provided - redirect to main unsubscribe page
  const redirectUrl = new URL('/notifications/unsubscribe', request.url);
  return NextResponse.redirect(redirectUrl);
}
