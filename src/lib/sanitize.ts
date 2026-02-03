import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize user input using DOMPurify to prevent XSS attacks.
 * This works in both browser and Node.js environments via isomorphic-dompurify.
 * Removes all HTML tags and returns only plain text.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (typeof input !== 'string') return '';

  // Configure DOMPurify to strip all HTML tags
  const clean = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No attributes allowed
    KEEP_CONTENT: true, // Keep text content when removing tags
  });

  return clean.trim();
}

/**
 * Sanitize all string values in an object (shallow, one level deep).
 * Non-string values are preserved as-is.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = (
      typeof value === 'string' ? sanitizeText(value) : value
    ) as T[keyof T];
  }
  return result;
}
