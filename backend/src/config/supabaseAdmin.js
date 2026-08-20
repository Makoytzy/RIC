/**
 * ============================================================================
 * SUPABASE ADMIN CLIENT
 * ============================================================================
 * Service-role client for backend operations
 * NEVER expose service role key to frontend!
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('❌ SUPABASE_URL is missing from backend .env');
}

if (!supabaseServiceRoleKey) {
  throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY is missing from backend .env');
}

/**
 * Admin client with service role key
 * - Bypasses Row Level Security (RLS)
 * - Full database access
 * - Used for server-side operations only
 */
const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default supabaseAdmin;
