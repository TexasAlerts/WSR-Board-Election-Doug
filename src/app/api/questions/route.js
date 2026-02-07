import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { verifyCaptcha } from '../../../lib/recaptcha';

// API routes should be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('questions')
    .select('id, name, question, answer, created_at')
    .eq('status', 'approved')
    .not('answer', 'is', null)
    .neq('answer', '')
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }

  const response = NextResponse.json({ ok: true, data });

  // Add Cache-Control headers
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

  return response;
}

export async function POST(req) {
  const supabase = getSupabase();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const schema = z.object({
      name: z.string().min(1, 'Name is required').max(200),
      email: z.string().email('Invalid email').max(200),
      question: z.string().min(1, 'Question is required').max(4000),
      recaptchaToken: z.string().optional(),
    });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Questions form validation failed: ' + errorMessage,
        endpoint: '/api/questions',
        method: 'POST',
        request: req,
      });
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
    const { name, email, question, recaptchaToken } = parsed.data;

    // Require reCAPTCHA verification
    if (!recaptchaToken) {
      return NextResponse.json(
        { ok: false, error: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }
    const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_question');
    if (!captchaResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'reCAPTCHA verification failed',
        endpoint: '/api/questions',
        method: 'POST',
        request: req,
      });
      return NextResponse.json(
        { ok: false, error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }
    const { error } = await supabase
      .from('questions')
      .insert({ name, email, question, status: 'pending' });
    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/questions',
        method: 'POST',
        userEmail: email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
    await logAudit({
      eventType: AuditEvents.QUESTION_SUBMITTED || 'QUESTION_SUBMITTED',
      targetType: 'question',
      details: { name, email },
      request: req,
      responseStatus: 201,
    });

    await Promise.all([
      sendEmail(
        email,
        'Thanks for your question',
        `Hi ${name},\n\nThanks for your question:\n${question}\n\nWe will follow up once it has been answered.\n\n--\nDoug Charles`
      ).catch(() => {}),
      sendNotificationEmail(
        'New question submitted',
        `Name: ${name}\nEmail: ${email}\nQuestion: ${question}`
      ).catch(() => {}),
    ]);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/questions',
      method: 'POST',
      request: req,
    });
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 400 }
    );
  }
}
