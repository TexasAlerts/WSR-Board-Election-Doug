const requests = new Map();

// Cleanup stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRY_AGE = 60 * 60 * 1000; // 1 hour

let cleanupTimer = null;

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
 * Basic in-memory IP rate limiter with retry-after support.
 * @param {string} ip - Client IP address
 * @param {number} limit - Number of allowed requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {{ allowed: boolean, retryAfter: number }} - Whether allowed and seconds until reset
 */
export function rateLimitWithRetry(ip, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const entry = requests.get(ip) || { count: 0, startTime: now };

  if (now - entry.startTime > windowMs) {
    entry.count = 1;
    entry.startTime = now;
  } else {
    entry.count += 1;
  }

  requests.set(ip, entry);

  const allowed = entry.count <= limit;
  const retryAfter = allowed ? 0 : Math.ceil((entry.startTime + windowMs - now) / 1000);

  return { allowed, retryAfter };
}

/**
 * Basic in-memory IP rate limiter (backward compatible).
 * @param {string} ip - Client IP address
 * @param {number} limit - Number of allowed requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {boolean} - true if within limit, false otherwise
 */
export function rateLimit(ip, limit = 5, windowMs = 60_000) {
  return rateLimitWithRetry(ip, limit, windowMs).allowed;
}
