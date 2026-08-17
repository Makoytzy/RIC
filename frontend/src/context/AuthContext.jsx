import { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase.js';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load the currently authenticated user's profile
   */
  const loadProfile = useCallback(async () => {
    try {
      const {
        user: profileUser,
        roles: profileRoles,
      } = await authService.fetchMe();

      setUser(profileUser);
      setRoles(profileRoles || []);
    } catch (error) {
      console.error('Failed to load profile:', error);

      setUser(null);
      setRoles([]);
    }
  }, []);

  /**
   * Initialize authentication
   */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Failed to get session:', error);
        }

        if (session) {
          await loadProfile();
        } else {
          setUser(null);
          setRoles([]);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);

        if (mounted) {
          setUser(null);
          setRoles([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    /**
     * Listen for Supabase authentication changes
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);

      if (!mounted) return;

      if (session) {
        await loadProfile();
      } else {
        setUser(null);
        setRoles([]);
      }

      if (mounted) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  /**
   * Sign in
   */
  const signIn = useCallback(async ({ email, password }) => {
    const result = await authService.signIn({
      email,
      password,
    });

    if (result.session) {
      const { error } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      if (error) {
        throw error;
      }
    }

    setUser(result.user);
    setRoles(result.roles || []);

    return result;
  }, []);

  /**
   * Sign up
   */
  const signUp = useCallback(
    async ({ email, password, fullName, position }) => {
      return authService.signUp({
        email,
        password,
        fullName,
        position,
      });
    },
    []
  );

  /**
   * Sign out
   *
   * Supabase is the source of truth for authentication.
   * Do not call authService.signOut() here if that function
   * makes a protected API request.
   */
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local',
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setUser(null);
      setRoles([]);
    }
  }, []);

  /**
   * Check whether user has one of the allowed roles
   */
  const hasRole = useCallback(
    (...allowed) => {
      return roles.some((role) => allowed.includes(role));
    },
    [roles]
  );

  const value = {
    user,
    roles,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}