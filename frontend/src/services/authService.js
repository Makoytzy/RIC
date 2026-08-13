import { supabase } from '../config/supabase.js';


// ============================================================
// SIGN UP
// ============================================================
//
// Employee signup flow:
//
// Employee Code
//      ↓
// verify_employee_code()
//      ↓
// employee_registration
//      ↓
// Get employee information
//      ↓
// Verify email
//      ↓
// Supabase Auth signup
//      ↓
// Store employee_code in Auth metadata
//      ↓
// Database trigger can create the user profile/role
//
// IMPORTANT:
// Position is NOT accepted from the frontend.
//
// The position comes from:
// employee_registration.employee_position
//
// ============================================================

export async function signUp({
  email,
  password,
  fullName,
  employeeCode,
}) {

  // ==========================================================
  // 1. VALIDATE EMAIL
  // ==========================================================

  const cleanEmail = email?.trim();

  if (!cleanEmail) {
    throw new Error(
      'Email address is required.'
    );
  }


  // ==========================================================
  // 2. VALIDATE PASSWORD
  // ==========================================================

  if (!password) {
    throw new Error(
      'Password is required.'
    );
  }


  // ==========================================================
  // 3. VALIDATE EMPLOYEE CODE
  // ==========================================================

  const cleanEmployeeCode =
    employeeCode?.trim();

  if (!cleanEmployeeCode) {
    throw new Error(
      'Employee biometric code is required.'
    );
  }


  // ==========================================================
  // 4. VERIFY EMPLOYEE CODE
  // ==========================================================
  //
  // This calls your PostgreSQL function:
  //
  // verify_employee_code()
  //
  // It checks the employee_registration table.
  //
  // ==========================================================

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase.rpc(
    'verify_employee_code',
    {
      p_employee_code:
        cleanEmployeeCode,
    }
  );


  // ==========================================================
  // 5. HANDLE VERIFICATION ERROR
  // ==========================================================

  if (employeeError) {

    console.error(
      'Employee verification error:',
      employeeError
    );

    throw new Error(
      employeeError.message ||
      'Unable to verify employee code.'
    );
  }


  // ==========================================================
  // 6. CHECK IF EMPLOYEE EXISTS
  // ==========================================================

  if (
    !employeeData ||
    employeeData.length === 0
  ) {

    throw new Error(
      'Invalid or already used employee biometric code.'
    );
  }


  // ==========================================================
  // 7. GET EMPLOYEE RECORD
  // ==========================================================

  const employee =
    employeeData[0];


  // ==========================================================
  // 8. VERIFY EMAIL
  // ==========================================================
  //
  // The employee must use the email registered by the
  // administrator/manager.
  //
  // ==========================================================

  const registeredEmail =
    employee.email?.trim().toLowerCase();

  const enteredEmail =
    cleanEmail.toLowerCase();


  if (
    registeredEmail !==
    enteredEmail
  ) {

    throw new Error(
      'The email address does not match the employee registration.'
    );
  }


  // ==========================================================
  // 9. VERIFY FULL NAME IF PROVIDED
  // ==========================================================
  //
  // The employee name comes from the registration record.
  //
  // We do NOT trust the name typed by the employee.
  //
  // ==========================================================

  const registeredFullName =
    employee.full_name?.trim();


  // ==========================================================
  // 10. CREATE SUPABASE AUTH ACCOUNT
  // ==========================================================
  //
  // The employee code is stored in Auth metadata.
  //
  // Supabase Auth:
  //
  // raw_user_meta_data
  //       ↓
  // employee_code
  //
  // Your database trigger can use this code to locate
  // the employee_registration record.
  //
  // ==========================================================

  const {
    data,
    error,
  } = await supabase.auth.signUp({

    email:
      registeredEmail,

    password,

    options: {

      data: {

        employee_code:
          employee.employee_code,

        full_name:
          registeredFullName,

      },

    },

  });


  // ==========================================================
  // 11. HANDLE SUPABASE AUTH ERROR
  // ==========================================================

  if (error) {

    console.error(
      'Supabase signup error:',
      error
    );

    throw new Error(
      error.message ||
      'Unable to create account.'
    );
  }


  // ==========================================================
  // 12. RETURN RESULT
  // ==========================================================

  return {

    user:
      data.user,

    session:
      data.session,

    roles: [],

    employee: {

      employee_code:
        employee.employee_code,

      full_name:
        employee.full_name,

      email:
        employee.email,

      position:
        employee.employee_position,

    },

  };
}


// ============================================================
// SIGN IN
// ============================================================

export async function signIn({
  email,
  password,
}) {

  // ==========================================================
  // 1. VALIDATE EMAIL
  // ==========================================================

  const cleanEmail =
    email?.trim();


  if (!cleanEmail) {
    throw new Error(
      'Email address is required.'
    );
  }


  // ==========================================================
  // 2. VALIDATE PASSWORD
  // ==========================================================

  if (!password) {
    throw new Error(
      'Password is required.'
    );
  }


  // ==========================================================
  // 3. SUPABASE LOGIN
  // ==========================================================

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword({

      email:
        cleanEmail,

      password,

    });


  // ==========================================================
  // 4. HANDLE LOGIN ERROR
  // ==========================================================

  if (error) {

    console.error(
      'Supabase signin error:',
      error
    );

    throw new Error(
      error.message ||
      'Invalid email or password.'
    );
  }


  // ==========================================================
  // 5. RETURN LOGIN RESULT
  // ==========================================================

  return {

    user:
      data.user,

    session:
      data.session,

    roles: [],

  };
}


// ============================================================
// FETCH CURRENT USER PROFILE
// ============================================================
//
// This gets the currently authenticated user and their
// application profile.
//
// ============================================================

export async function fetchMe() {

  // ==========================================================
  // 1. GET CURRENT AUTH USER
  // ==========================================================

  const {
    data: {
      user: authUser,
    },
    error: authError,
  } =
    await supabase.auth.getUser();


  if (authError) {
    throw authError;
  }


  if (!authUser) {

    throw new Error(
      'No authenticated user.'
    );
  }


  // ==========================================================
  // 2. GET PROFILE
  // ==========================================================

  const {
    data: profile,
    error: profileError,
  } =
    await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();


  if (profileError) {
    throw profileError;
  }


  // ==========================================================
  // 3. GET USER ROLES
  // ==========================================================

  const {
    data: roleRows,
    error: roleError,
  } =
    await supabase
      .from('user_roles')
      .select(`
        roles (
          name
        )
      `)
      .eq(
        'user_id',
        authUser.id
      );


  if (roleError) {
    throw roleError;
  }


  // ==========================================================
  // 4. CONVERT ROLE RECORDS TO ARRAY
  // ==========================================================

  const roles =
    (roleRows || [])
      .map(
        (row) =>
          row.roles?.name
      )
      .filter(Boolean);


  // ==========================================================
  // 5. RETURN USER INFORMATION
  // ==========================================================

  return {

    user:
      profile || authUser,

    roles,

  };
}


// ============================================================
// SIGN OUT
// ============================================================
//
// Your AuthContext currently handles signOut directly,
// but this function is available if another part of your
// application needs it.
//
// ============================================================

export async function signOut() {

  const {
    error,
  } =
    await supabase.auth.signOut({
      scope: 'local',
    });


  if (error) {
    throw error;
  }
}