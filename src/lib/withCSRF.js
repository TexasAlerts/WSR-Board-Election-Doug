import { validateCSRFFromRequest } from './csrf';
import { NextResponse } from 'next/server';

/**
 * CSRF middleware wrapper for API route handlers.
 * Validates CSRF token from x-csrf-token header for state-changing methods.
 *
 * @param {Function} handler - The API route handler function
 * @returns {Function} Wrapped handler with CSRF validation
 *
 * @example
 * // In API route file:
 * import { withCSRF } from '../../../../lib/withCSRF';
 *
 * async function postHandler(request) {
 *   // Your handler logic
 * }
 *
 * export const POST = withCSRF(postHandler);
 */
export function withCSRF(handler) {
  return async (request, context) => {
    // Skip CSRF validation for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return handler(request, context);
    }

    // Validate CSRF token from header
    if (!validateCSRFFromRequest(request)) {
      return NextResponse.json(
        { ok: false, error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }

    return handler(request, context);
  };
}
