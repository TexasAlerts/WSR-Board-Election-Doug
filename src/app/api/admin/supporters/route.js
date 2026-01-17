import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/admin-session';

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = supabase
    .from('supporters')
    .select('id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at')
    .order('created_at', { ascending: false });

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function PUT(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { id, status, role } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Supporter ID required' }, { status: 400 });
    }

    const updates = {};
    if (status) updates.status = status;
    if (role) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No updates provided' }, { status: 400 });
    }

    const { error } = await supabase
      .from('supporters')
      .update(updates)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
