/**
 * Phone number validation and formatting module using libphonenumber-js.
 * Validates and formats US phone numbers to E.164 international format.
 *
 * @module phoneValidation
 */

import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Validate and format a US phone number to E.164 format.
 * Checks if the number is a valid US phone number and returns it in standardized format.
 *
 * @param {string} phone - The phone number to validate (any common format accepted)
 * @returns {{valid: boolean, formatted: string|null, error: string|null}} Validation result
 * @returns {boolean} return.valid - Whether the phone number is valid
 * @returns {string|null} return.formatted - Phone in E.164 format (+1XXXXXXXXXX) if valid
 * @returns {string|null} return.error - Error message if validation failed
 *
 * @example
 * const result = validatePhoneNumber('(972) 555-1234');
 * if (result.valid) {
 *   console.log(result.formatted); // '+19725551234'
 * } else {
 *   console.error(result.error);
 * }
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
 * Format a phone number in E.164 format to a human-readable display format.
 * Converts international format to national format for better readability.
 *
 * @param {string} e164Phone - Phone number in E.164 format (e.g., '+19725551234')
 * @returns {string} Formatted phone in national format (e.g., '(972) 555-1234'), or original input if parsing fails
 *
 * @example
 * const display = formatPhoneForDisplay('+19725551234');
 * console.log(display); // '(972) 555-1234'
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
