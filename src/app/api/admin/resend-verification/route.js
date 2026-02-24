import { NextResponse } from 'next/server';
import { getSupabase } from '../../../../lib/supabase';
import { getCurrentSupporter, isAdmin } from '../../../../lib/auth';
import { withCSRF } from '../../../../lib/withCSRF';
import { ensureVerifiedVoter } from '../../../../lib/verificationHelpers';
import { sendVoterVerificationEmail, sendVerificationEmail } from '../../../../lib/emailService';
import { createEmailVerification } from '../../../../lib/auth';
import { logAudit, logError, ErrorTypes } from '../../../../lib/logging';

/**
 * POST /api/admin/resend-verification
 *
 * Manually trigger resending verification emails to all pending users.
 * Requires admin authentication + CSRF token.
 */
async function postHandler(request) {
  const supporter = await getCurrentSupporter();
  if (!supporter || !isAdmin(supporter)) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Database connection unavailable' },
      { status: 503 }
    );
  }

  const results = {
    votersSent: 0,
    votersFailed: 0,
    supportersSent: 0,
    supportersFailed: 0,
    errors: [],
  };

  try {
    // 1. Resend to unverified voters
    const { data: pendingVoters, error: votersError } = await supabase
      .from('verified_voters')
      .select('id, email, name')
      .is('verified_at', null)
      .is('suspended_at', null);

    if (votersError) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: `Failed to query pending voters: ${votersError.message}`,
        endpoint: '/api/admin/resend-verification',
        method: 'POST',
        request,
      });
      return NextResponse.json(
        { ok: false, error: 'Failed to query pending voters' },
        { status: 500 }
      );
    }

    for (const voter of pendingVoters || []) {
      try {
        const { token } = await ensureVerifiedVoter(voter.email, voter.name || 'Neighbor');
        if (token) {
          const emailResult = await sendVoterVerificationEmail(
            voter.email,
            voter.name || 'Neighbor',
            token
          );
          if (emailResult.success) {
            results.votersSent++;
          } else {
            results.votersFailed++;
            results.errors.push(`voter ${voter.email}: ${emailResult.error}`);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (err) {
        results.votersFailed++;
        results.errors.push(`voter ${voter.email}: ${err.message}`);
      }
    }

    // 2. Resend to pending supporters
    const { data: pendingSupporters, error: supportersError } = await supabase
      .from('supporters')
      .select('id, email, first_name')
      .eq('status', 'pending_email');

    if (supportersError) {
      await logError({
        errorType: ErrorTypes.DATABASE_ERROR,
        errorMessage: `Failed to query pending supporters: ${supportersError.message}`,
        endpoint: '/api/admin/resend-verification',
        method: 'POST',
        request,
      });
    }

    for (const supporter of pendingSupporters || []) {
      try {
        const token = await createEmailVerification(supporter.id, 'verify');
        if (token) {
          const emailResult = await sendVerificationEmail(
            supporter.email,
            supporter.first_name || 'Supporter',
            token
          );
          if (emailResult.success) {
            results.supportersSent++;
          } else {
            results.supportersFailed++;
            results.errors.push(`supporter ${supporter.email}: ${emailResult.error}`);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (err) {
        results.supportersFailed++;
        results.errors.push(`supporter ${supporter.email}: ${err.message}`);
      }
    }

    await logAudit({
      eventType: 'VERIFICATION_REMINDER_SENT',
      details: {
        triggeredBy: 'admin',
        adminId: supporter.id,
        votersSent: results.votersSent,
        votersFailed: results.votersFailed,
        supportersSent: results.supportersSent,
        supportersFailed: results.supportersFailed,
        totalPendingVoters: pendingVoters?.length || 0,
        totalPendingSupporters: pendingSupporters?.length || 0,
      },
      request,
      responseStatus: 200,
    });

    const totalSent = results.votersSent + results.supportersSent;
    const totalFailed = results.votersFailed + results.supportersFailed;

    return NextResponse.json({
      ok: true,
      message: `Sent ${totalSent} verification email${totalSent !== 1 ? 's' : ''}${totalFailed > 0 ? ` (${totalFailed} failed)` : ''}`,
      results: {
        voters: { sent: results.votersSent, failed: results.votersFailed },
        supporters: { sent: results.supportersSent, failed: results.supportersFailed },
      },
    });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/admin/resend-verification',
      method: 'POST',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to send verification reminders' },
      { status: 500 }
    );
  }
}

export const POST = withCSRF(postHandler);
