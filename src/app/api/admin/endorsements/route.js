import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../../../lib/admin-session';
import { sendEmail } from '../../../../lib/sendEmail';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE);

export async function GET(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { data, error } = await supabase
    .from('endorsements')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function POST(req) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json();
  const { id, action } = body;
  if (!id || !action) {
    return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
  }
    if (action === 'approve') {
      const { data, error } = await supabase
        .from('endorsements')
        .update({ status: 'approved' })
        .eq('id', id)
        .select('email,name')
        .single();
      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      const site = process.env.SITE_URL || '';
      if (data?.email) {
        sendEmail(
          data.email,
          'Your endorsement has been published',
          `Hi ${data.name || ''},\n\nYour endorsement is now live: ${site}/endorsements\n\nThank you for your support!\n\n--\nDoug Charles`
        ).catch((err) => console.error('User email failed', err));
      }
    } else if (action === 'reject') {
      const { error } = await supabase
        .from('endorsements')
        .update({ status: 'rejected' })
        .eq('id', id);
    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  } else {
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
