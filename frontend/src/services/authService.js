// ============================================================
// AUTH SERVICE
// ============================================================

import { supabase } from '../config/supabase.js';

const API_URL = 'http://localhost:4000/api/auth';

// ── Sign Up ──────────────────────────────────────────────────
export async function signUp({ email, password, fullName, employeeCode }) {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName, employeeCode }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to create account');
  return result;
}

// ── Sign In ──────────────────────────────────────────────────
export async function signIn({ email, password }) {
  const response = await fetch(`${API_URL}/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to sign in');
  return result;
}

// ── Forgot Password ──────────────────────────────────────────
// Sends a reset email via Supabase. The link redirects to /reset-password.
export async function forgotPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message);
}

// ── Reset Password ───────────────────────────────────────────
// Called on /reset-password after Supabase sets the recovery session from the URL hash.
export async function resetPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ── Fetch Current User ───────────────────────────────────────
// Pass the access token directly to avoid race conditions where
// getSession() could return a stale/different session.
export async function fetchMe(accessToken) {
  // If no token passed, try to get current session as fallback
  let token = accessToken;
  if (!token) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) {
      throw new Error('Invalid or expired session');
    }
    token = session.access_token;
  }

  const response = await fetch(`${API_URL}/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Failed to fetch user');
  return result;
}

// ── Sign Out ─────────────────────────────────────────────────
export async function signOut() {
  // Always sign out from Supabase client side first
  await supabase.auth.signOut({ scope: 'local' });

  // Optionally notify the backend (best-effort, don't throw on failure)
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      await fetch(`${API_URL}/signout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
    }
  } catch {
    // Ignore backend signout errors — local session is already cleared
  }

  return { success: true };
}
