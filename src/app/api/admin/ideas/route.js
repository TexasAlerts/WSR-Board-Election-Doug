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
      .from('ideas')
      .select('id, name, email, category, title, content, status, admin_response, is_public, support_count, created_at')
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/ideas',
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
      endpoint: '/api/admin/ideas',
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
    const { id, action, admin_response, rejection_reason } = body;

    if (!id || !action) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }

    // Get idea details for logging
    const { data: idea } = await supabase
      .from('ideas')
      .select('name, email, title, status')
      .eq('id', id)
      .single();

    const site = process.env.SITE_URL || '';

    if (action === 'publish') {
      const { data, error } = await supabase
        .from('ideas')
        .update({ status: 'published', admin_response: admin_response || null })
        .eq('id', id)
        .select('email, name, title')
        .single();

      if (error) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: error.message,
          endpoint: '/api/admin/ideas',
          method: 'POST',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request,
        });
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
      }

      await logAudit({
        eventType: AuditEvents.IDEA_PUBLISHED || 'IDEA_PUBLISHED',
        supporterId: supporter.id,
        targetId: id,
        targetType: 'idea',
        oldValues: { status: idea?.status },
        newValues: { status: 'published' },
        details: {
          ideaTitle: data?.title,
          submitterName: data?.name,
          submitterEmail: data?.email,
          publishedBy: `${supporter.first_name} ${supporter.last_name}`,
        },
        request,
        requestBody: body,
        responseStatus: 200,
      });

      if (data?.email) {
        const responseText = admin_response ? `\n\nDoug's response: ${admin_response}` : '';
        await sendEmail(
          data.email,
          'Your idea has been published',
          `Hi ${data.name || ''},\n\nYour idea "${data.title}" has been published: ${site}/ideas${responseText}\n\nThank you for sharing!\n\n--\nDoug Charles`
        ).catch(() => {});
      }
    } else if (action === 'reject') {
      const { data, error } = await supabase
        .from('ideas')
        .update({ status: 'declined', admin_response: rejection_reason || null })
        .eq('id', id)
        .select('email, name, title')
        .single();

      if (error) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: error.message,
          endpoint: '/api/admin/ideas',
          method: 'POST',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request,
        });
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
      }

      await logAudit({
        eventType: AuditEvents.IDEA_REJECTED || 'IDEA_REJECTED',
        supporterId: supporter.id,
        targetId: id,
        targetType: 'idea',
        oldValues: { status: idea?.status },
        newValues: { status: 'declined', rejection_reason },
        details: {
          ideaTitle: data?.title,
          submitterName: data?.name,
          submitterEmail: data?.email,
          rejectedBy: `${supporter.first_name} ${supporter.last_name}`,
          rejection_reason,
        },
        request,
        requestBody: body,
        responseStatus: 200,
      });

      if (data?.email) {
        const reasonText = rejection_reason ? `\n\nReason: ${rejection_reason}` : '';
        await sendEmail(
          data.email,
          'Update on your idea submission',
          `Hi ${data.name || ''},\n\nThank you for submitting your idea "${data.title}". Unfortunately, we are unable to publish it at this time.${reasonText}\n\nIf you have questions, please feel free to reach out.\n\n--\nDoug Charles`
        ).catch(() => {});
      }
    } else if (action === 'respond') {
      // Add admin response without changing status
      const { data, error } = await supabase
        .from('ideas')
        .update({ admin_response })
        .eq('id', id)
        .select('email, name, title')
        .single();

      if (error) {
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
      }

      if (data?.email && admin_response) {
        await sendEmail(
          data.email,
          'Response to your idea',
          `Hi ${data.name || ''},\n\nDoug has responded to your idea "${data.title}":\n\n${admin_response}\n\nView your idea: ${site}/ideas\n\n--\nDoug Charles`
        ).catch(() => {});
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
      endpoint: '/api/admin/ideas',
      method: 'POST',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export const POST = withCSRF(postHandler);
