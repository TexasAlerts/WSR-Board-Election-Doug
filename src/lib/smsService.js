/**
 * SMS Service using Telnyx REST API
 * Requires TELNYX_API_KEY, TELNYX_PHONE_NUMBER, TELNYX_CAMPAIGN_ID, and TELNYX_TCR_ID environment variables
 */

/**
 * Send an SMS message via Telnyx REST API
 * @param {string} to - Recipient phone number in E.164 format
 * @param {string} message - Message content (160 char limit for single SMS)
 * @returns {Promise<{ success: boolean, messageId: string | null, error: string | null }>}
 */
export async function sendSMS(to, message) {
  const apiKey = process.env.TELNYX_API_KEY;
  const fromNumber = process.env.TELNYX_PHONE_NUMBER;
  const campaignId = process.env.TELNYX_CAMPAIGN_ID;
  const tcrId = process.env.TELNYX_TCR_ID;

  if (!apiKey || !fromNumber) {
    return {
      success: false,
      messageId: null,
      error: 'SMS service not configured',
    };
  }

  try {
    const messagePayload = {
      from: fromNumber,
      to: to,
      text: message,
    };

    // Add A2P 10DLC compliance fields if configured
    if (campaignId) {
      messagePayload.messaging_profile_id = campaignId;
    }

    const response = await fetch('https://api.telnyx.com/v2/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(messagePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail =
        data.errors?.[0]?.detail || data.errors?.[0]?.title || JSON.stringify(data);
      return {
        success: false,
        messageId: null,
        error: `Telnyx API ${response.status}: ${errorDetail}`,
      };
    }

    return {
      success: true,
      messageId: data.data?.id || null,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      messageId: null,
      error: err.message || 'Failed to send SMS',
    };
  }
}

/**
 * Send verification code via SMS
 * @param {string} phone - Phone number in E.164 format
 * @param {string} code - 6-digit verification code
 */
export async function sendVerificationSMS(phone, code) {
  const message = `Your Doug Charles campaign verification code is: ${code}. Valid for 10 minutes. Msg&data rates may apply. Reply STOP to end, HELP for help.`;
  return sendSMS(phone, message);
}

/**
 * Send broadcast SMS to multiple recipients
 * @param {string[]} phones - Array of phone numbers in E.164 format
 * @param {string} message - Message content
 * @returns {Promise<{ sent: number, failed: number, errors: string[] }>}
 */
export async function sendBroadcastSMS(phones, message) {
  const results = {
    sent: 0,
    failed: 0,
    errors: [],
  };

  // Add STOP instructions for compliance
  const fullMessage = `${message}\n\nReply STOP to unsubscribe.`;

  // Send in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < phones.length; i += batchSize) {
    const batch = phones.slice(i, i + batchSize);

    const promises = batch.map(async (phone) => {
      const result = await sendSMS(phone, fullMessage);
      if (result.success) {
        results.sent++;
      } else {
        results.failed++;
        results.errors.push(`${phone}: ${result.error}`);
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < phones.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Send error alert SMS to admin
 * Used by the logging system to notify admins of critical errors
 *
 * @param {string} phone - Admin phone number in E.164 format
 * @param {Object} error - Error details
 * @param {string} error.errorType - Error type
 * @param {string} error.errorMessage - Error message
 * @param {string} error.endpoint - API endpoint where error occurred
 */
export async function sendErrorAlertSMS(phone, error) {
  // Truncate message to fit SMS limits (160 chars)
  const truncatedMessage = (error.errorMessage || 'Unknown error').slice(0, 80);
  const message = `[DougCharles.com Alert] ${error.errorType}: ${truncatedMessage}`;

  return sendSMS(phone, message);
}
