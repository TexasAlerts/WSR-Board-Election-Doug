import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { sendWeeklyDigestEmail } from '../../../../lib/emailService';
import { logAudit, logError, AuditEvents, ErrorTypes } from '../../../../lib/logging';

/**
 * Weekly digest cron endpoint.
 * Triggered by Vercel Cron (see vercel.json) or manually by admin.
 * Sends digest of poll/idea activity to participants who opted in.
 */
export async function POST(request) {
  // Verify cron secret OR admin session
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const isCronAuth = cronSecret && authHeader === `Bearer ${cronSecret}`;

  let isAdminAuth = false;
  if (!isCronAuth) {
    const supporter = await getCurrentSupporter();
    isAdminAuth = !!(supporter && isAdmin(supporter));
  }

  if (!isCronAuth && !isAdminAuth) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: 'Database connection unavailable' }, { status: 503 });
  }
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const since = oneWeekAgo.toISOString();

  try {
    // Dedup guard: skip if a digest was already sent in the last 6 days (cron only)
    if (isCronAuth) {
      const sixDaysAgo = new Date();
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
      const { data: recentDigest } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('event_type', AuditEvents.BROADCAST_SENT)
        .gt('created_at', sixDaysAgo.toISOString())
        .contains('details', { type: 'weekly_digest' })
        .limit(1);

      if (recentDigest && recentDigest.length > 0) {
        return NextResponse.json({
          ok: true,
          message: 'Digest already sent this week',
          sent: 0,
          skipped: true,
        });
      }
    }

    // Get all emails that have weekly digest enabled
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email, unsubscribe_token, supporter_id')
      .eq('email_on_weekly_digest', true);

    if (!prefs || prefs.length === 0) {
      return NextResponse.json({ ok: true, message: 'No subscribers', sent: 0 });
    }

    // Batch fetch all emails to get supporter IDs for those who don't have supporter_id in prefs
    const emails = prefs.map((p) => p.email);
    const { data: supporters } = await supabase
      .from('supporters')
      .select('id, email, first_name')
      .in('email', emails);

    const supporterByEmail = new Map();
    (supporters || []).forEach((s) => {
      supporterByEmail.set(s.email.toLowerCase(), s);
    });

    // Get all verified voters for name lookup
    const { data: voters } = await supabase
      .from('verified_voters')
      .select('email, first_name')
      .in('email', emails);

    const voterByEmail = new Map();
    (voters || []).forEach((v) => {
      voterByEmail.set(v.email.toLowerCase(), v);
    });

    // Batch fetch all poll votes for these emails
    const { data: allPollVotes } = await supabase
      .from('poll_votes')
      .select('poll_id, voter_email')
      .in('voter_email', emails);

    const pollVotesByEmail = new Map();
    (allPollVotes || []).forEach((v) => {
      const email = v.voter_email?.toLowerCase();
      if (!email) return;
      if (!pollVotesByEmail.has(email)) pollVotesByEmail.set(email, new Set());
      pollVotesByEmail.get(email).add(v.poll_id);
    });

    // Get all unique poll IDs that any subscriber voted on
    const allPollIds = [...new Set((allPollVotes || []).map((v) => v.poll_id))];

    // Batch fetch poll data
    const { data: polls } = allPollIds.length > 0
      ? await supabase.from('polls').select('id, title, status').in('id', allPollIds)
      : { data: [] };

    const pollById = new Map();
    (polls || []).forEach((p) => pollById.set(p.id, p));

    // Batch fetch poll vote counts
    const { data: pollVoteCounts } = allPollIds.length > 0
      ? await supabase
          .from('poll_votes')
          .select('poll_id')
          .in('poll_id', allPollIds)
      : { data: [] };

    const totalVotesByPoll = new Map();
    (pollVoteCounts || []).forEach((v) => {
      totalVotesByPoll.set(v.poll_id, (totalVotesByPoll.get(v.poll_id) || 0) + 1);
    });

    // Batch fetch new poll vote counts (last week)
    const { data: newPollVoteCounts } = allPollIds.length > 0
      ? await supabase
          .from('poll_votes')
          .select('poll_id')
          .in('poll_id', allPollIds)
          .gt('created_at', since)
      : { data: [] };

    const newVotesByPoll = new Map();
    (newPollVoteCounts || []).forEach((v) => {
      newVotesByPoll.set(v.poll_id, (newVotesByPoll.get(v.poll_id) || 0) + 1);
    });

    // Batch fetch idea supports by email
    const { data: allIdeaSupports } = await supabase
      .from('idea_supports')
      .select('idea_id, supporter_email')
      .in('supporter_email', emails);

    const ideaSupportsByEmail = new Map();
    (allIdeaSupports || []).forEach((s) => {
      const email = s.supporter_email?.toLowerCase();
      if (!email) return;
      if (!ideaSupportsByEmail.has(email)) ideaSupportsByEmail.set(email, new Set());
      ideaSupportsByEmail.get(email).add(s.idea_id);
    });

    // Batch fetch idea votes by supporter_id
    const supporterIds = [...supporterByEmail.values()].map((s) => s.id);
    const { data: allIdeaVotes } = supporterIds.length > 0
      ? await supabase
          .from('idea_votes')
          .select('idea_id, supporter_id')
          .in('supporter_id', supporterIds)
      : { data: [] };

    const ideaVotesBySupporterId = new Map();
    (allIdeaVotes || []).forEach((v) => {
      if (!ideaVotesBySupporterId.has(v.supporter_id)) ideaVotesBySupporterId.set(v.supporter_id, new Set());
      ideaVotesBySupporterId.get(v.supporter_id).add(v.idea_id);
    });

    // Get all unique idea IDs
    const allIdeaIds = new Set();
    ideaSupportsByEmail.forEach((ids) => ids.forEach((id) => allIdeaIds.add(id)));
    ideaVotesBySupporterId.forEach((ids) => ids.forEach((id) => allIdeaIds.add(id)));

    // Batch fetch idea data
    const ideaIdArray = [...allIdeaIds];
    const { data: ideas } = ideaIdArray.length > 0
      ? await supabase.from('ideas').select('id, title').in('id', ideaIdArray)
      : { data: [] };

    const ideaById = new Map();
    (ideas || []).forEach((i) => ideaById.set(i.id, i));

    // Batch fetch new idea vote counts
    const { data: newIdeaVoteCounts } = ideaIdArray.length > 0
      ? await supabase
          .from('idea_votes')
          .select('idea_id')
          .in('idea_id', ideaIdArray)
          .gt('created_at', since)
      : { data: [] };

    const newVotesByIdea = new Map();
    (newIdeaVoteCounts || []).forEach((v) => {
      newVotesByIdea.set(v.idea_id, (newVotesByIdea.get(v.idea_id) || 0) + 1);
    });

    // Batch fetch new comments on polls
    const { data: newPollComments } = allPollIds.length > 0
      ? await supabase
          .from('comments')
          .select('poll_id')
          .in('poll_id', allPollIds)
          .eq('status', 'approved')
          .gt('created_at', since)
      : { data: [] };

    const newCommentsByPoll = new Map();
    (newPollComments || []).forEach((c) => {
      newCommentsByPoll.set(c.poll_id, (newCommentsByPoll.get(c.poll_id) || 0) + 1);
    });

    let sent = 0;

    for (const pref of prefs) {
      const { email, unsubscribe_token } = pref;
      const emailLower = email.toLowerCase();

      // Get poll digest for this user
      const userPollIds = pollVotesByEmail.get(emailLower) || new Set();
      const pollDigest = [];
      for (const pollId of userPollIds) {
        const poll = pollById.get(pollId);
        if (!poll || poll.status !== 'active') continue;

        const newVotes = newVotesByPoll.get(pollId) || 0;
        if (newVotes > 0) {
          pollDigest.push({
            title: poll.title,
            totalVotes: totalVotesByPoll.get(pollId) || 0,
            newVotes,
          });
        }
      }

      // Get idea digest for this user
      const supporter = supporterByEmail.get(emailLower);
      const userIdeaIds = new Set();

      // Add ideas from supports (email-based)
      const supportedIdeas = ideaSupportsByEmail.get(emailLower) || new Set();
      supportedIdeas.forEach((id) => userIdeaIds.add(id));

      // Add ideas from votes (supporter_id-based)
      if (supporter) {
        const votedIdeas = ideaVotesBySupporterId.get(supporter.id) || new Set();
        votedIdeas.forEach((id) => userIdeaIds.add(id));
      }

      const ideaDigest = [];
      for (const ideaId of userIdeaIds) {
        const idea = ideaById.get(ideaId);
        if (!idea) continue;

        const newVotes = newVotesByIdea.get(ideaId) || 0;
        if (newVotes > 0) {
          ideaDigest.push({ title: idea.title, newVotes });
        }
      }

      // Count new comments on participated polls
      let newComments = 0;
      for (const pollId of userPollIds) {
        newComments += newCommentsByPoll.get(pollId) || 0;
      }

      // Skip if nothing to report
      if (pollDigest.length === 0 && ideaDigest.length === 0 && newComments === 0) continue;

      // Get name for greeting
      const voter = voterByEmail.get(emailLower);
      const name = supporter?.first_name || voter?.first_name || 'Neighbor';

      await sendWeeklyDigestEmail(
        email,
        name,
        {
          polls: pollDigest,
          ideas: ideaDigest,
          newComments,
        },
        unsubscribe_token
      );

      sent++;
    }

    await logAudit({
      eventType: AuditEvents.BROADCAST_SENT,
      details: { type: 'weekly_digest', recipientCount: sent },
      request,
      responseStatus: 200,
    });

    return NextResponse.json({ ok: true, sent });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/weekly-digest',
      method: 'POST',
      request,
    });
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
