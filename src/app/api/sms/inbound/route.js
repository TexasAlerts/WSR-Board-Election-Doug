import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { sendSMS } from '../../../../lib/smsService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';
import { rateLimit } from '../../../../lib/rateLimit';
import crypto from 'crypto';

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
const OPT_IN_KEYWORDS = ['start', 'unstop', 'subscribe'];
const HELP_KEYWORDS = ['help', 'info'];

const AUTO_RESPONSES = {
  optOut:
    'You have been unsubscribed from Doug Charles for Prosper Town Council Place 5 SMS messages. No further messages will be sent. Reply START to re-subscribe.',
  optIn:
    'Thank you for opting in to Doug Charles for Prosper Town Council Place 5 community updates! Msg freq may vary. Std msg & data rates apply. Donations may be solicited. Reply STOP to opt out, HELP for help.',
  help: 'Doug Charles for Prosper Town Council Place 5. Community updates, alerts & donation info. Msg freq varies. Msg & data rates apply. Reply STOP to opt out. Contact: doug@dougcharles.com Website: https://www.dougcharles.com',
};

/**
 * Verify Telnyx webhook signature using ED25519
 * Telnyx uses ED25519 signatures with their public key
 */
function validateTelnyxWebhook(rawBody, request) {
  const publicKey = process.env.TELNYX_PUBLIC_KEY;

  // If no public key configured, log warning but allow in development
  if (!publicKey) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
    // In development, skip signature verification but still validate structure
    console.warn('TELNYX_PUBLIC_KEY not configured - skipping signature verification');
    return null;
  }

  // Check for required Telnyx signature headers
  const signature = request.headers.get('telnyx-signature-ed25519');
  const timestamp = request.headers.get('telnyx-timestamp');

  if (!signature || !timestamp) {
    return NextResponse.json({ error: 'Missing webhook signature headers' }, { status: 401 });
  }

  // Check timestamp to prevent replay attacks (5 minute tolerance)
  const timestampAge = Math.abs(Date.now() / 1000 - parseInt(timestamp, 10));
  if (timestampAge > 300) {
    return NextResponse.json({ error: 'Webhook timestamp expired' }, { status: 401 });
  }

  try {
    // Construct the signed payload: timestamp|payload
    const signedPayload = `${timestamp}|${rawBody}`;
    const signatureBuffer = Buffer.from(signature, 'base64');

    // Verify ED25519 signature
    const isValid = crypto.verify(
      null, // ED25519 doesn't use a digest algorithm
      Buffer.from(signedPayload),
      {
        key: publicKey,
        format: 'pem',
      },
      signatureBuffer
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }
  } catch (err) {
    console.error('Telnyx signature verification error:', err.message);
    return NextResponse.json({ error: 'Signature verification failed' }, { status: 401 });
  }

  return null; // Validation passed
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limit: 100 requests per minute per IP to prevent webhook flooding
  if (!rateLimit(ip, 100, 60000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const supabase = getSupabase();
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);

    // Validate Telnyx webhook signature
    const validationError = validateTelnyxWebhook(rawBody, request);
    if (validationError) {
      return validationError;
    }

    // Validate payload structure
    if (!body?.data?.event_type || !body?.data?.payload) {
      return NextResponse.json({ error: 'Invalid webhook payload structure' }, { status: 400 });
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
