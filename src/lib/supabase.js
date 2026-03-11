/**
 * Supabase Client - Lazy initialization to avoid build-time errors
 *
 * Configuration:
 * - 30 second timeout for all queries (increased from 15s for cold starts)
 * - Retry logic for transient network failures
 * - Connection keepalive for better performance
 */

import { createClient } from '@supabase/supabase-js';

let supabaseServiceClient = null;
let supabaseAnonClient = null;

/**
 * Create a fetch wrapper with timeout and retry logic
 * Handles Supabase cold starts and transient network issues
 */
function createFetchWithTimeout(timeoutMs = 30000) {
  return async (url, options = {}) => {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          // Enable keepalive for better connection reuse
          keepalive: true,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error) {
        clearTimeout(timeoutId);
        lastError = error;

        // Don't retry on abort (timeout) for the last attempt
        if (attempt === maxRetries) {
          throw error;
        }

        // Only retry on network errors, not on abort/timeout
        if (error.name === 'AbortError') {
          // Timeout - don't retry, throw immediately
          throw new Error(`Database query timed out after ${timeoutMs / 1000}s. Please try again.`);
        }

        // Wait before retry (exponential backoff: 500ms, 1000ms)
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }

    throw lastError;
  };
}

/**
 * Get Supabase client (service role)
 * Use this for server-side operations that need full access
 * Returns null if env vars are missing (allows graceful build-time handling)
 */
export function getSupabase() {
  if (!supabaseServiceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE) {
      console.warn('SUPABASE_SERVICE_ROLE is deprecated. Rename to SUPABASE_SERVICE_ROLE_KEY.');
    }

    // Return null during build time when env vars aren't available
    // Pages using ISR will fetch real data on first request
    if (!url || !key) {
      return null;
    }

    supabaseServiceClient = createClient(url, key, {
      global: {
        fetch: createFetchWithTimeout(30000), // 30 second timeout with retry for cold starts
      },
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false, // Server-side doesn't need session persistence
        autoRefreshToken: false,
      },
    });
  }
  return supabaseServiceClient;
}

/**
 * Get Supabase client (anon key)
 * Use this for public API routes with RLS
 * Returns null if env vars are missing (allows graceful build-time handling)
 */
export function getSupabaseAnon() {
  if (!supabaseAnonClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    // Return null during build time when env vars aren't available
    if (!url || !key) {
      return null;
    }

    supabaseAnonClient = createClient(url, key, {
      global: {
        fetch: createFetchWithTimeout(30000), // 30 second timeout with retry for cold starts
      },
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseAnonClient;
}

/**
 * Create a new Supabase client instance
 * Use when you need a fresh client (e.g., for testing)
 */
export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(url, key);
}
