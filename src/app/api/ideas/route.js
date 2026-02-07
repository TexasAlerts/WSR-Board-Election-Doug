import { NextResponse } from 'next/server';
import { getSupabase, getSupabaseAnon } from '../../../lib/supabase';
import { getCurrentSupporter } from '../../../lib/auth';
import { z } from 'zod';
import { rateLimit } from '../../../lib/rateLimit';
import { sendNotificationEmail, sendEmail } from '../../../lib/sendEmail';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../lib/logging';
import { sanitizeText } from '../../../lib/sanitize';
import { verifyCaptcha } from '../../../lib/recaptcha';
import { withCSRF } from '../../../lib/withCSRF';

// API routes should be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  try {
    const supabase = getSupabase();
    const supporter = await getCurrentSupporter();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('ideas')
      .select(
        'id, name, category, title, content, status, support_count, upvotes, downvotes, admin_response, created_at'
      )
      .in('status', ['published', 'under_review', 'planned', 'completed', 'declined'])
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/ideas',
        method: 'GET',
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Get comment counts for each idea
    let commentCountMap = {};
    if (data && data.length > 0) {
      const ideaIds = data.map((i) => i.id);
      const { data: commentCounts } = await supabase
        .from('comments')
        .select('idea_id')
        .eq('status', 'approved')
        .in('idea_id', ideaIds);

      if (commentCounts) {
        commentCounts.forEach((c) => {
          commentCountMap[c.idea_id] = (commentCountMap[c.idea_id] || 0) + 1;
        });
      }
    }

    // Get user's votes if authenticated
    let userVotes = {};
    if (supporter && data && data.length > 0) {
      const ideaIds = data.map((i) => i.id);
      const { data: votes } = await supabase
        .from('idea_votes')
        .select('idea_id, vote_type')
        .eq('supporter_id', supporter.id)
        .in('idea_id', ideaIds);

      if (votes) {
        votes.forEach((v) => {
          userVotes[v.idea_id] = v.vote_type;
        });
      }
    }

    // Add user vote info and comment counts to ideas
    const ideasWithVotes = (data || []).map((idea) => ({
      ...idea,
      user_vote: userVotes[idea.id] || null,
      comment_count: commentCountMap[idea.id] || 0,
    }));

    const response = NextResponse.json({
      ok: true,
      data: ideasWithVotes,
      isAuthenticated: !!supporter,
    });

    // Add Cache-Control headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');

    return response;
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/ideas',
      method: 'GET',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

async function postHandler(request) {
  const supabase = getSupabase();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  if (!rateLimit(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 });
  }

  // Require registered supporter
  const supporter = await getCurrentSupporter();
  if (!supporter || supporter.id === 'admin') {
    return NextResponse.json(
      { ok: false, error: 'Please sign in as a registered supporter to submit ideas' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();

    const schema = z.object({
      category: z.enum([
        'infrastructure',
        'community',
        'safety',
        'environment',
        'general',
        'question',
      ]),
      title: z.string().min(5, 'Title must be at least 5 characters').max(200),
      content: z.string().min(20, 'Content must be at least 20 characters').max(4000),
      is_public: z.boolean().optional().default(true),
      recaptchaToken: z.string().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      const errorMessage = parsed.error.errors.map((e) => e.message).join(', ');
      await logError({
        errorType: ErrorTypes.VALIDATION_ERROR,
        errorMessage: 'Ideas form validation failed: ' + errorMessage,
        endpoint: '/api/ideas',
        method: 'POST',
        request,
      });
      return NextResponse.json({ ok: false, error: errorMessage }, { status: 400 });
    }

    const {
      category,
      title: rawTitle,
      content: rawContent,
      is_public,
      recaptchaToken,
    } = parsed.data;

    // Require reCAPTCHA verification
    if (!recaptchaToken) {
      return NextResponse.json(
        { ok: false, error: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }
    const captchaResult = await verifyCaptcha(recaptchaToken, 'submit_idea');
    if (!captchaResult.success) {
      await logError({
        errorType: ErrorTypes.EXTERNAL_SERVICE,
        errorMessage: 'reCAPTCHA verification failed',
        endpoint: '/api/ideas',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Security verification failed. Please try again.' },
        { status: 400 }
      );
    }
    const name = `${supporter.first_name} ${supporter.last_name}`;
    const email = supporter.email;
    const title = sanitizeText(rawTitle);
    const content = sanitizeText(rawContent);

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
        supporter_id: supporter.id,
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
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
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
      ).catch(() => {}),
      sendNotificationEmail(
        'New idea submitted',
        `Name: ${name}\nEmail: ${email}\nCategory: ${category}\nTitle: ${title}\nContent: ${content}`
      ).catch(() => {}),
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
    return NextResponse.json({ ok: false, error: 'An unexpected error occurred' }, { status: 400 });
  }
}

export const POST = withCSRF(postHandler);
