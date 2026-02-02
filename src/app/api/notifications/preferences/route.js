/**
 * API Route: Notification Preferences Management
 *
 * Handles retrieval and updating of user notification preferences for email and SMS.
 * Supports both authenticated supporters and verified voters.
 * Authentication: Required (supporter or verified voter session)
 * Rate Limit: None
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, getVerifiedVoter } from '../../../../lib/auth';

const ALL_PREF_FIELDS = [
  // Existing email prefs
  'email_on_comment_moderation',
  'email_on_new_comment',
  'email_on_new_reply',
  'email_on_weekly_digest',
  // New email prefs
  'email_on_new_poll',
  'email_on_broadcast',
  'email_on_system',
  // SMS prefs
  'sms_on_new_poll',
  'sms_on_comment_activity',
  'sms_on_new_idea',
  'sms_on_broadcast',
  'sms_on_system',
];

const DEFAULTS = Object.fromEntries(ALL_PREF_FIELDS.map((f) => [f, true]));

/**
 * GET /api/notifications/preferences
 * Retrieves the current notification preferences for the authenticated user.
 * Returns default preferences (all enabled) if no custom preferences exist.
 *
 * @param {Request} req - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true, data: NotificationPreferences }
 *   - 401: { ok: false, error: "Not authenticated" }
 *
 * Response data includes:
 *   - email_on_comment_moderation: boolean
 *   - email_on_new_comment: boolean
 *   - email_on_new_reply: boolean
 *   - email_on_weekly_digest: boolean
 *   - email_on_new_poll: boolean
 *   - email_on_broadcast: boolean
 *   - email_on_system: boolean
 *   - sms_on_new_poll: boolean
 *   - sms_on_comment_activity: boolean
 *   - sms_on_new_idea: boolean
 *   - sms_on_broadcast: boolean
 *   - sms_on_system: boolean
 */
export async function GET() {
  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();
  const voter = !supporter ? await getVerifiedVoter() : null;

  const email = supporter?.email || voter?.email;
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select(ALL_PREF_FIELDS.join(', '))
    .eq('email', email)
    .single();

  if (error || !data) {
    // Return defaults if no preferences record exists yet
    return NextResponse.json({ ok: true, data: DEFAULTS });
  }

  // Fill in defaults for any missing columns (backward compatibility)
  const merged = { ...DEFAULTS, ...data };
  return NextResponse.json({ ok: true, data: merged });
}

/**
 * PATCH /api/notifications/preferences
 * Updates notification preferences for the authenticated user.
 * Uses upsert to create preferences record if it doesn't exist.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} JSON response
 *   - 200: { ok: true }
 *   - 400: { ok: false, error: "No valid fields to update" }
 *   - 401: { ok: false, error: "Not authenticated" }
 *   - 500: { ok: false, error: "Failed to update preferences" }
 * @throws {Error} When database update fails
 *
 * Request body (all fields optional, only booleans accepted):
 *   - email_on_comment_moderation: boolean
 *   - email_on_new_comment: boolean
 *   - email_on_new_reply: boolean
 *   - email_on_weekly_digest: boolean
 *   - email_on_new_poll: boolean
 *   - email_on_broadcast: boolean
 *   - email_on_system: boolean
 *   - sms_on_new_poll: boolean
 *   - sms_on_comment_activity: boolean
 *   - sms_on_new_idea: boolean
 *   - sms_on_broadcast: boolean
 *   - sms_on_system: boolean
 */
export async function PATCH(request) {
  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();
  const voter = !supporter ? await getVerifiedVoter() : null;

  const email = supporter?.email || voter?.email;
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates = {};
    // Only accept boolean values for preference fields
    for (const field of ALL_PREF_FIELDS) {
      if (typeof body[field] === 'boolean') {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        email,
        supporter_id: supporter?.id !== 'admin' ? supporter?.id : null,
        ...updates,
      }, { onConflict: 'email' });

    if (error) {
      return NextResponse.json({ ok: false, error: 'Failed to update preferences' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
