import { NextResponse } from 'next/server';
import { trackDonationEvent, DonationEventTypes } from '../../../../lib/donationTracking';
import { getOrCreateVisitorSession } from '../../../../lib/sessionTracking';
import { getCurrentSupporter } from '../../../../lib/auth';
import { logError, ErrorTypes } from '../../../../lib/logging';
import { withCSRF } from '../../../../lib/withCSRF';
import { z } from 'zod';

/**
 * Track donation funnel events
 * Called from DonateDynamic component to track user journey
 */

const trackSchema = z.object({
  eventType: z.enum(['page_view', 'amount_selected', 'custom_amount', 'donate_clicked']),
  selectedAmount: z.number().int().positive().optional(),
  isCustomAmount: z.boolean().optional(),
  anedotRedirectUrl: z.string().url().optional(),
});

async function postHandler(request) {
  try {
    const body = await request.json();
    const parsed = trackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { eventType, selectedAmount, isCustomAmount, anedotRedirectUrl } = parsed.data;

    // Get or create visitor session and get supporter info
    const visitorSession = await getOrCreateVisitorSession(request);
    const visitorSessionId = visitorSession?.sessionId || null;
    const supporter = await getCurrentSupporter();

    await trackDonationEvent({
      eventType,
      visitorSessionId,
      supporterId: supporter?.id || null,
      selectedAmount: selectedAmount || null,
      isCustomAmount: isCustomAmount || false,
      anedotRedirectUrl: anedotRedirectUrl || null,
      request,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      errorType: ErrorTypes.SERVER_ERROR,
      errorMessage: err.message,
      errorStack: err.stack,
      endpoint: '/api/donation/track',
      method: 'POST',
      request,
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to track donation event' },
      { status: 500 }
    );
  }
}

export const POST = withCSRF(postHandler);
