import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/admin-session';
import { getCurrentSupporter } from '../../../../lib/auth';
import { sendEmail } from '../../../../lib/sendEmail';

export async function GET(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('broadcasts')
    .select('id, broadcast_type, subject, body, email_recipient_count, sms_recipient_count, sent_at')
    .order('sent_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(request) {
  if (!requireAdmin(request)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();

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
          console.error(`Failed to send to ${recipient.email}:`, err);
        }
      }
    }

    // SMS sending would use Telnyx - placeholder for now
    let smsSent = 0;
    if (smsRecipients.length > 0) {
      // TODO: Integrate Telnyx for SMS broadcasts
      // For now, just count as 0 until Telnyx is configured
      console.log(`Would send SMS to ${smsRecipients.length} recipients`);
    }

    // Log the broadcast
    const { error: logError } = await supabase
      .from('broadcasts')
      .insert({
        broadcast_type,
        subject: subject || null,
        body: message,
        sent_by: supporter?.id || null,
        email_recipient_count: emailsSent,
        sms_recipient_count: smsSent,
      });

    if (logError) {
      console.error('Failed to log broadcast:', logError);
    }

    return NextResponse.json({
      ok: true,
      emailsSent,
      smsSent,
      message: `Sent to ${emailsSent} email${emailsSent !== 1 ? 's' : ''} and ${smsSent} SMS recipient${smsSent !== 1 ? 's' : ''}`,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
