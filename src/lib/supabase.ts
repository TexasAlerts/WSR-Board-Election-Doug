/**
 * Supabase Client - Lazy initialization to avoid build-time errors
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

let supabaseServiceClient: SupabaseClient<Database> | null = null;
let supabaseAnonClient: SupabaseClient<Database> | null = null;

/**
 * Get Supabase client (service role)
 * Use this for server-side operations that need full access
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseServiceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !key) {
      throw new Error(
        'Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
      );
    }

    supabaseServiceClient = createClient<Database>(url, key);
  }
  return supabaseServiceClient;
}

/**
 * Get Supabase client (anon key)
 * Use this for public API routes with RLS
 */
export function getSupabaseAnon(): SupabaseClient<Database> {
  if (!supabaseAnonClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.'
      );
    }

    supabaseAnonClient = createClient<Database>(url, key);
  }
  return supabaseAnonClient;
}

/**
 * Create a new Supabase client instance
 * Use when you need a fresh client (e.g., for testing)
 */
export function createSupabaseClient(): SupabaseClient<Database> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    throw new Error('Supabase configuration missing');
  }

  return createClient<Database>(url, key);
}
