import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  try {
    let query = supabase
      .from('endorsements')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/endorsements',
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
      endpoint: '/api/admin/endorsements',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Get endorsement details for logging
    const { data: endorsement } = await supabase
      .from('endorsements')
      .select('name, email, status')
      .eq('id', id)
      .single();

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('endorsements')
        .update({ status: 'approved' })
        .eq('id', id)
        .select('email, name')
        .single();

      if (error) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: error.message,
          endpoint: '/api/admin/endorsements',
          method: 'POST',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request,
        });
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      // Log approval
      await logAudit({
        eventType: AuditEvents.ENDORSEMENT_APPROVED,
        supporterId: supporter.id,
        targetId: id,
        targetType: 'endorsement',
        oldValues: { status: endorsement?.status },
        newValues: { status: 'approved' },
        details: {
          endorserName: data?.name,
          endorserEmail: data?.email,
          approvedBy: `${supporter.first_name} ${supporter.last_name}`,
        },
        request,
        requestBody: body,
        responseStatus: 200,
      });

      const site = process.env.SITE_URL || '';
      if (data?.email) {
        await sendEmail(
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

      if (error) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: error.message,
          endpoint: '/api/admin/endorsements',
          method: 'POST',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request,
        });
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      // Log rejection
      await logAudit({
        eventType: AuditEvents.ENDORSEMENT_REJECTED,
        supporterId: supporter.id,
        targetId: id,
        targetType: 'endorsement',
        oldValues: { status: endorsement?.status },
        newValues: { status: 'rejected' },
        details: {
          endorserName: endorsement?.name,
          endorserEmail: endorsement?.email,
          rejectedBy: `${supporter.first_name} ${supporter.last_name}`,
        },
        request,
        requestBody: body,
        responseStatus: 200,
      });
    } else {
      return NextResponse.json({ ok: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/endorsements',
      method: 'POST',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
