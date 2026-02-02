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

  try {
    const { data, error } = await supabase
      .from('broadcasts')
      .select('id, broadcast_type, subject, body, email_recipient_count, sms_recipient_count, sent_at')
      .order('sent_at', { ascending: false })
      .limit(50);

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/broadcasts',
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
      endpoint: '/api/admin/broadcasts',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
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
    const { broadcast_type, subject, message } = body;

    if (!broadcast_type || !['email', 'sms', 'both'].includes(broadcast_type)) {
      return NextResponse.json({ ok: false, error: 'Invalid broadcast type' }, { status: 400 });
    }

    if ((broadcast_type === 'email' || broadcast_type === 'both') && !subject) {
      return NextResponse.json({ ok: false, error: 'Subject required for email' }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ ok: false, error: 'Message required' }, { status: 400 });
    }

    // Get approved supporters who consented
    let emailRecipients = [];
    let smsRecipients = [];

    if (broadcast_type === 'email' || broadcast_type === 'both') {
      const { data: emailSupporters } = await supabase
        .from('supporters')
        .select('email, first_name')
        .eq('status', 'approved')
        .eq('email_consent', true);

      emailRecipients = emailSupporters || [];
    }

    if (broadcast_type === 'sms' || broadcast_type === 'both') {
      const { data: smsSupporters } = await supabase
        .from('supporters')
        .select('phone, first_name')
        .eq('status', 'approved')
        .eq('sms_consent', true);

      smsRecipients = smsSupporters || [];
    }

    // Send emails
    let emailsSent = 0;
    let emailsFailed = 0;
    if (emailRecipients.length > 0) {
      for (const recipient of emailRecipients) {
        try {
          await sendEmail(
            recipient.email,
            subject,
            `Hi ${recipient.first_name},\n\n${message}\n\n--\nDoug Charles\nCandidate for Prosper Town Council, Place 5\n\nTo unsubscribe, reply with STOP.`
          );
          emailsSent++;
        } catch (err) {
          emailsFailed++;
        }
      }
    }

    // SMS sending would use Telnyx - placeholder for now
    let smsSent = 0;
    if (smsRecipients.length > 0) {
      // TODO: Integrate Telnyx for SMS broadcasts
      // For now, just count as 0 until Telnyx is configured
    }

    // Log the broadcast to database
    const { data: broadcastRecord, error: dbError } = await supabase
      .from('broadcasts')
      .insert({
        broadcast_type,
        subject: subject || null,
        body: message,
        sent_by: supporter.id,
        email_recipient_count: emailsSent,
        sms_recipient_count: smsSent,
      })
      .select('id')
      .single();

    if (dbError) {
    }

    // Log to audit trail
    await logAudit({
      eventType: AuditEvents.BROADCAST_SENT,
      supporterId: supporter.id,
      targetId: broadcastRecord?.id,
      targetType: 'broadcast',
      newValues: {
        broadcast_type,
        subject,
        email_recipient_count: emailsSent,
        sms_recipient_count: smsSent,
        emails_failed: emailsFailed,
      },
      details: {
        sentBy: `${supporter.first_name} ${supporter.last_name}`,
        totalEmailRecipients: emailRecipients.length,
        totalSmsRecipients: smsRecipients.length,
        messagePreview: message.substring(0, 100),
      },
      request,
      requestBody: { broadcast_type, subject, message: message.substring(0, 100) + '...' },
      responseStatus: 200,
    });

    return NextResponse.json({
      ok: true,
      emailsSent,
      smsSent,
      message: `Sent to ${emailsSent} email${emailsSent !== 1 ? 's' : ''} and ${smsSent} SMS recipient${smsSent !== 1 ? 's' : ''}`,
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/broadcasts',
      method: 'POST',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 400 });
  }
}
