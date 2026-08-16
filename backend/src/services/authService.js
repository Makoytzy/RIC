import { supabaseAdmin, supabaseForUserToken } from '../config/supabase.js';
import { AppError } from '../middleware/errorMiddleware.js';

const DEFAULT_ROLE = 'operational_staff';

/**
 * Verify Employee Biometric Code
 * Queries employees table directly - with fallback for cache issues
 */
export async function verifyEmployeeCode(code) {
  try {
    console.log('[authService] Verifying employee code:', code);
    
    // First, check if the code exists at all (regardless of is_used status)
    const { data: checkData, error: checkError } = await supabaseAdmin
      .from('employees')
      .select('employee_code, is_used, used_at')
      .eq('employee_code', code)
      .single();
    
    // Handle schema cache error with fallback
    if (checkError) {
      console.error('[authService] Query error:', checkError);
      
      // TEMPORARY FALLBACK: If it's a cache error and code is EMP-10001
      if (checkError.message && checkError.message.includes('schema cache')) {
        console.warn('[authService] Schema cache error detected - checking fallback');
        
        if (code === 'EMP-10001') {
          // Check if this code was already used by querying auth.users
          // This is a workaround since we can't query employees table
          try {
            const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
            
            if (!authError && authUsers && authUsers.users) {
              // Check if any user has this employee code in their metadata
              const existingUser = authUsers.users.find(
                user => user.user_metadata?.employeeCode === code
              );
              
              if (existingUser) {
                console.log('[authService] Code already used (found in auth.users)');
                throw new AppError('This employee code has already been used to create an account. Please use the login form instead.', 400);
              }
            }
          } catch (authCheckError) {
            if (authCheckError instanceof AppError) {
              throw authCheckError;
            }
            console.error('[authService] Could not check auth users:', authCheckError);
          }
          
          console.log('[authService] Returning fallback admin data');
          return {
            employee_code: 'EMP-10001',
            full_name: 'Daisy Rey Daguplo',
            email: 'daisyreydaguplo18@gmail.com',
            employee_position: 'admin',
            position: 'admin',
            department: 'Management',
            _fallback: true
          };
        }
      }
      
      // If it's a "not found" error, code doesn't exist
      if (checkError.code === 'PGRST116') {
        console.log('[authService] Employee code not found:', code);
        return null;
      }
      
      throw new AppError(checkError.message, 400);
    }
    
    // If code exists but is already used
    if (checkData && checkData.is_used) {
      console.log('[authService] Employee code already used:', code);
      throw new AppError('This employee code has already been used to create an account. Please use the login form instead.', 400);
    }
    
    // Code exists and is not used - fetch full employee data
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('employee_code, full_name, email, employee_position, department, is_used')
      .eq('employee_code', code)
      .eq('is_used', false)
      .single();
    
    if (error) {
      console.error('[authService] Error fetching employee data:', error);
      throw new AppError(error.message, 400);
    }
    
    console.log('[authService] Found employee:', data);

    if (!data) {
      console.log('[authService] No employee found for code:', code);
      return null;
    }
    
    // Map employee_position to position for frontend compatibility
    const result = {
      employee_code: data.employee_code,
      full_name: data.full_name,
      email: data.email,
      employee_position: data.employee_position,
      position: data.employee_position,
      department: data.department,
    };
    
    console.log('[authService] Returning employee:', result);
    return result;
    
  } catch (error) {
    console.error('[authService] Error verifying employee code:', error);
    
    // If it's already an AppError with our custom message, throw it as-is
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(error.message || 'Failed to verify employee code', 500);
  }
}

/**
 * Sign up with employee code verification
 */
export async function signUp({ email, password, fullName, employeeCode }) {
  console.log('[authService] SignUp called with:', { email, fullName, employeeCode });
  
  // Verify employee code first
  let employeeInfo = null;
  let position = DEFAULT_ROLE;
  
  if (employeeCode) {
    employeeInfo = await verifyEmployeeCode(employeeCode);
    
    if (!employeeInfo) {
      throw new AppError('Invalid employee code or code already used', 400);
    }
    
    // Use employee info
    position = employeeInfo.employee_position;
    email = employeeInfo.email; // Use verified email from employee record
    fullName = employeeInfo.full_name; // Use verified name from employee record
    
    console.log('[authService] Using employee info:', { position, email, fullName });
  }
  
  // Create auth user
  console.log('[authService] Creating auth user with email:', email);
  
  let authData, authError;
  try {
    const result = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: { 
        full_name: fullName, 
        fullName: fullName,
        position,
        employeeCode: employeeCode || null
      },
    });
    
    authData = result.data;
    authError = result.error;
  } catch (error) {
    console.error('[authService] Exception during auth.admin.createUser:', error);
    throw new AppError('Failed to create authentication account: ' + error.message, 500);
  }

  if (authError) {
    console.error('[authService] Auth creation error:', authError);
    const message = /already registered|already exists/i.test(authError.message)
      ? 'An account with this email already exists'
      : authError.message;
    throw new AppError(message, 400);
  }
  
  if (!authData || !authData.user) {
    throw new AppError('Failed to create user account', 500);
  }

  const userId = authData.user.id;
  console.log('[authService] Created auth user:', userId);

  // NOTE: The database trigger (handle_new_user) will automatically create
  // the user profile and assign roles when it fires.
  // We don't need to do anything else here due to schema cache issues.
  
  // For the fallback admin account, mark the code as used
  if (employeeCode === 'EMP-10001' && employeeInfo._fallback) {
    console.log('[authService] Fallback admin account created - code marking skipped');
  }

  console.log('[authService] Signup successful');
  return { id: userId, email, fullName };
}

/**
 * Sign in with email and password
 */
export async function signIn({ email, password }) {
  const client = supabaseForUserToken('');
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  
  if (error) {
    // Check for email not confirmed error
    if (error.message && error.message.toLowerCase().includes('email not confirmed')) {
      throw new AppError('Please verify your email before logging in. Check your inbox for the verification link.', 401);
    }
    throw new AppError('Invalid email or password', 401);
  }

  return {
    session: data.session,
    user: data.user,
  };
}

/**
 * Sign out
 */
export async function signOut(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) throw new AppError(error.message, 400);
}

/**
 * Get roles for user
 */
export async function getRolesForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('roles ( id, name )')
    .eq('user_id', userId);
    
  if (error) throw new AppError(error.message, 500);
  
  return (data || []).map((r) => r.roles).filter(Boolean);
}
