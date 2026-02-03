import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { sanitizeText } from '../../../lib/sanitize';
import { verifyCaptcha } from '../../../lib/recaptcha';

export async function POST(req) {
  const supabase = getSupabase();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const schema = z.object({
      type: z.string().max(200).optional().default('updates'),
      name: z.string().min(1, 'Name is required').max(200),
      email: z.string().email('Invalid email').max(200),
      phone: z.string().max(200).optional().nullable(),
      message: z.string().max(4000).optional().nullable(),
      consentEmail: z.boolean().optional().default(false),
      consentSms: z.boolean().optional().default(false),
      recaptchaToken: z.string().optional(),
    });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
    const {
      type,
      name: rawName,
      email,
      phone,
      message: rawMessage,
      consentEmail,
      consentSms,
      recaptchaToken,
    } = parsed.data;

    // Verify reCAPTCHA if token is provided
    if (recaptchaToken) {
      const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_interest');
      if (!captchaResult.success) {
        return NextResponse.json(
          { ok: false, error: 'Security verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }
    const name = sanitizeText(rawName);
    const message = rawMessage ? sanitizeText(rawMessage) : null;
    const { data: interestRecord, error } = await supabase
      .from('interest')
      .insert({
        type,
        name,
        email,
        phone: phone ?? null,
        message,
        consent_email: consentEmail,
        consent_sms: consentSms,
      })
      .select('id')
      .single();
    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/interest',
        method: 'POST',
        userEmail: email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Log interest submission
    await logAudit({
      eventType: AuditEvents.INTEREST_SUBMITTED,
      targetId: interestRecord?.id,
      targetType: 'interest',
      details: { type, name, email, hasPhone: !!phone, consentEmail, consentSms },
      request: req,
      responseStatus: 201,
    });
    await Promise.all([
      sendEmail(
        email,
        'Thanks for getting involved',
        `Hi ${name},\n\nThanks for your interest in ${type}.\n${message ? `Message: ${message}\n\n` : ''}We will be in touch and you can check back for updates.\n\n--\nDoug Charles`
      ).catch(() => {}),
      sendNotificationEmail(
        'New interest submission',
        `Type: ${type}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nMessage: ${message || ''}`
      ).catch(() => {}),
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}
