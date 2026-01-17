import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAnon } from '../../../lib/supabase';
import { getCurrentSupporter } from '../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';

export async function GET(request) {
  const supabase = getSupabase();
  const supporter = await getCurrentSupporter();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let query = supabase
    .from('ideas')
    .select('id, name, category, title, content, status, support_count, upvotes, downvotes, admin_response, created_at')
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

  // Get user's votes if authenticated
  let userVotes = {};
  if (supporter && data.length > 0) {
    const ideaIds = data.map(i => i.id);
    const { data: votes } = await supabase
      .from('idea_votes')
      .select('idea_id, vote_type')
      .eq('supporter_id', supporter.id)
      .in('idea_id', ideaIds);

    if (votes) {
      votes.forEach(v => {
        userVotes[v.idea_id] = v.vote_type;
      });
    }
  }

  // Add user vote info to ideas
  const ideasWithVotes = data.map(idea => ({
    ...idea,
    user_vote: userVotes[idea.id] || null,
  }));

  return NextResponse.json({ ok: true, data: ideasWithVotes, isAuthenticated: !!supporter });
}

export async function POST(request) {
  const supabase = getSupabaseAnon();
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

    const { data: newIdea, error } = await supabase
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
      })
      .select('id')
      .single();

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/ideas',
        method: 'POST',
        userEmail: email,
        request,
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    // Log idea creation
    await logAudit({
      eventType: AuditEvents.IDEA_CREATED,
      targetId: newIdea?.id,
      targetType: 'idea',
      details: {
        name,
        email,
        category,
        title,
        isPublic: is_public,
      },
      request,
      responseStatus: 201,
    });

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
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/ideas',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}
