/**
 * SMS messaging service using Telnyx REST API.
 * Handles SMS verification codes and broadcast messaging with A2P 10DLC compliance.
 * Supports batched sending for bulk operations.
 *
 * @module smsService
 * @requires TELNYX_API_KEY environment variable
 * @requires TELNYX_PHONE_NUMBER environment variable
 * @requires TELNYX_CAMPAIGN_ID environment variable (optional, for A2P 10DLC)
 * @requires TELNYX_TCR_ID environment variable (optional, for A2P 10DLC)
 */

/**
 * Send an SMS message via Telnyx REST API.
 * Automatically includes A2P 10DLC compliance fields if configured.
 * Messages longer than 160 characters will be sent as concatenated SMS.
 *
 * @param {string} to - Recipient phone number in E.164 format (e.g., '+19725551234')
 * @param {string} message - Message content (160 chars for single SMS, auto-concatenates if longer)
 * @returns {Promise<{success: boolean, messageId: string|null, error: string|null}>} Result with success status and message ID
 *
 * @example
 * const result = await sendSMS('+19725551234', 'Your verification code is 123456');
 * if (!result.success) {
 *   console.error('SMS failed:', result.error);
 * }
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
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(messagePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorDetail = data.errors?.[0]?.detail || data.errors?.[0]?.title || JSON.stringify(data);
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
 * Send a verification code via SMS.
 * Sends a formatted message with the code and expiration notice.
 *
 * @param {string} phone - Recipient phone number in E.164 format (e.g., '+19725551234')
 * @param {string} code - 6-digit verification code to send
 * @returns {Promise<{success: boolean, messageId: string|null, error: string|null}>} Result with success status and message ID
 *
 * @example
 * const code = generateSMSCode(); // from auth.js
 * const result = await sendVerificationSMS(supporter.phone, code);
 */
export async function sendVerificationSMS(phone, code) {
  const message = `Your Doug Charles for Prosper verification code is: ${code}\n\nThis code expires in 10 minutes.`;
  return sendSMS(phone, message);
}

/**
 * Send a broadcast SMS to multiple recipients in batches.
 * Automatically adds STOP instructions for compliance.
 * Sends in batches of 10 with small delays to avoid rate limits.
 *
 * @param {string[]} phones - Array of recipient phone numbers in E.164 format
 * @param {string} message - Message content to broadcast
 * @returns {Promise<{sent: number, failed: number, errors: string[]}>} Delivery results summary
 *
 * @example
 * const phones = supporters.map(s => s.phone).filter(Boolean);
 * const result = await sendBroadcastSMS(phones, 'Campaign update: Vote tomorrow!');
 * console.log(`Success: ${result.sent}, Failed: ${result.failed}`);
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
