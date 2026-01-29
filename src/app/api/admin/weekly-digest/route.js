import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { sendWeeklyDigestEmail } from '../../../../lib/emailService';
import { logAudit, AuditEvents } from '../../../../lib/logging';

/**
 * Weekly digest cron endpoint.
 * Triggered by Vercel Cron (see vercel.json) or manually by admin.
 * Sends digest of poll/idea activity to participants who opted in.
 */
export async function POST(request) {
  // Verify cron secret or admin auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const since = oneWeekAgo.toISOString();

  try {
    // Get all emails that have weekly digest enabled
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email, unsubscribe_token')
      .eq('email_on_weekly_digest', true);

    if (!prefs || prefs.length === 0) {
      return NextResponse.json({ ok: true, message: 'No subscribers', sent: 0 });
    }

    let sent = 0;

    for (const pref of prefs) {
      const { email, unsubscribe_token } = pref;

      // Find polls this user voted on
      const { data: votes } = await supabase
        .from('poll_votes')
        .select('poll_id')
        .eq('voter_email', email);

      const pollIds = [...new Set((votes || []).map(v => v.poll_id))];

      // Get poll data with new vote counts
      const pollDigest = [];
      for (const pollId of pollIds) {
        const { data: poll } = await supabase
          .from('polls')
          .select('title, status')
          .eq('id', pollId)
          .single();

        if (!poll || poll.status !== 'active') continue;

        const { count: totalVotes } = await supabase
          .from('poll_votes')
          .select('id', { count: 'exact', head: true })
          .eq('poll_id', pollId);

        const { count: newVotes } = await supabase
          .from('poll_votes')
          .select('id', { count: 'exact', head: true })
          .eq('poll_id', pollId)
          .gt('created_at', since);

        if (newVotes > 0) {
          pollDigest.push({ title: poll.title, totalVotes, newVotes });
        }
      }

      // Find ideas this user interacted with
      const { data: ideaVotes } = await supabase
        .from('idea_votes')
        .select('idea_id')
        .eq('supporter_id', email); // note: idea_votes uses supporter_id not email

      // Also check idea_supports for email-based support
      const { data: ideaSupports } = await supabase
        .from('idea_supports')
        .select('idea_id')
        .eq('supporter_email', email);

      const ideaIds = [...new Set([
        ...((ideaVotes || []).map(v => v.idea_id)),
        ...((ideaSupports || []).map(s => s.idea_id)),
      ])];

      const ideaDigest = [];
      for (const ideaId of ideaIds) {
        const { data: idea } = await supabase
          .from('ideas')
          .select('title')
          .eq('id', ideaId)
          .single();

        if (!idea) continue;

        const { count: newVotes } = await supabase
          .from('idea_votes')
          .select('id', { count: 'exact', head: true })
          .eq('idea_id', ideaId)
          .gt('created_at', since);

        if (newVotes > 0) {
          ideaDigest.push({ title: idea.title, newVotes });
        }
      }

      // Count new comments on participated polls/ideas
      let newComments = 0;
      if (pollIds.length > 0) {
        const { count } = await supabase
          .from('comments')
          .select('id', { count: 'exact', head: true })
          .in('poll_id', pollIds)
          .eq('status', 'approved')
          .gt('created_at', since);
        newComments += count || 0;
      }

      // Skip if nothing to report
      if (pollDigest.length === 0 && ideaDigest.length === 0 && newComments === 0) continue;

      // Get name for greeting
      const { data: supporter } = await supabase
        .from('supporters')
        .select('first_name')
        .eq('email', email)
        .single();

      const { data: voter } = !supporter ? await supabase
        .from('verified_voters')
        .select('first_name')
        .eq('email', email)
        .single() : { data: null };

      const name = supporter?.first_name || voter?.first_name || 'Neighbor';

      await sendWeeklyDigestEmail(email, name, {
        polls: pollDigest,
        ideas: ideaDigest,
        newComments,
      }, unsubscribe_token);

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
    console.error('Weekly digest error:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
