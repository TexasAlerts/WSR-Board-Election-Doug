import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validate a US phone number
 * @param {string} phone - The phone number to validate
 * @returns {{ valid: boolean, formatted: string | null, error: string | null }}
 */
export function validatePhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, formatted: null, error: 'Phone number is required' };
  }

  // Clean the input
  const cleaned = phone.trim();

  try {
    // Check if valid US number
    if (!isValidPhoneNumber(cleaned, 'US')) {
      return { valid: false, formatted: null, error: 'Invalid US phone number' };
    }

    // Parse and format to E.164
    const parsed = parsePhoneNumber(cleaned, 'US');
    const e164 = parsed.format('E.164'); // +1XXXXXXXXXX

    return { valid: true, formatted: e164, error: null };
  } catch (err) {
    return { valid: false, formatted: null, error: 'Could not parse phone number' };
  }
}

/**
 * Format phone number for display
 * @param {string} e164Phone - Phone in E.164 format
 * @returns {string} Formatted phone like (972) 555-1234
 */
export function formatPhoneForDisplay(e164Phone) {
  if (!e164Phone) return '';

  try {
    const parsed = parsePhoneNumber(e164Phone);
    return parsed.formatNational(); // (972) 555-1234
  } catch {
    return e164Phone;
  }
}
