/**
 * API Route: Email Unsubscribe
 *
 * Handles one-click email unsubscribe requests from notification emails.
 * Validates unsubscribe token and updates preferences, then redirects to confirmation page.
 * Authentication: None (uses unsubscribe token from email)
 * Rate Limit: None (tokens are unique and user-specific)
 */

import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

/**
 * GET /api/notifications/unsubscribe
 * Processes unsubscribe request and redirects to confirmation page.
 * Can unsubscribe from specific notification type or all notifications.
 *
 * @param {Request} request - Next.js request object
 * @returns {Promise<Response>} Redirect to unsubscribe confirmation page
 *   - 302: Redirects to /notifications/unsubscribe?success=true&type={type}
 *   - 400: { ok: false, error: "Missing token" | "Invalid notification type" | "Invalid unsubscribe link" }
 *
 * Query parameters:
 *   - token: string (required) - Unique unsubscribe token from email
 *   - type: string (optional) - Specific notification type to unsubscribe from
 *     Valid types: 'email_on_comment_moderation', 'email_on_new_comment',
 *                  'email_on_new_reply', 'email_on_weekly_digest', 'all'
 *     Default: 'all' (unsubscribes from all notifications)
 *
 * Behavior:
 *   - If type='all' or not provided: Disables all email notifications
 *   - If specific type provided: Disables only that notification type
 *   - Updates notification_preferences table
 *   - Redirects to confirmation page with success status
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  }

  const supabase = getSupabase();

  const validTypes = ['email_on_comment_moderation', 'email_on_new_comment', 'email_on_new_reply', 'email_on_weekly_digest', 'all'];

  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ ok: false, error: 'Invalid notification type' }, { status: 400 });
  }

  const { data: prefs, error } = await supabase
    .from('notification_preferences')
    .select('id, email')
    .eq('unsubscribe_token', token)
    .single();

  if (error || !prefs) {
    return NextResponse.json({ ok: false, error: 'Invalid unsubscribe link' }, { status: 400 });
  }

  const updates = { updated_at: new Date().toISOString() };

  // Determine which preferences to disable based on type
  if (type === 'all' || !type) {
    // Unsubscribe from all email notifications
    updates.email_on_comment_moderation = false;
    updates.email_on_new_comment = false;
    updates.email_on_new_reply = false;
    updates.email_on_weekly_digest = false;
  } else {
    // Unsubscribe from specific notification type
    updates[type] = false;
  }

  await supabase
    .from('notification_preferences')
    .update(updates)
    .eq('id', prefs.id);

  // Redirect to unsubscribe confirmation page with success message
  const redirectUrl = new URL('/notifications/unsubscribe', request.url);
  redirectUrl.searchParams.set('success', 'true');
  redirectUrl.searchParams.set('type', type || 'all');
  return NextResponse.redirect(redirectUrl);
}
