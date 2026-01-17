import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('supporters')
      .select('id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/supporters',
        method: 'GET',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/supporters',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { id, status, role } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Supporter ID required' }, { status: 400 });
    }

    // Get old values for audit
    const { data: oldSupporter } = await supabase
      .from('supporters')
      .select('status, role, email, first_name, last_name')
      .eq('id', id)
      .single();

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'approved') {
        updates.approved_at = new Date().toISOString();
      }
    }
    if (role) updates.role = role;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No updates provided' }, { status: 400 });
    }

    const { error } = await supabase
      .from('supporters')
      .update(updates)
      .eq('id', id);

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/supporters',
        method: 'PUT',
        requestBody: body,
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Determine event type for audit
    let eventType = 'SUPPORTER_UPDATED';
    if (status === 'approved') eventType = AuditEvents.SUPPORTER_APPROVED;
    else if (status === 'suspended') eventType = AuditEvents.SUPPORTER_SUSPENDED;
    else if (role && role !== oldSupporter?.role) eventType = AuditEvents.SUPPORTER_ROLE_CHANGED;

    // Log the action
    await logAudit({
      eventType,
      supporterId: supporter.id,
      targetId: id,
      targetType: 'supporter',
      oldValues: { status: oldSupporter?.status, role: oldSupporter?.role },
      newValues: updates,
      details: {
        targetName: `${oldSupporter?.first_name} ${oldSupporter?.last_name}`,
        targetEmail: oldSupporter?.email,
        actionBy: `${supporter.first_name} ${supporter.last_name}`,
      },
      request,
      requestBody: body,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/supporters',
      method: 'PUT',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
