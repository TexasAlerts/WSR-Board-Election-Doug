/**
 * In-memory rate limiting module for API endpoints.
 * Tracks request counts per IP address within sliding time windows.
 * Automatically cleans up stale entries to prevent memory leaks.
 *
 * @module rateLimit
 */

const requests = new Map();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRY_AGE = 60 * 60 * 1000; // 1 hour

let cleanupTimer = null;

/**
 * Remove entries older than MAX_ENTRY_AGE from the requests map.
 * Runs automatically on a timer to prevent memory leaks.
 *
 * @private
 */
function cleanupStaleEntries() {
  const now = Date.now();
  for (const [ip, entry] of requests.entries()) {
    if (now - entry.startTime > MAX_ENTRY_AGE) {
      requests.delete(ip);
    }
  }
}

// Start cleanup timer if not already running
if (typeof cleanupTimer !== 'number') {
  cleanupTimer = setInterval(cleanupStaleEntries, CLEANUP_INTERVAL);
  // Prevent timer from keeping Node.js process alive
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request from an IP address is within rate limits.
 * Uses a sliding window algorithm to track requests per IP.
 * When the window expires, the counter resets automatically.
 *
 * @param {string} ip - Client IP address to check
 * @param {number} [limit=5] - Maximum number of allowed requests per window
 * @param {number} [windowMs=60000] - Time window in milliseconds (default 1 minute)
 * @returns {boolean} True if request is within limit, false if limit exceeded
 *
 * @example
 * // Allow 5 requests per minute
 * if (!rateLimit(clientIp)) {
 *   return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
 * }
 *
 * @example
 * // Custom limits: 10 requests per 5 minutes
 * if (!rateLimit(clientIp, 10, 5 * 60 * 1000)) {
 *   return Response.json({ error: 'Too many requests' }, { status: 429 });
 * }
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
