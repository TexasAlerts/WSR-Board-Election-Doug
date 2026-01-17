import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

export async function GET(req) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';

  try {
    let query = supabase
      .from('questions')
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
        endpoint: '/api/admin/qna',
        method: 'GET',
        userId: supporter.id,
        userEmail: supporter.email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/qna',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request: req,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  try {
    const body = await req.json();
    const { id, action, answer, rejection_reason } = body;

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Get question details for logging
    const { data: question } = await supabase
      .from('questions')
      .select('name, email, question, status')
      .eq('id', id)
      .single();

    const site = process.env.SITE_URL || '';

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('questions')
        .update({ status: 'approved', answer: answer || null })
        .eq('id', id)
        .select('email, name, question')
        .single();

      if (error) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: error.message,
          endpoint: '/api/admin/qna',
          method: 'POST',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request: req,
        });
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      await logAudit({
        eventType: AuditEvents.QUESTION_APPROVED || 'QUESTION_APPROVED',
        supporterId: supporter.id,
        targetId: id,
        targetType: 'question',
        oldValues: { status: question?.status },
        newValues: { status: 'approved', answer },
        details: {
          question: data?.question,
          submitterName: data?.name,
          submitterEmail: data?.email,
          approvedBy: `${supporter.first_name} ${supporter.last_name}`,
        },
        request: req,
        requestBody: body,
        responseStatus: 200,
      });

      if (data?.email) {
        const answerText = answer ? `\n\nAnswer: ${answer}` : '';
        await sendEmail(
          data.email,
          'Your question has been answered',
          `Hi ${data.name || ''},\n\nYour question has been published: ${site}/qna${answerText}\n\nThanks for reaching out!\n\n--\nDoug Charles`
        ).catch((err) => console.error('User email failed', err));
      }
    } else if (action === 'reject') {
      const { data, error } = await supabase
        .from('questions')
        .update({ status: 'rejected', rejection_reason: rejection_reason || null })
        .eq('id', id)
        .select('email, name, question')
        .single();

      if (error) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: error.message,
          endpoint: '/api/admin/qna',
          method: 'POST',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request: req,
        });
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      await logAudit({
        eventType: AuditEvents.QUESTION_REJECTED || 'QUESTION_REJECTED',
        supporterId: supporter.id,
        targetId: id,
        targetType: 'question',
        oldValues: { status: question?.status },
        newValues: { status: 'rejected', rejection_reason },
        details: {
          question: data?.question,
          submitterName: data?.name,
          submitterEmail: data?.email,
          rejectedBy: `${supporter.first_name} ${supporter.last_name}`,
          rejection_reason,
        },
        request: req,
        requestBody: body,
        responseStatus: 200,
      });

      if (data?.email) {
        const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
        await sendEmail(
          data.email,
          'Update on your question',
          `Hi ${data.name || ''},\n\nThank you for submitting your question. Unfortunately, we are unable to publish it at this time.${reasonText}\n\nIf you have other questions, please feel free to reach out.\n\n--\nDoug Charles`
        ).catch((err) => console.error('User email failed', err));
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
      endpoint: '/api/admin/qna',
      method: 'POST',
      userId: supporter.id,
      userEmail: supporter.email,
      request: req,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
