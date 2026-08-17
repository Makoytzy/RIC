import {
  createContext,
  useEffect,
  useState,
  useCallback,
} from 'react';

import { supabase } from '../config/supabase.js';
import * as authService from '../services/authService.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);


  // ============================================================
  // LOAD CURRENT USER PROFILE
  // Always pass the access token directly to avoid race conditions
  // where getSession() could return a stale/different session.
  // ============================================================

  const loadProfile = useCallback(async (accessToken) => {
    try {
      const {
        user: profileUser,
        roles: profileRoles,
      } = await authService.fetchMe(accessToken);

      setUser(profileUser);
      setRoles(profileRoles || []);

    } catch (error) {
      console.error('Failed to load profile:', error);
      setUser(null);
      setRoles([]);
    }
  }, []);


  // ============================================================
  // INITIALIZE AUTHENTICATION
  // ============================================================

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

        if (!mounted) return;

        if (session?.access_token) {
          // Pass the token directly — no risk of stale session
          await loadProfile(session.access_token);
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
        if (mounted) setLoading(false);
      }
    };

    init();

    // ==========================================================
    // LISTEN FOR AUTH CHANGES
    // Only handle TOKEN_REFRESHED and SIGNED_OUT here.
    // SIGNED_IN is handled directly inside signIn() which already
    // has the correct token — letting onAuthStateChange also call
    // loadProfile() causes a race condition with stale sessions.
    // ==========================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (!mounted) return;

        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setRoles([]);
          if (mounted) setLoading(false);
          return;
        }

        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          // Silently refresh profile with the new token
          await loadProfile(session.access_token);
        }

        // SIGNED_IN is intentionally NOT handled here.
        // signIn() sets user/roles directly from the backend response,
        // which already contains the correct user data.

        if (mounted) setLoading(false);
      }
    );


    return () => {
      mounted = false;

      subscription.unsubscribe();
    };

  }, [loadProfile]);


  // ============================================================
  // SIGN IN
  // ============================================================

  const signIn = useCallback(
    async ({ email, password }) => {

      const result = await authService.signIn({ email, password });

      if (result.session) {
        // Store session in Supabase client (enables token refresh, persistence)
        const { error } = await supabase.auth.setSession({
          access_token:  result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        if (error) throw error;
      }

      // Use the token from the signin response directly — this guarantees
      // we fetch the profile for the user who just signed in, not whoever
      // was previously in the Supabase client session.
      if (result.session?.access_token) {
        await loadProfile(result.session.access_token);
      } else {
        // Fallback: use the data the backend returned directly
        setUser(result.user);
        setRoles(result.roles || []);
      }

      return result;
    },
    [loadProfile]
  );


  // ============================================================
  // VERIFY EMPLOYEE BIOMETRIC CODE
  // ============================================================
  //
  // IMPORTANT:
  //
  // There is NO hardcoded employee information here.
  //
  // The code entered by the employee is sent to:
  //
  //     verify_employee_code()
  //
  // in Supabase.
  //
  // Supabase checks:
  //
  //     employee_registration
  //
  // and returns:
  //
  //     employee_code
  //     full_name
  //     email
  //     employee_position
  //     is_used
  //
  // ============================================================

  const verifyEmployeeCode = useCallback(
    async (employeeCode) => {

      // ----------------------------------------------------------
      // VALIDATE CODE
      // ----------------------------------------------------------

      const code =
        employeeCode?.trim();


      if (!code) {
        throw new Error(
          'Employee biometric code is required.'
        );
      }


      // ----------------------------------------------------------
      // CALL BACKEND API
      // ----------------------------------------------------------

      try {
        const response = await fetch('http://localhost:4000/api/auth/verify-employee-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        const result = await response.json();

        // ----------------------------------------------------------
        // HANDLE HTTP ERROR
        // ----------------------------------------------------------

        if (!response.ok) {
          throw new Error(
            result.error || 'Unable to verify employee code.'
          );
        }

        // ----------------------------------------------------------
        // EMPLOYEE NOT FOUND
        // ----------------------------------------------------------

        if (!result.employee) {
          throw new Error(
            'Invalid or already used employee biometric code.'
          );
        }

        // ----------------------------------------------------------
        // GET EMPLOYEE DATA
        // ----------------------------------------------------------

        const employee = result.employee;


      // ----------------------------------------------------------
      // RETURN CLEAN OBJECT TO AUTHMODAL
      // ----------------------------------------------------------
      //
      // Database:
      //
      // employee_position
      //
      // Frontend:
      //
      // position
      //
      // ----------------------------------------------------------

      return {
        employee_code:
          employee.employee_code,

        full_name:
          employee.full_name,

        email:
          employee.email,

        position:
          employee.position || employee.employee_position,

        is_used:
          employee.is_used || false,
      };

      } catch (error) {
        console.error(
          'Employee code verification error:',
          error
        );
        throw new Error(
          error.message ||
          'Unable to verify employee code.'
        );
      }
    },
    []
  );


  // ============================================================
  // SIGN UP
  // ============================================================
  //
  // IMPORTANT:
  //
  // Position is intentionally NOT accepted here.
  //
  // The employee position comes from:
  //
  // biometric code
  //       ↓
  // employee_registration
  //       ↓
  // employee_position
  //
  // The biometric code is placed in Supabase Auth metadata.
  //
  // Your database trigger can then use:
  //
  // raw_user_meta_data ->> 'employee_code'
  //
  // to identify the employee.
  //
  // ============================================================

  const signUp = useCallback(
    async ({
      email,
      password,
      fullName,
      employeeCode,
    }) => {

      // ----------------------------------------------------------
      // VALIDATE EMAIL
      // ----------------------------------------------------------

      if (!email?.trim()) {
        throw new Error(
          'Email address is required.'
        );
      }


      // ----------------------------------------------------------
      // VALIDATE PASSWORD
      // ----------------------------------------------------------

      if (!password) {
        throw new Error(
          'Password is required.'
        );
      }


      // ----------------------------------------------------------
      // VALIDATE EMPLOYEE CODE
      // ----------------------------------------------------------

      if (!employeeCode?.trim()) {
        throw new Error(
          'Employee biometric code is required.'
        );
      }


      // ----------------------------------------------------------
      // CREATE AUTH ACCOUNT
      // ----------------------------------------------------------

      const result =
        await authService.signUp({
          email: email.trim(),

          password,

          fullName:
            fullName?.trim() || '',

          employeeCode:
            employeeCode.trim(),
        });


      return result;
    },
    []
  );


  // ============================================================
  // SIGN OUT
  // ============================================================

  const signOut = useCallback(
    async () => {

      try {

        const {
          error,
        } =
          await supabase.auth.signOut({
            scope: 'local',
          });


        if (error) {
          throw error;
        }

      } catch (error) {

        console.error(
          'Sign out error:',
          error
        );

        throw error;

      } finally {

        setUser(null);

        setRoles([]);
      }
    },
    []
  );


  // ============================================================
  // CHECK USER ROLE
  // ============================================================

  const hasRole = useCallback(
    (...allowed) => {

      return roles.some(
        (role) =>
          allowed.includes(role)
      );
    },
    [roles]
  );


  // ============================================================
  // AUTH CONTEXT VALUE
  // ============================================================
  //
  // IMPORTANT:
  //
  // verifyEmployeeCode MUST be included here.
  //
  // Otherwise AuthModal will receive:
  //
  //     verifyEmployeeCode === undefined
  //
  // and produce:
  //
  //     verifyEmployeeCode is not a function
  //
  // ============================================================

  const value = {
    user,

    roles,

    loading,

    signIn,

    signUp,

    signOut,

    verifyEmployeeCode,

    hasRole,
  };


  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}