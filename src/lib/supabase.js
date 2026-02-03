/**
 * Supabase Client - Lazy initialization to avoid build-time errors
 */

import { createClient } from '@supabase/supabase-js';

let supabaseServiceClient = null;
let supabaseAnonClient = null;

/**
 * Get Supabase client (service role)
 * Use this for server-side operations that need full access
 */
export function getSupabase() {
  if (!supabaseServiceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !key) {
      throw new Error(
        'Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
      );
    }

    supabaseServiceClient = createClient(url, key);
  }
  return supabaseServiceClient;
}

/**
 * Get Supabase client (anon key)
 * Use this for public API routes with RLS
 */
export function getSupabaseAnon() {
  if (!supabaseAnonClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.'
      );
    }

    supabaseAnonClient = createClient(url, key);
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
