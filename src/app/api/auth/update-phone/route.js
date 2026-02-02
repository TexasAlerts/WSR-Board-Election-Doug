/**
 * API Route: Update Phone Number
 *
 * Updates user's phone number and sends SMS verification code.
 * Marks phone as unverified until code is confirmed.
 * Authentication: Required (session token)
 * Rate Limit: None (but SMS sending has its own limits)
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, createSMSVerification } from '../../../../lib/auth';
import { validatePhoneNumber } from '../../../../lib/phoneValidation';
import { sendVerificationSMS } from '../../../../lib/smsService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { z } from 'zod';

const updatePhoneSchema = z.object({
  phone: z.string().min(10, 'Phone number is required'),
});

/**
 * POST /api/auth/update-phone
 * Updates authenticated user's phone number and initiates verification.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, smsSent: true, message: "Phone updated. Verification code sent." }
 *   - 200: { ok: true, smsSent: false, message: "Phone updated but verification code could not be sent..." }
 *   - 400: { ok: false, error: "Validation error" }
 *   - 401: { ok: false, error: "Not authenticated" }
 *   - 500: { ok: false, error: "Failed to update phone" | "Failed to create verification code" }
 * @throws {Error} When database update or SMS sending fails
 *
 * Request body:
 *   - phone: string (required, min 10 chars) - New phone number
 *
 * Process:
 *   1. Validates phone number format
 *   2. Updates phone number in database
 *   3. Sets phone_verified to false
 *   4. Clears phone_verified_at timestamp
 *   5. Creates SMS verification code
 *   6. Sends verification SMS
 *   7. Logs phone update to audit trail
 *
 * Note: Phone is updated even if SMS fails, allowing user to retry verification
 */
export async function POST(request) {
  const supabase = getSupabase();
  try {
    const supporter = await getCurrentSupporter();
    if (!supporter) {
      return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updatePhoneSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { phone } = parsed.data;

    // Validate and format phone
    const validation = validatePhoneNumber(phone);
    if (!validation.valid) {
      return NextResponse.json({ ok: false, error: validation.error }, { status: 400 });
    }

    const oldPhone = supporter.phone;

    // Update phone in database (mark as not verified)
    const { error: updateError } = await supabase
      .from('supporters')
      .update({
        phone: validation.formatted,
        phone_verified: false,
        phone_verified_at: null,
      })
      .eq('id', supporter.id);

    if (updateError) {
      return NextResponse.json({ ok: false, error: 'Failed to update phone' }, { status: 500 });
    }

    // Create and send SMS verification code
    const smsVerification = await createSMSVerification(supporter.id, validation.formatted);
    if (!smsVerification) {
      return NextResponse.json(
        { ok: false, error: 'Failed to create verification code' },
        { status: 500 }
      );
    }

    // Log phone update before attempting SMS (so it's always recorded)
    await logAudit({
      eventType: AuditEvents.PHONE_UPDATED,
      supporterId: supporter.id,
      oldValues: { phone: oldPhone },
      newValues: { phone: validation.formatted },
      request,
      responseStatus: 200,
    });

    const smsResult = await sendVerificationSMS(validation.formatted, smsVerification);
    if (!smsResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: `SMS send failed for phone update: ${smsResult.error || 'unknown'}`,
        endpoint: '/api/auth/update-phone',
        method: 'POST',
        request,
      });
      // Phone is updated but SMS failed — user can try resending
      return NextResponse.json({
        ok: true,
        smsSent: false,
        message: 'Phone updated but verification code could not be sent. Please try again.',
      });
    }

    return NextResponse.json({
      ok: true,
      smsSent: true,
      message: 'Phone updated. Verification code sent.',
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/auth/update-phone',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
