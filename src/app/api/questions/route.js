import { NextResponse } from 'next/server';
import { getSupabase } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { verifyCaptcha } from '../../../lib/recaptcha';

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
  return NextResponse.json({ ok: true, data });
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
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
    const { name, email, question, recaptchaToken } = parsed.data;

    // Verify reCAPTCHA if token is provided
    if (recaptchaToken) {
      const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_question');
      if (!captchaResult.success) {
        return NextResponse.json(
          { ok: false, error: 'Security verification failed. Please try again.' },
          { status: 400 }
        );
      }
    }
    const { error } = await supabase
      .from('questions')
      .insert({ name, email, question, status: 'pending' });
    if (error) {
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
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
    return NextResponse.json(
      { ok: false, error: 'Something went wrong. Please try again.' },
      { status: 400 }
    );
  }
}
