/**
 * SMS Service using Telnyx
 * Requires TELNYX_API_KEY and TELNYX_PHONE_NUMBER environment variables
 */

import Telnyx from 'telnyx';

let telnyxClient = null;

function getTelnyxClient() {
  if (!telnyxClient && process.env.TELNYX_API_KEY) {
    telnyxClient = new Telnyx(process.env.TELNYX_API_KEY);
  }
  return telnyxClient;
}

/**
 * Send an SMS message
 * @param {string} to - Recipient phone number in E.164 format
 * @param {string} message - Message content (160 char limit for single SMS)
 * @returns {Promise<{ success: boolean, messageId: string | null, error: string | null }>}
 */
export async function sendSMS(to, message) {
  const client = getTelnyxClient();
  const fromNumber = process.env.TELNYX_PHONE_NUMBER;

  if (!client || !fromNumber) {
    console.error('Telnyx not configured. TELNYX_API_KEY or TELNYX_PHONE_NUMBER missing.');
    return {
      success: false,
      messageId: null,
      error: 'SMS service not configured',
    };
  }

  try {
    const response = await client.messages.create({
      from: fromNumber,
      to: to,
      text: message,
    });

    return {
      success: true,
      messageId: response.data?.id || null,
      error: null,
    };
  } catch (err) {
    console.error('Telnyx SMS error:', err);
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
  const message = `Your Doug Charles for Prosper verification code is: ${code}\n\nThis code expires in 10 minutes.`;
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
