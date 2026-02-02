import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input using DOMPurify to prevent XSS attacks.
 * Strips all HTML tags and returns plain text only.
 *
 * DOMPurify provides comprehensive protection against:
 * - HTML injection
 * - JavaScript execution
 * - Event handler injection
 * - CSS-based attacks
 * - HTML entity exploits
 *
 * @param {string} input - The user input to sanitize
 * @returns {string} - Sanitized plain text
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';

  // Configure DOMPurify to strip all HTML tags, returning only text
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content
  });

  return clean.trim();
}

/**
 * Sanitize HTML content while allowing safe HTML tags.
 * Use this for rich text content that needs basic formatting.
 *
 * Allows only: <p>, <br>, <strong>, <em>, <u>, <a> (with href only)
 *
 * @param {string} input - HTML content to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(input) {
  if (typeof input !== 'string') return '';

  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });

  return clean;
}

/**
 * Sanitize all string values in an object (shallow, one level deep).
 *
 * @param {Object} obj - Object with string values to sanitize
 * @returns {Object} - Object with sanitized values
 */
export function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitizeText(value) : value;
  }
  return result;
}
