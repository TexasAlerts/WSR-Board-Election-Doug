import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logError, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'all';

  try {
    let query = supabase
      .from('interest')
      .select('id, type, name, email, phone, message, consent_email, consent_sms, created_at')
      .order('created_at', { ascending: false });

    if (type !== 'all') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/interest',
        method: 'GET',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/interest',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

async function deleteHandler(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
  }

  try {
    const { error } = await supabase.from('interest').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export const DELETE = withCSRF(deleteHandler);
