/**
 * Supabase Client - Lazy initialization to avoid build-time errors
 */

import { createClient } from '@supabase/supabase-js';

let supabaseServiceClient = null;
let supabaseAnonClient = null;

/**
 * Create a fetch wrapper with timeout
 */
function createFetchWithTimeout(timeoutMs = 15000) {
  return (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, {
      ...options,
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
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

    // Return null during build time when env vars aren't available
    // Pages using ISR will fetch real data on first request
    if (!url || !key) {
      return null;
    }

    supabaseServiceClient = createClient(url, key, {
      global: {
        fetch: createFetchWithTimeout(15000), // 15 second timeout for all queries
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
        fetch: createFetchWithTimeout(15000), // 15 second timeout for all queries
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
