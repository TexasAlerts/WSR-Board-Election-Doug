import { getSupabase } from './supabase';

/**
 * Supabase-backed rate limiter for serverless environments.
 * Uses the check_rate_limit() RPC function for atomic check-and-increment.
 * Falls open (allows request) on Supabase errors to avoid blocking users.
 */

/**
 * Rate limit with retry-after support.
 * @param {string} key - Rate limit key (typically IP or "prefix:IP")
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {Promise<{ allowed: boolean, retryAfter: number }>}
 */
export async function rateLimitWithRetry(key, limit = 5, windowMs = 60_000) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return { allowed: true, retryAfter: 0 };
    }

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_limit: limit,
      p_window_ms: windowMs,
    });

    if (error) {
      console.error('Rate limit check failed:', error.message);
      return { allowed: true, retryAfter: 0 };
    }

    const row = data?.[0];
    if (!row) {
      return { allowed: true, retryAfter: 0 };
    }

    return {
      allowed: row.allowed,
      retryAfter: row.allowed ? 0 : Math.max(1, row.retry_after),
    };
  } catch (err) {
    console.error('Rate limit error:', err.message);
    return { allowed: true, retryAfter: 0 };
  }
}

/**
 * Rate limit check (simple boolean).
 * @param {string} key - Rate limit key (typically IP or "prefix:IP")
 * @param {number} limit - Max requests per window
 * @param {number} windowMs - Window size in milliseconds
 * @returns {Promise<boolean>} true if within limit, false if rate limited
 */
export async function rateLimit(key, limit = 5, windowMs = 60_000) {
  const result = await rateLimitWithRetry(key, limit, windowMs);
  return result.allowed;
}
