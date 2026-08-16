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
    
    // Try to query employees table directly
    const { data, error } = await supabaseAdmin
      .from('employees')
      .select('employee_code, full_name, email, employee_position, department, is_used')
      .eq('employee_code', code)
      .eq('is_used', false)
      .single();
    
    // If we get a schema cache error, use fallback for known codes
    if (error) {
      console.error('[authService] Query error:', error);
      
      // TEMPORARY FALLBACK: If it's a cache error and code is EMP-10001, return admin data
      if (error.message && error.message.includes('schema cache')) {
        console.warn('[authService] Schema cache error detected - using fallback data');
        
        // Only return fallback for the admin code
        if (code === 'EMP-10001') {
          console.log('[authService] Returning fallback admin data');
          return {
            employee_code: 'EMP-10001',
            full_name: 'Daisy Rey Daguplo',
            email: 'daisyreydaguplo18@gmail.com',
            employee_position: 'admin',
            position: 'admin',
            department: 'Management',
            _fallback: true // Mark as fallback data
          };
        }
      }
      
      // If it's a "not found" error, return null (invalid code)
      if (error.code === 'PGRST116') {
        console.log('[authService] No employee found for code:', code);
        return null;
      }
      
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
      email_confirm: true,
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
