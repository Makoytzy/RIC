// ============================================================
// AUTH SERVICE - CALLS BACKEND API
// ============================================================
//
// This service calls the backend API at http://localhost:4000
// instead of calling Supabase directly
//
// ============================================================

const API_URL = 'http://localhost:4000/api/auth';

// ============================================================
// SIGN UP
// ============================================================
export async function signUp({ email, password, fullName, employeeCode }) {
  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        employeeCode,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create account');
    }

    return result;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

// ============================================================
// SIGN IN
// ============================================================
export async function signIn({ email, password }) {
  try {
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to sign in');
    }

    return result;
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
}

// ============================================================
// FETCH CURRENT USER (ME)
// ============================================================
export async function fetchMe(accessToken) {
  try {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch user');
    }

    return result;
  } catch (error) {
    console.error('Fetch me error:', error);
    throw error;
  }
}

// ============================================================
// SIGN OUT
// ============================================================
export async function signOut(accessToken) {
  try {
    const response = await fetch(`${API_URL}/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to sign out');
    }

    return { success: true };
  } catch (error) {
    console.error('Signout error:', error);
    throw error;
  }
}
