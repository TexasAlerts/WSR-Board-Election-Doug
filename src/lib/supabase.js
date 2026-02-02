/**
 * Supabase client initialization module with lazy loading.
 * Provides singleton instances of Supabase clients with different access levels.
 * Clients are initialized on first use to avoid build-time errors.
 *
 * @module supabase
 */

import { createClient } from '@supabase/supabase-js';

let supabaseServiceClient = null;
let supabaseAnonClient = null;

/**
 * Get the singleton Supabase client with service role permissions.
 * This client bypasses Row Level Security (RLS) and has full database access.
 * Use this for server-side operations that require elevated privileges.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase service role client
 * @throws {Error} When SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing
 *
 * @example
 * const supabase = getSupabase();
 * const { data, error } = await supabase
 *   .from('supporters')
 *   .select('*')
 *   .eq('status', 'approved');
 */
export function getSupabase() {
  if (!supabaseServiceClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

    if (!url || !key) {
      throw new Error('Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.');
    }

    supabaseServiceClient = createClient(url, key);
  }
  return supabaseServiceClient;
}

/**
 * Get the singleton Supabase client with anonymous (public) permissions.
 * This client respects Row Level Security (RLS) policies and is suitable for
 * public-facing API routes that don't require elevated privileges.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient} Supabase anonymous client
 * @throws {Error} When SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing
 *
 * @example
 * const supabase = getSupabaseAnon();
 * const { data, error } = await supabase
 *   .from('polls')
 *   .select('*')
 *   .eq('visibility', 'public');
 */
export function getSupabaseAnon() {
  if (!supabaseAnonClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error('Supabase configuration missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.');
    }

    supabaseAnonClient = createClient(url, key);
  }
  return supabaseAnonClient;
}

/**
 * Create a new Supabase client instance with service role permissions.
 * Unlike getSupabase(), this creates a new client instance each time instead
 * of returning a singleton. Useful for testing or when you need isolated clients.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient} New Supabase service role client
 * @throws {Error} When SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables are missing
 *
 * @example
 * // Create a fresh client for testing
 * const testClient = createSupabaseClient();
 */
export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !key) {
    throw new Error('Supabase configuration missing');
  }

  return createClient(url, key);
}
