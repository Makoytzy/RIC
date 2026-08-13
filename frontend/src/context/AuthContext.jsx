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
  // ============================================================

  const loadProfile = useCallback(async () => {
    try {
      const {
        user: profileUser,
        roles: profileRoles,
      } = await authService.fetchMe();

      setUser(profileUser);
      setRoles(profileRoles || []);

    } catch (error) {
      console.error(
        'Failed to load profile:',
        error
      );

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
          console.error(
            'Failed to get session:',
            error
          );
        }


        if (!mounted) {
          return;
        }


        if (session) {
          await loadProfile();
        } else {
          setUser(null);
          setRoles([]);
        }

      } catch (error) {
        console.error(
          'Auth initialization error:',
          error
        );

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


    // ==========================================================
    // LISTEN FOR AUTH CHANGES
    // ==========================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        console.log(
          'Auth event:',
          event
        );


        if (!mounted) {
          return;
        }


        if (session) {
          await loadProfile();
        } else {
          setUser(null);
          setRoles([]);
        }


        if (mounted) {
          setLoading(false);
        }
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

      const result = await authService.signIn({
        email,
        password,
      });


      if (result.session) {

        const { error } =
          await supabase.auth.setSession({
            access_token:
              result.session.access_token,

            refresh_token:
              result.session.refresh_token,
          });


        if (error) {
          throw error;
        }
      }


      setUser(result.user);

      setRoles(
        result.roles || []
      );


      return result;
    },
    []
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
      // CALL SUPABASE RPC
      // ----------------------------------------------------------

      const {
        data,
        error,
      } = await supabase.rpc(
        'verify_employee_code',
        {
          p_employee_code: code,
        }
      );


      // ----------------------------------------------------------
      // HANDLE SUPABASE ERROR
      // ----------------------------------------------------------

      if (error) {

        console.error(
          'Employee code verification error:',
          error
        );

        throw new Error(
          error.message ||
          'Unable to verify employee code.'
        );
      }


      // ----------------------------------------------------------
      // EMPLOYEE NOT FOUND
      // ----------------------------------------------------------

      if (
        !data ||
        data.length === 0
      ) {
        throw new Error(
          'Invalid or already used employee biometric code.'
        );
      }


      // ----------------------------------------------------------
      // GET EMPLOYEE RECORD
      // ----------------------------------------------------------

      const employee =
        data[0];


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
          employee.employee_position,

        is_used:
          employee.is_used,
      };
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