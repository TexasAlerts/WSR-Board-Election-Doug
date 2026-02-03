import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  if (!token) {
    return NextResponse.json({ ok: false, error: 'Missing token' }, { status: 400 });
  }

  const supabase = getSupabase();

  const validTypes = [
    'email_on_comment_moderation',
    'email_on_new_comment',
    'email_on_new_reply',
    'email_on_weekly_digest',
    'all',
  ];

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

  if (type === 'all' || !type) {
    updates.email_on_comment_moderation = false;
    updates.email_on_new_comment = false;
    updates.email_on_new_reply = false;
    updates.email_on_weekly_digest = false;
  } else {
    updates[type] = false;
  }

  await supabase.from('notification_preferences').update(updates).eq('id', prefs.id);

  // Redirect to unsubscribe confirmation page
  const redirectUrl = new URL('/notifications/unsubscribe', request.url);
  redirectUrl.searchParams.set('success', 'true');
  redirectUrl.searchParams.set('type', type || 'all');
  return NextResponse.redirect(redirectUrl);
}
