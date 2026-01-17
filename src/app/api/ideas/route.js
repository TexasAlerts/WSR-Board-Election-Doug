import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('ideas')
    .select('id, name, category, title, content, status, support_count, admin_response, created_at')
    .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, data });
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();

    const schema = z.object({
      name: z.string().min(1, 'Name is required').max(200),
      email: z.string().email('Valid email required').max(200),
      category: z.enum(['infrastructure', 'community', 'safety', 'environment', 'general', 'question']),
      title: z.string().min(5, 'Title must be at least 5 characters').max(200),
      content: z.string().min(20, 'Content must be at least 20 characters').max(4000),
      is_public: z.boolean().optional().default(true),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const { name, email, category, title, content, is_public } = parsed.data;

    const { error } = await supabase
      .from('ideas')
      .insert({
        name,
        email,
        category,
        title,
        content,
        is_public,
        status: 'pending',
        support_count: 0,
      });

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Send emails
    await Promise.all([
      sendEmail(
        email,
        'Thanks for your idea',
        `Hi ${name},\n\nThank you for sharing your idea: "${title}"\n\nWe'll review it and get back to you soon.\n\n--\nDoug Charles`
      ).catch(err => console.error('User email failed:', err)),
      sendNotificationEmail(
        'New idea submitted',
        `Name: ${name}\nEmail: ${email}\nCategory: ${category}\nTitle: ${title}\nContent: ${content}`
      ).catch(err => console.error('Admin email failed:', err)),
    ]);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
