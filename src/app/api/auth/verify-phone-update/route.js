/**
 * API Route: Verify Phone Number Update
 *
 * Verifies SMS code after phone number update from user settings.
 * Marks phone as verified upon successful code validation.
 * Authentication: Required (session token)
 * Rate Limit: None (but tracks attempts for security)
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, validateSMSCode, incrementSMSAttempt } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { z } from 'zod';

const verifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d+$/, 'Code must be numeric'),
});

/**
 * POST /api/auth/verify-phone-update
 * Verifies SMS code to confirm phone number update.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, message: "Phone verified successfully!" }
 *   - 400: { ok: false, error: "Invalid code or validation error" }
 *   - 401: { ok: false, error: "Not authenticated" }
 *   - 500: { ok: false, error: "Failed to verify phone" }
 * @throws {Error} When database update fails
 *
 * Request body:
 *   - code: string (required, exactly 6 numeric digits)
 *
 * Process:
 *   1. Validates SMS code against stored verification
 *   2. Checks code expiry and attempt limits
 *   3. Updates phone_verified to true
 *   4. Sets phone_verified_at timestamp
 *   5. Logs verification to audit trail
 *   6. Increments attempt counter on failed validation
 *
 * Code validation checks:
 *   - Code matches stored value
 *   - Code has not expired (typically 10 minutes)
 *   - Attempt limit not exceeded
 */
export async function POST(request) {
  const supabase = getSupabase();
  try {
    const supporter = await getCurrentSupporter();
    if (!supporter) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { code } = parsed.data;

    // Validate SMS code
    const validation = await validateSMSCode(supporter.id, code);

    if (!validation.valid) {
      await incrementSMSAttempt(supporter.id);
      return NextResponse.json({ ok: false, error: validation.reason }, { status: 400 });
    }

    // Mark phone as verified
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        phone_verified: true,
        phone_verified_at: now,
      })
      .eq('id', supporter.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: 'Failed to verify phone' }, { status: 500 });
    }

    await logAudit({
      eventType: AuditEvents.PHONE_VERIFIED,
      supporterId: supporter.id,
      details: { phone: supporter.phone, context: 'settings_update' },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true, message: 'Phone verified successfully!' });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/verify-phone-update',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
