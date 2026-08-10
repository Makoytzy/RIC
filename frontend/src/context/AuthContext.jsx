import { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../config/supabase.js';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const { user: profileUser, roles: profileRoles } = await authService.fetchMe();
      setUser(profileUser);
      setRoles(profileRoles || []);
    } catch {
      setUser(null);
      setRoles([]);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        await loadProfile();
      }
      if (mounted) setLoading(false);
    }
    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await loadProfile();
      } else {
        setUser(null);
        setRoles([]);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async ({ email, password }) => {
    const result = await authService.signIn({ email, password });
    if (result.session) {
      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });
    }
    setUser(result.user);
    setRoles(result.roles || []);
    return result;
  }, []);

  const signUp = useCallback(async ({ email, password, fullName }) => {
    return authService.signUp({ email, password, fullName });
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authService.signOut();
    } finally {
      await supabase.auth.signOut();
      setUser(null);
      setRoles([]);
    }
  }, []);

  const hasRole = useCallback((...allowed) => roles.some((r) => allowed.includes(r)), [roles]);

  const value = { user, roles, loading, signIn, signUp, signOut, hasRole };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
