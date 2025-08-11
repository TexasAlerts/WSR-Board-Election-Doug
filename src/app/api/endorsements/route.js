import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';

// Use anon key for public endpoints; this allows RLS to restrict selecting only approved
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET() {
    const { data, error } = await supabase
      .from('endorsements')
      .select('id,name,message,created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, data });
}

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }
  try {
      const schema = z.object({
        name: z.string().min(1, 'Name is required').max(200),
        email: z.string().email('Invalid email').max(200),
        message: z.string().max(4000).optional().nullable(),
      });
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }
      const { name, email, message } = parsed.data;
      const { error } = await supabase
        .from('endorsements')
        .insert({ name, email, message: message ?? null, status: 'pending' });
      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }
      await Promise.all([
        sendEmail(
          email,
          'Thanks for your endorsement',
          `Hi ${name},\n\nThank you for endorsing Doug.\n${message ? `Your message: ${message}\n\n` : ''}We will notify you once it is published.\n\n--\nDoug Charles`
        ).catch((err) => console.error('User email failed', err)),
        sendNotificationEmail(
          'New endorsement submitted',
          `Name: ${name}\nEmail: ${email}\nMessage: ${message || ''}`
        ).catch((err) => console.error('Admin email failed', err))
      ]);
      return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}