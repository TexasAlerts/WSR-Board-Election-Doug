import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, getVerifiedVoter } from '../../../../lib/auth';

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
    .select('email_on_comment_moderation, email_on_new_comment, email_on_new_reply, email_on_weekly_digest')
    .eq('email', email)
    .single();

  if (error || !data) {
    // Return defaults
    return NextResponse.json({
      ok: true,
      data: {
        email_on_comment_moderation: true,
        email_on_new_comment: true,
        email_on_new_reply: true,
        email_on_weekly_digest: true,
      },
    });
  }

  return NextResponse.json({ ok: true, data });
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
    const allowedFields = ['email_on_comment_moderation', 'email_on_new_comment', 'email_on_new_reply', 'email_on_weekly_digest'];
    const updates = {};
    for (const field of allowedFields) {
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
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}
