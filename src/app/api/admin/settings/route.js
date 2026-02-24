import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';
import { z } from 'zod';

const updateSchema = z.object({
  setting_key: z.string().min(1),
  setting_value: z.union([z.boolean(), z.string(), z.number(), z.record(z.unknown())]),
});

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('setting_key');

    if (error) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export const PUT = withCSRF(async (request) => {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'Invalid input' }, { status: 400 });
    }

    const { setting_key, setting_value } = parsed.data;

    const { error } = await supabase
      .from('site_settings')
      .update({
        setting_value: JSON.stringify(setting_value),
        updated_at: new Date().toISOString(),
      })
      .eq('setting_key', setting_key);

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/settings',
        method: 'PUT',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    await logAudit({
      eventType: 'settings_updated',
      userId: supporter.id,
      userEmail: supporter.email,
      details: { setting_key, setting_value },
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      endpoint: '/api/admin/settings',
      method: 'PUT',
      userId: supporter?.id,
      userEmail: supporter?.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
});
