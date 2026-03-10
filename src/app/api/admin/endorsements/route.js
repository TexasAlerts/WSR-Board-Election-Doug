import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'pending';

  try {
    let query = supabase
      .from('endorsements')
      .select('id, name, email, phone, message, status, rejection_reason, consent_email, consent_sms, created_at')
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
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
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
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

async function postHandler(request) {
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
    const { id, action, rejection_reason } = body;

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
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
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
          `Hi ${data.name || ''},\n\nYour endorsement is now live: ${site}/endorsements\n\nThank you for your support!\n\n--\nDoug Charles\n\n---\nPaid for by Charles for Prosper. Doug Charles, Treasurer.`
        ).catch((err) => {
          logError({
            errorType: ErrorTypes.EMAIL_DELIVERY,
            errorMessage: `Failed to send endorsement approval email: ${err.message}`,
            userEmail: data.email,
          });
        });
      }
    } else if (action === 'reject') {
      const { data, error } = await supabase
        .from('endorsements')
        .update({ status: 'rejected', rejection_reason: rejection_reason || null })
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
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
      }

      // Log rejection
      await logAudit({
        eventType: AuditEvents.ENDORSEMENT_REJECTED,
        supporterId: supporter.id,
        targetId: id,
        targetType: 'endorsement',
        oldValues: { status: endorsement?.status },
        newValues: { status: 'rejected', rejection_reason },
        details: {
          endorserName: endorsement?.name,
          endorserEmail: endorsement?.email,
          rejectedBy: `${supporter.first_name} ${supporter.last_name}`,
          rejection_reason,
        },
        request,
        requestBody: body,
        responseStatus: 200,
      });

      // Send rejection email to user
      if (data?.email) {
        const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
        await sendEmail(
          data.email,
          'Update on your endorsement submission',
          `Hi ${data.name || ''},\n\nThank you for submitting an endorsement. Unfortunately, we are unable to publish it at this time.${reasonText}\n\nFeel free to revise and resubmit, or reach out if you have questions.\n\nQuestions? Email hello@dougcharles.com or visit ${site}/contact\n\n--\nDoug Charles\n\n---\nPaid for by Charles for Prosper. Doug Charles, Treasurer.`
        ).catch((err) => {
          logError({
            errorType: ErrorTypes.EMAIL_DELIVERY,
            errorMessage: `Failed to send endorsement rejection email: ${err.message}`,
            userEmail: data.email,
          });
        });
      }
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
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 400 });
  }
}

export const POST = withCSRF(postHandler);
