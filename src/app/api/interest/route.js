import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail } from '../../../lib/sendEmail';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
    const schema = z.object({
      types: z.array(z.string()).min(1, 'Select at least one option'),
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
    const { types, name, email, phone, message } = parsed.data;
    const type = types.join(', ');
    const { error } = await supabase
      .from('interest')
      .insert({ type, name, email, phone: phone ?? null, message: message ?? null });
    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    sendNotificationEmail(
      'New interest submission',
      `Types: ${type}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || ''}\nMessage: ${message || ''}`
    ).catch((err) => console.error('Email failed', err));
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}