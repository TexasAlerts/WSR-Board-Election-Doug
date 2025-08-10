const requests = new Map();

/**
 * Basic in-memory IP rate limiter.
 * @param {string} ip - Client IP address
 * @param {number} limit - Number of allowed requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {boolean} - true if within limit, false otherwise
 */
export function rateLimit(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = requests.get(ip) || { count: 0, startTime: now };
  if (now - entry.startTime > windowMs) {
    entry.count = 1;
    entry.startTime = now;
  } else {
    entry.count += 1;
  }
  requests.set(ip, entry);
  return entry.count <= limit;
}
