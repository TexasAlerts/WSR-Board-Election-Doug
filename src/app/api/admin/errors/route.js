import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'new';

  let query = supabase
    .from('error_logs')
    .select(
      `
      id,
      error_type,
      error_message,
      error_stack,
      endpoint,
      method,
      user_email,
      ip_address,
      status,
      occurrence_count,
      first_occurred_at,
      last_occurred_at,
      resolution_notes,
      resolved_at,
      created_at
    `
    )
    .order('last_occurred_at', { ascending: false })
    .limit(100);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

async function putHandler(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { id, status, resolution_notes, assigned_to } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Error ID required' }, { status: 400 });
    }

    // Get old values for audit
    const { data: oldError } = await supabase
      .from('error_logs')
      .select('status, resolution_notes, assigned_to')
      .eq('id', id)
      .single();

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'resolved') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = supporter.id;
      }
    }
    if (resolution_notes !== undefined) {
      updates.resolution_notes = resolution_notes;
    }
    if (assigned_to !== undefined) {
      updates.assigned_to = assigned_to;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No updates provided' }, { status: 400 });
    }

    const { error } = await supabase.from('error_logs').update(updates).eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Log the action
    await logAudit({
      eventType: AuditEvents.ERROR_STATUS_UPDATED,
      supporterId: supporter.id,
      targetId: id,
      targetType: 'error_log',
      oldValues: oldError,
      newValues: updates,
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/errors',
      method: 'PUT',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 400 });
  }
}

export const PUT = withCSRF(putHandler);
