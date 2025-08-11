import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
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
    });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
      const { type, name, email, phone, message } = parsed.data;
      const { error } = await supabase
        .from('interest')
        .insert({ type, name, email, phone: phone ?? null, message: message ?? null });
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      sendEmail(
        email,
        'Thanks for getting involved',
        `Hi ${name},\n\nThanks for your interest in ${type}.\n${message ? `Message: ${message}\n\n` : ''}We will be in touch and you can check back for updates.\n\n--\nDoug Charles`
      ).catch((err) => console.error('User email failed', err));
      sendNotificationEmail(
        'New interest submission',
        `Type: ${type}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nMessage: ${message || ''}`
      ).catch((err) => console.error('Admin email failed', err));
      return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}