import {
  createClient
} from '@supabase/supabase-js';


// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const supabaseUrl = 
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;


// ============================================================
// VALIDATE ENV
// ============================================================

if (!supabaseUrl) {

  throw new Error(
    'SUPABASE_URL is missing from backend .env'
  );
}


if (!supabaseServiceRoleKey) {

  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY is missing from backend .env'
  );
}


// ============================================================
// SUPABASE ADMIN CLIENT
// ============================================================
//
// NEVER expose this key to React/Vite.
//
// This file belongs ONLY to Node.js backend.
//
// ============================================================

export const supabaseAdmin =
  createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );