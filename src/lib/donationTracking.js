/**
 * Donation Tracking Module
 *
 * Tracks donation funnel events to understand drop-offs before Anedot redirect.
 * Events: page_view -> amount_selected -> donate_clicked
 *
 * Since the actual donation happens on Anedot (external), we can only track
 * up to the point where the user clicks the donate button.
 */

import { getSupabase } from './supabase';
import { getRequestMeta, parseUserAgent } from './logging';

/**
 * Donation event types
 */
export const DonationEventTypes = {
  PAGE_VIEW: 'page_view',           // User views the donate page
  AMOUNT_SELECTED: 'amount_selected', // User selects a preset amount
  CUSTOM_AMOUNT: 'custom_amount',     // User enters a custom amount
  DONATE_CLICKED: 'donate_clicked',   // User clicks donate button (before redirect)
};

/**
 * Track a donation funnel event
 *
 * @param {Object} params - Event parameters
 * @param {string} params.eventType - Type from DonationEventTypes
 * @param {string} [params.visitorSessionId] - Visitor session ID
 * @param {string} [params.supporterId] - Supporter ID (if logged in)
 * @param {number} [params.selectedAmount] - Amount in cents
 * @param {boolean} [params.isCustomAmount] - Whether it's a custom amount
 * @param {string} [params.anedotRedirectUrl] - Anedot URL (for donate_clicked)
 * @param {Request} [params.request] - HTTP request object
 */
export async function trackDonationEvent({
  eventType,
  visitorSessionId = null,
  supporterId = null,
  selectedAmount = null,
  isCustomAmount = false,
  anedotRedirectUrl = null,
  request = null,
}) {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const meta = request ? getRequestMeta(request) : {};
    const { device } = request ? parseUserAgent(meta.userAgent) : { device: 'unknown' };

    const { data, error } = await supabase
      .from('donation_events')
      .insert({
        event_type: eventType,
        visitor_session_id: visitorSessionId,
        supporter_id: supporterId,
        selected_amount: selectedAmount,
        is_custom_amount: isCustomAmount,
        anedot_redirect_url: anedotRedirectUrl,
        ip_address: meta.ip || null,
        user_agent: meta.userAgent || null,
        device_type: device,
        referrer: request?.headers?.get('referer') || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to track donation event:', error);
      return null;
    }

    return data.id;
  } catch (err) {
    console.error('Donation tracking error:', err);
    return null;
  }
}

/**
 * Get donation funnel analytics for a date range
 *
 * Returns funnel metrics:
 * - Total page views
 * - Amount selections (and breakdown by amount)
 * - Donate clicks
 * - Conversion rates
 *
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Promise<Object>} Funnel analytics
 */
export async function getDonationFunnelAnalytics(startDate, endDate) {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    // Get all events in date range
    const { data: events, error } = await supabase
      .from('donation_events')
      .select('event_type, selected_amount, is_custom_amount, device_type, created_at')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Failed to get donation analytics:', error);
      return null;
    }

    // Calculate funnel metrics
    const pageViews = events.filter((e) => e.event_type === DonationEventTypes.PAGE_VIEW).length;
    const amountSelections = events.filter((e) =>
      e.event_type === DonationEventTypes.AMOUNT_SELECTED ||
      e.event_type === DonationEventTypes.CUSTOM_AMOUNT
    );
    const donateClicks = events.filter((e) => e.event_type === DonationEventTypes.DONATE_CLICKED);

    // Amount breakdown
    const amountBreakdown = {};
    amountSelections.forEach((e) => {
      const key = e.is_custom_amount ? 'custom' : `$${e.selected_amount / 100}`;
      amountBreakdown[key] = (amountBreakdown[key] || 0) + 1;
    });

    // Device breakdown
    const deviceBreakdown = { mobile: 0, tablet: 0, desktop: 0, unknown: 0 };
    events.forEach((e) => {
      const device = e.device_type || 'unknown';
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;
    });

    // Calculate conversion rates
    const selectionRate = pageViews > 0 ? (amountSelections.length / pageViews) * 100 : 0;
    const clickRate = amountSelections.length > 0
      ? (donateClicks.length / amountSelections.length) * 100
      : 0;
    const overallConversion = pageViews > 0 ? (donateClicks.length / pageViews) * 100 : 0;

    return {
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      funnel: {
        pageViews,
        amountSelections: amountSelections.length,
        donateClicks: donateClicks.length,
      },
      conversionRates: {
        pageToSelection: `${selectionRate.toFixed(1)}%`,
        selectionToClick: `${clickRate.toFixed(1)}%`,
        overall: `${overallConversion.toFixed(1)}%`,
      },
      amountBreakdown,
      deviceBreakdown,
    };
  } catch (err) {
    console.error('Donation analytics error:', err);
    return null;
  }
}

/**
 * Get recent donation activity (for admin dashboard)
 *
 * @param {number} limit - Number of recent events to return
 * @returns {Promise<Array>} Recent donation events
 */
export async function getRecentDonationActivity(limit = 50) {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('donation_events')
      .select(`
        *,
        supporter:supporters(first_name, last_name, email),
        session:visitor_sessions(entry_url, referrer)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get recent donation activity:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Recent donation activity error:', err);
    return [];
  }
}
