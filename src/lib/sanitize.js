/**
 * Strip HTML tags and trim whitespace from user input strings.
 * React auto-escapes on render, but this prevents storing raw HTML in the database.
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitize all string values in an object (shallow, one level deep).
 */
export function sanitizeObject(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitizeText(value) : value;
  }
  return result;
}
