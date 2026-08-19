import { createClient } from '@supabase/supabase-js';
import { env } from './environment.js';

// Service-role client: full DB access, bypasses Row Level Security.
// Use ONLY in trusted server-side code (services), never expose this client or key to the frontend.
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Builds a request-scoped client that acts AS the calling user, so RLS policies
// still apply. Use this when you want the database itself to enforce permissions.
export function supabaseForUserToken(accessToken) {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
