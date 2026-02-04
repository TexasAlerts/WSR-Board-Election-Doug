/**
 * Sanitize user input to prevent XSS attacks.
 * Strips all HTML tags and decodes HTML entities, returning only plain text.
 * Works in serverless environments without DOM dependencies.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (typeof input !== 'string') return '';

  // Strip all HTML tags
  let clean = input.replace(/<[^>]*>/g, '');

  // Decode common HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x27;': "'",
    '&apos;': "'",
    '&#x2F;': '/',
    '&#47;': '/',
    '&nbsp;': ' ',
  };

  for (const [entity, char] of Object.entries(entities)) {
    clean = clean.replace(new RegExp(entity, 'gi'), char);
  }

  // Decode numeric HTML entities (&#NNN; and &#xHHH;)
  clean = clean.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  clean = clean.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

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
