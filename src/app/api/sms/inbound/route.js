import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { logAudit, AuditEvents } from '../../../../lib/logging';

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'cancel', 'end', 'quit'];
const OPT_IN_KEYWORDS = ['start', 'unstop', 'subscribe'];

export async function POST(request) {
  const supabase = getSupabase();
  try {
    const body = await request.json();
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

    if (!isOptOut && !isOptIn) {
      return NextResponse.json({ ok: true });
    }

    // Find supporter by phone number
    const { data: supporter } = await supabase
      .from('supporters')
      .select('id, email, phone')
      .eq('phone', fromPhone)
      .single();

    if (!supporter) {
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

      if (error) {
        console.error('SMS opt-out update error:', error);
      }

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

      if (error) {
        console.error('SMS opt-in update error:', error);
      }

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
    console.error('Inbound SMS webhook error:', err);
    return NextResponse.json({ ok: true });
  }
}
