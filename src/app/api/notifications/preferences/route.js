import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, getVerifiedVoter } from '../../../../lib/auth';
import { logError, ErrorTypes } from '../../../../lib/logging';

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
    return NextResponse.json({ ok: true, data: DEFAULTS });
  }

  // Fill in defaults for any missing columns (backward compat)
  const merged = { ...DEFAULTS, ...data };
  return NextResponse.json({ ok: true, data: merged });
}

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
    for (const field of ALL_PREF_FIELDS) {
      if (typeof body[field] === 'boolean') {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { error } = await supabase.from('notification_preferences').upsert(
      {
        email,
        supporter_id: supporter?.id !== 'admin' ? supporter?.id : null,
        ...updates,
      },
      { onConflict: 'email' }
    );

    if (error) {
      return NextResponse.json(
        { ok: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/notifications/preferences',
      method: 'PATCH',
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
