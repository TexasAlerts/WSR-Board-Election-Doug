import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin, isSuperAdmin } from '../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

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
      .select(
        'id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at'
      )
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
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
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
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

async function putHandler(request) {
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

    const VALID_STATUSES = ['pending', 'approved', 'suspended'];
    const VALID_ROLES = ['supporter', 'admin', 'super_admin'];
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ ok: false, error: 'Invalid status value' }, { status: 400 });
    }
    if (role && !VALID_ROLES.includes(role)) {
      return NextResponse.json({ ok: false, error: 'Invalid role value' }, { status: 400 });
    }

    // Get old values for audit
    const { data: oldSupporter } = await supabase
      .from('supporters')
      .select('status, role, email, first_name, last_name')
      .eq('id', id)
      .single();

    // Only SuperAdmin can change roles
    if (role && role !== oldSupporter?.role && !isSuperAdmin(supporter)) {
      return NextResponse.json(
        { ok: false, error: 'Only Super Admins can change user roles' },
        { status: 403 }
      );
    }

    // Only SuperAdmin can suspend users
    if (status === 'suspended' && !isSuperAdmin(supporter)) {
      return NextResponse.json(
        { ok: false, error: 'Only Super Admins can suspend users' },
        { status: 403 }
      );
    }

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

    const { error } = await supabase.from('supporters').update(updates).eq('id', id);

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
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
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
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 400 });
  }
}

async function deleteHandler(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Only SuperAdmin can delete supporters
  if (!isSuperAdmin(supporter)) {
    return NextResponse.json(
      { ok: false, error: 'Only Super Admins can delete supporters' },
      { status: 403 }
    );
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { id, reason } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Supporter ID required' }, { status: 400 });
    }

    if (!reason || reason.trim().length < 3) {
      return NextResponse.json(
        { ok: false, error: 'Deletion reason required (min 3 characters)' },
        { status: 400 }
      );
    }

    // Prevent self-deletion
    if (id === supporter.id) {
      return NextResponse.json(
        { ok: false, error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Fetch target supporter
    const { data: target, error: fetchError } = await supabase
      .from('supporters')
      .select('id, first_name, last_name, email, phone, street_address, city, state, zip_code, status, role, email_consent, sms_consent, created_at, email_verified_at, phone_verified_at, approved_at')
      .eq('id', id)
      .single();

    if (fetchError || !target) {
      return NextResponse.json({ ok: false, error: 'Supporter not found' }, { status: 404 });
    }

    // Prevent deleting admins/super_admins
    if (target.role === 'admin' || target.role === 'super_admin') {
      return NextResponse.json({ ok: false, error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Count related records for audit snapshot
    const [votes, comments, ideas] = await Promise.all([
      supabase
        .from('poll_votes')
        .select('id', { count: 'exact', head: true })
        .eq('supporter_id', id),
      supabase.from('comments').select('id', { count: 'exact', head: true }).eq('supporter_id', id),
      supabase.from('ideas').select('id', { count: 'exact', head: true }).eq('supporter_id', id),
    ]);

    // Nullify non-CASCADE foreign keys to preserve content
    await Promise.all([
      supabase.from('poll_votes').update({ supporter_id: null }).eq('supporter_id', id),
      supabase.from('comments').update({ supporter_id: null }).eq('supporter_id', id),
      supabase.from('comments').update({ moderated_by: null }).eq('moderated_by', id),
      supabase.from('ideas').update({ supporter_id: null }).eq('supporter_id', id),
      supabase.from('broadcasts').update({ sent_by: null }).eq('sent_by', id),
      supabase.from('audit_logs').update({ supporter_id: null }).eq('supporter_id', id),
      supabase.from('error_logs').update({ user_id: null }).eq('user_id', id),
      supabase.from('error_logs').update({ assigned_to: null }).eq('assigned_to', id),
      supabase.from('error_logs').update({ resolved_by: null }).eq('resolved_by', id),
      supabase.from('polls').update({ created_by: null }).eq('created_by', id),
    ]);

    // Delete supporter (CASCADE handles sessions, verifications, comment_votes, idea_votes, thread_subscriptions, notification_preferences)
    const { error: deleteError } = await supabase.from('supporters').delete().eq('id', id);

    if (deleteError) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: deleteError.message,
        endpoint: '/api/admin/supporters',
        method: 'DELETE',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Failed to delete supporter' }, { status: 500 });
    }

    // Log deletion with full snapshot
    await logAudit({
      eventType: AuditEvents.SUPPORTER_DELETED,
      supporterId: supporter.id,
      targetId: id,
      targetType: 'supporter',
      oldValues: {
        email: target.email,
        first_name: target.first_name,
        last_name: target.last_name,
        phone: target.phone,
        status: target.status,
        role: target.role,
        street_address: target.street_address,
        city: target.city,
        state: target.state,
        zip_code: target.zip_code,
        created_at: target.created_at,
      },
      details: {
        reason: reason.trim(),
        deletedBy: `${supporter.first_name} ${supporter.last_name}`,
        relatedRecords: {
          votes: votes.count || 0,
          comments: comments.count || 0,
          ideas: ideas.count || 0,
        },
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true, message: 'Supporter deleted successfully' });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/supporters',
      method: 'DELETE',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export const PUT = withCSRF(putHandler);
export const DELETE = withCSRF(deleteHandler);
