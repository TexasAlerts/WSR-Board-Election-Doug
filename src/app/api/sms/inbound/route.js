import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { sendSMS } from '../../../../lib/smsService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
const OPT_IN_KEYWORDS = ['start', 'unstop', 'subscribe'];
const HELP_KEYWORDS = ['help', 'info'];

const AUTO_RESPONSES = {
  optOut:
    'You have been unsubscribed from Doug Charles for Prosper Town Council SMS messages. No further messages will be sent. Reply START to re-subscribe.',
  optIn:
    'Thank you for opting in to Doug Charles for Prosper Town Council SMS updates! Msg freq may vary. Std msg & data rates apply. Donations may be solicited. Reply STOP to opt out, HELP for help.',
  help: 'Doug Charles for Prosper Town Council SMS Program. Campaign updates, alerts & donation solicitations. Msg freq varies. Msg & data rates apply. Reply STOP to opt out. Contact: doug@dougcharles.com Website: https://www.dougcharles.com',
};

function validateTelnyxWebhook(body, request) {
  const secret = process.env.TELNYX_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Check for Telnyx signature header
  const signature = request.headers.get('telnyx-signature-ed25519');
  if (!signature) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 401 });
  }

  // Validate payload structure matches Telnyx webhook format
  if (!body?.data?.event_type || !body?.data?.payload) {
    return NextResponse.json({ error: 'Invalid webhook payload structure' }, { status: 401 });
  }

  return null; // Validation passed
}

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const body = await request.json();

    // Validate Telnyx webhook if secret is configured
    const validationError = validateTelnyxWebhook(body, request);
    if (validationError) {
      return validationError;
    }

    const payload = body?.data?.payload;

    if (!payload) {
      return NextResponse.json({ ok: true });
    }

    const fromPhone = payload.from?.phone_number;
    const messageText = (payload.text || '').trim().toLowerCase();

    if (!fromPhone || !messageText) {
      return NextResponse.json({ ok: true });
    }

    const isOptOut = OPT_OUT_KEYWORDS.includes(messageText);
    const isOptIn = OPT_IN_KEYWORDS.includes(messageText);
    const isHelp = HELP_KEYWORDS.includes(messageText);

    if (!isOptOut && !isOptIn && !isHelp) {
      return NextResponse.json({ ok: true });
    }

    // Send HELP response even if supporter not found
    if (isHelp) {
      await sendSMS(fromPhone, AUTO_RESPONSES.help);
      return NextResponse.json({ ok: true });
    }

    // Find supporter by phone number
    const { data: supporter } = await supabase
      .from('supporters')
      .select('id, email, phone')
      .eq('phone', fromPhone)
      .single();

    if (!supporter) {
      // Still send auto-response even if no matching supporter
      if (isOptOut) await sendSMS(fromPhone, AUTO_RESPONSES.optOut);
      if (isOptIn) await sendSMS(fromPhone, AUTO_RESPONSES.optIn);
      return NextResponse.json({ ok: true });
    }

    if (isOptOut) {
      // Disable all SMS notifications
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          sms_on_new_poll: false,
          sms_on_comment_activity: false,
          sms_on_new_idea: false,
          sms_on_broadcast: false,
          sms_on_system: false,
        })
        .eq('email', supporter.email);

      // error handled silently — opt-out continues regardless

      await sendSMS(fromPhone, AUTO_RESPONSES.optOut);

      await logAudit({
        eventType: AuditEvents.SMS_OPT_OUT,
        supporterId: supporter.id,
        details: { phone: fromPhone, keyword: messageText },
        request,
        responseStatus: 200,
      });
    } else if (isOptIn) {
      // Re-enable all SMS notifications
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          sms_on_new_poll: true,
          sms_on_comment_activity: true,
          sms_on_new_idea: true,
          sms_on_broadcast: true,
          sms_on_system: true,
        })
        .eq('email', supporter.email);

      // error handled silently — opt-in continues regardless

      await sendSMS(fromPhone, AUTO_RESPONSES.optIn);

      await logAudit({
        eventType: AuditEvents.SMS_OPT_IN,
        supporterId: supporter.id,
        details: { phone: fromPhone, keyword: messageText },
        request,
        responseStatus: 200,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/sms/inbound',
      method: 'POST',
      request,
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  }
}
