import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter, isAdmin, isSuperAdmin } from '../../../../../lib/auth';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../../lib/logging';
import { withCSRF } from '../../../../../lib/withCSRF';

/**
 * PATCH /api/admin/verified-voters/[id]
 * Suspend or unsuspend a verified voter
 * Body: { action: 'suspend' | 'unsuspend' }
 */
async function patchHandler(request, { params }) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isSuperAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Only Super Admins can suspend/unsuspend verified voters' }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await request.json();

  if (!['suspend', 'unsuspend'].includes(action)) {
    return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    // Get voter info for logging
    const { data: voter } = await supabase
      .from('verified_voters')
      .select('email, name')
      .eq('id', id)
      .single();

    if (!voter) {
      return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });
    }

    // Update suspension status
    const { error } = await supabase
      .from('verified_voters')
      .update({
        suspended_at: action === 'suspend' ? new Date().toISOString() : null,
      })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: 'Failed to update voter' }, { status: 500 });
    }

    // Log the action
    await logAudit({
      eventType: action === 'suspend' ? AuditEvents.VOTER_SUSPENDED : AuditEvents.VOTER_UNSUSPENDED,
      supporterId: supporter.id,
      targetId: id,
      targetType: 'verified_voter',
      details: { email: voter.email, name: voter.name },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/verified-voters/[id]',
      method: 'PATCH',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/verified-voters/[id]
 * Delete a verified voter (SuperAdmin only)
 */
async function deleteHandler(request, { params }) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isSuperAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Only Super Admins can delete verified voters' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const supabase = getSupabase();

    // Get voter info for logging
    const { data: voter } = await supabase
      .from('verified_voters')
      .select('email, name')
      .eq('id', id)
      .single();

    if (!voter) {
      return NextResponse.json({ ok: false, error: 'Voter not found' }, { status: 404 });
    }

    // Delete the voter
    const { error } = await supabase.from('verified_voters').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ ok: false, error: 'Failed to delete voter' }, { status: 500 });
    }

    // Log the action
    await logAudit({
      eventType: AuditEvents.VOTER_DELETED,
      supporterId: supporter.id,
      targetId: id,
      targetType: 'verified_voter',
      details: { email: voter.email, name: voter.name },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/verified-voters/[id]',
      method: 'DELETE',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export const PATCH = withCSRF(patchHandler);
export const DELETE = withCSRF(deleteHandler);
