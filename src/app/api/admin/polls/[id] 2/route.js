import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../../lib/auth';
import { z } from 'zod';
import { logAudit, logError, ErrorTypes } from '../../../../../lib/logging';

// GET - Get single poll with details
export async function GET(request, { params }) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  try {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_choices (id, choice_text, display_order),
        poll_votes (id, vote_data, created_at, voter_email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!poll) {
      return NextResponse.json({ ok: false, error: 'Poll not found' }, { status: 404 });
    }

    // Calculate vote counts per choice
    const choiceCounts = {};
    poll.poll_choices.forEach((choice) => {
      choiceCounts[choice.id] = 0;
    });

    poll.poll_votes.forEach((vote) => {
      if (vote.vote_data?.choice_id) {
        choiceCounts[vote.vote_data.choice_id] = (choiceCounts[vote.vote_data.choice_id] || 0) + 1;
      }
      if (vote.vote_data?.choice_ids) {
        vote.vote_data.choice_ids.forEach((choiceId) => {
          choiceCounts[choiceId] = (choiceCounts[choiceId] || 0) + 1;
        });
      }
    });

    const enrichedPoll = {
      ...poll,
      vote_count: poll.poll_votes.length,
      choice_counts: choiceCounts,
      poll_choices: poll.poll_choices.sort((a, b) => a.display_order - b.display_order),
    };

    return NextResponse.json({ ok: true, data: enrichedPoll });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      endpoint: `/api/admin/polls/${id}`,
      method: 'GET',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// PUT - Update poll
export async function PUT(request, { params }) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  try {
    const schema = z.object({
      title: z.string().min(1).max(500).optional(),
      description: z.string().max(2000).optional().nullable(),
      poll_type: z.enum(['single_choice', 'multiple_choice']).optional(),
      visibility: z.enum(['public', 'public_view', 'authenticated']).optional(),
      status: z.enum(['draft', 'active', 'closed']).optional(),
      allow_comments: z.boolean().optional(),
      show_results_before_vote: z.boolean().optional(),
      closes_at: z.string().datetime().optional().nullable(),
      choices: z.array(
        z.object({
          id: z.string().uuid().optional(),
          choice_text: z.string().min(1).max(500),
          display_order: z.number().int().min(0).optional(),
        })
      ).optional(),
    });

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    // Get current poll for comparison
    const { data: currentPoll } = await supabase
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    if (!currentPoll) {
      return NextResponse.json({ ok: false, error: 'Poll not found' }, { status: 404 });
    }

    const { choices, ...pollUpdates } = parsed.data;

    // If status is changing to active, set published_at
    if (pollUpdates.status === 'active' && currentPoll.status !== 'active') {
      pollUpdates.published_at = new Date().toISOString();
    }

    // Update poll
    if (Object.keys(pollUpdates).length > 0) {
      const { error: pollError } = await supabase
        .from('polls')
        .update(pollUpdates)
        .eq('id', id);

      if (pollError) {
        await logError({
          errorType: ErrorTypes.DATABASE_ERROR,
          errorMessage: pollError.message,
          endpoint: `/api/admin/polls/${id}`,
          method: 'PUT',
          requestBody: body,
          userId: supporter.id,
          userEmail: supporter.email,
          request,
        });
        return NextResponse.json({ ok: false, error: pollError.message }, { status: 500 });
      }
    }

    // Update choices if provided
    if (choices && choices.length > 0) {
      // Get existing choices
      const { data: existingChoices } = await supabase
        .from('poll_choices')
        .select('id')
        .eq('poll_id', id);

      const existingIds = new Set(existingChoices?.map((c) => c.id) || []);
      const newChoiceIds = new Set(choices.filter((c) => c.id).map((c) => c.id));

      // Delete removed choices
      const toDelete = [...existingIds].filter((id) => !newChoiceIds.has(id));
      if (toDelete.length > 0) {
        await supabase.from('poll_choices').delete().in('id', toDelete);
      }

      // Upsert choices
      for (let i = 0; i < choices.length; i++) {
        const choice = choices[i];
        if (choice.id) {
          // Update existing
          await supabase
            .from('poll_choices')
            .update({
              choice_text: choice.choice_text,
              display_order: choice.display_order ?? i,
            })
            .eq('id', choice.id);
        } else {
          // Insert new
          await supabase.from('poll_choices').insert({
            poll_id: id,
            choice_text: choice.choice_text,
            display_order: choice.display_order ?? i,
          });
        }
      }
    }

    await logAudit({
      eventType: 'POLL_UPDATED',
      supporterId: supporter.id,
      targetId: id,
      targetType: 'poll',
      oldValues: { status: currentPoll.status, title: currentPoll.title },
      newValues: pollUpdates,
      details: {
        pollTitle: pollUpdates.title || currentPoll.title,
        updatedBy: `${supporter.first_name} ${supporter.last_name}`,
      },
      request,
      requestBody: body,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/admin/polls/${id}`,
      method: 'PUT',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

// DELETE - Delete poll
export async function DELETE(request, { params }) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabase();

  try {
    // Get poll for logging
    const { data: poll } = await supabase
      .from('polls')
      .select('title, status')
      .eq('id', id)
      .single();

    if (!poll) {
      return NextResponse.json({ ok: false, error: 'Poll not found' }, { status: 404 });
    }

    // Delete poll (cascade will delete choices and votes)
    const { error } = await supabase.from('polls').delete().eq('id', id);

    if (error) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: error.message,
        endpoint: `/api/admin/polls/${id}`,
        method: 'DELETE',
        userId: supporter.id,
        userEmail: supporter.email,
        request,
      });
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    await logAudit({
      eventType: 'POLL_DELETED',
      supporterId: supporter.id,
      targetId: id,
      targetType: 'poll',
      oldValues: { title: poll.title, status: poll.status },
      details: {
        pollTitle: poll.title,
        deletedBy: `${supporter.first_name} ${supporter.last_name}`,
      },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: `/api/admin/polls/${id}`,
      method: 'DELETE',
      userId: supporter.id,
      userEmail: supporter.email,
      request,
    });
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
