import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { z } from 'zod';
import { logAudit, logError, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';

// GET - List all polls for admin
export async function GET(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';

  try {
    let query = supabase
      .from('polls')
      .select(
        `
        id, title, description, poll_type, visibility, status, allow_comments, show_results_before_vote, closes_at, created_at, updated_at, created_by, published_at,
        poll_choices (id, choice_text, display_order),
        poll_votes (id)
      `
      )
      .order('created_at', { ascending: false });

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: '/api/admin/polls',
        method: 'GET',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Add vote count to each poll
    const pollsWithCounts = data.map((poll) => ({
      ...poll,
      vote_count: poll.poll_votes?.length || 0,
      choice_count: poll.poll_choices?.length || 0,
    }));

    return NextResponse.json({ ok: true, data: pollsWithCounts });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/polls',
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

// POST - Create new poll
async function postHandler(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }

  try {
    const schema = z.object({
      title: z.string().min(1, 'Title is required').max(500),
      description: z.string().max(2000).optional().nullable(),
      poll_type: z
        .enum(['single_choice', 'multiple_choice', 'ranked_choice'])
        .default('single_choice'),
      visibility: z.enum(['public', 'public_view', 'authenticated']).default('public'),
      status: z.enum(['draft', 'active', 'closed']).default('draft'),
      allow_comments: z.boolean().default(true),
      show_results_before_vote: z.boolean().default(false),
      closes_at: z.string().datetime().optional().nullable(),
      choices: z
        .array(
          z.object({
            choice_text: z.string().min(1).max(500),
            display_order: z.number().int().min(0).optional(),
          })
        )
        .min(2, 'At least 2 choices are required'),
    });

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { choices, ...pollData } = parsed.data;

    // Create poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        ...pollData,
        created_by: supporter.id,
        published_at: pollData.status === 'active' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (pollError) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: pollError.message,
        endpoint: '/api/admin/polls',
        method: 'POST',
        requestBody: body,
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    // Create choices
    const choicesWithPollId = choices.map((choice, index) => ({
      poll_id: poll.id,
      choice_text: choice.choice_text,
      display_order: choice.display_order ?? index,
    }));

    const { error: choicesError } = await supabase.from('poll_choices').insert(choicesWithPollId);

    if (choicesError) {
      // Rollback poll creation
      await supabase.from('polls').delete().eq('id', poll.id);
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: choicesError.message,
        endpoint: '/api/admin/polls',
        method: 'POST',
        requestBody: body,
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }

    await logAudit({
      eventType: 'POLL_CREATED',
      supporterId: supporter.id,
      targetId: poll.id,
      targetType: 'poll',
      newValues: { title: poll.title, status: poll.status, choiceCount: choices.length },
      details: {
        pollTitle: poll.title,
        pollType: poll.poll_type,
        visibility: poll.visibility,
        createdBy: `${supporter.first_name} ${supporter.last_name}`,
      },
      request,
      requestBody: body,
      responseStatus: 201,
    });

    return NextResponse.json({ ok: true, data: poll }, { status: 201 });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/polls',
      method: 'POST',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

export const POST = withCSRF(postHandler);
