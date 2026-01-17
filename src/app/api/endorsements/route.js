import { NextResponse } from 'next/server';
import { getSupabaseAnon } from '../../../lib/supabase';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';

export async function GET() {
  const supabase = getSupabaseAnon();
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
  const supabase = getSupabaseAnon();
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
    const { data: endorsement, error } = await supabase
      .from('endorsements')
      .insert({ name, email, message: message ?? null, status: 'pending' })
      .select('id')
      .single();

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/endorsements',
        method: 'POST',
        userEmail: email,
        request: req,
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Log endorsement submission
    await logAudit({
      eventType: AuditEvents.ENDORSEMENT_SUBMITTED,
      targetId: endorsement?.id,
      targetType: 'endorsement',
      details: {
        name,
        email,
        hasMessage: !!message,
      },
      request: req,
      responseStatus: 201,
    });

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
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/endorsements',
      method: 'POST',
      request: req,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
