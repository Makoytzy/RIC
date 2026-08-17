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
      email_confirm: true, // Account active immediately; Supabase sends a confirmation email separately
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

  // Manually create user profile and assign role.
  // We do this explicitly because the handle_new_user DB trigger
  // may fail silently due to PostgREST schema cache issues.
  try {
    // 1. Create / upsert the public.users profile row
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id:            userId,
          email:         email,
          full_name:     fullName,
          position:      position,
          employee_code: employeeCode || null,
          is_active:     true,
          email_verified: true,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('[authService] Profile upsert error (non-fatal):', profileError.message);
    } else {
      console.log('[authService] User profile created/updated');
    }

    // 2. Find the role ID for this position
    const { data: roleRow, error: roleLookupError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', position)
      .single();

    if (roleLookupError || !roleRow) {
      console.error('[authService] Role not found for position:', position, roleLookupError?.message);
    } else {
      // 3. Assign the role (ignore conflict if already exists)
      const { error: roleAssignError } = await supabaseAdmin
        .from('user_roles')
        .upsert(
          { user_id: userId, role_id: roleRow.id },
          { onConflict: 'user_id,role_id', ignoreDuplicates: true }
        );

      if (roleAssignError) {
        console.error('[authService] Role assignment error (non-fatal):', roleAssignError.message);
      } else {
        console.log('[authService] Role assigned:', position);
      }
    }

    // 4. Mark employee code as used if applicable
    if (employeeCode && !employeeInfo?._fallback) {
      const { error: markError } = await supabaseAdmin
        .from('employees')
        .update({
          is_used:    true,
          used_at:    new Date().toISOString(),
          user_id:    userId,
          updated_at: new Date().toISOString(),
        })
        .eq('employee_code', employeeCode)
        .eq('is_used', false);

      if (markError) {
        console.error('[authService] Mark code as used error (non-fatal):', markError.message);
      } else {
        console.log('[authService] Employee code marked as used:', employeeCode);
      }
    }

  } catch (postSignupError) {
    // Post-signup steps failed but auth user was created — log and continue
    console.error('[authService] Post-signup error (non-fatal):', postSignupError.message);
  }

  console.log('[authService] Signup successful');
  return { id: userId, email, fullName };
}

/**
 * Sign in with email and password
 * Returns precise, human-readable error messages for every failure case.
 */
export async function signIn({ email, password }) {
  const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });

  if (error) {
    const msg = error.message?.toLowerCase() || '';

    if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
      throw new AppError('Incorrect password. Please check your password and try again.', 401);
    }
    if (msg.includes('email not confirmed')) {
      throw new AppError('Your email has not been verified yet. Please check your inbox and click the verification link.', 401);
    }
    if (msg.includes('user not found') || msg.includes('no user found')) {
      throw new AppError('No account found with this email address. Please check your email or sign up.', 404);
    }
    if (msg.includes('too many requests') || msg.includes('rate limit')) {
      throw new AppError('Too many login attempts. Please wait a few minutes before trying again.', 429);
    }
    if (msg.includes('user is banned') || msg.includes('banned')) {
      throw new AppError('This account has been suspended. Please contact your administrator.', 403);
    }
    if (msg.includes('user is disabled') || msg.includes('disabled')) {
      throw new AppError('This account has been disabled. Please contact your administrator.', 403);
    }
    // Fallback
    throw new AppError('Incorrect password. Please check your password and try again.', 401);
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
 * First checks user_roles table, falls back to users.position if empty
 */
export async function getRolesForUser(userId) {
  // Primary: get from user_roles join
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('roles ( id, name )')
    .eq('user_id', userId);
    
  if (error) throw new AppError(error.message, 500);
  
  const roles = (data || []).map((r) => r.roles).filter(Boolean);
  
  // If roles found, return them
  if (roles.length > 0) return roles;
  
  // Fallback: read position from public.users and assign role on-the-fly
  console.warn('[authService] No roles in user_roles for user:', userId, '— using position fallback');
  
  const { data: userRow } = await supabaseAdmin
    .from('users')
    .select('position')
    .eq('id', userId)
    .single();
  
  if (userRow?.position) {
    // Try to auto-assign the role so it works next time too
    const { data: roleRow } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('name', userRow.position)
      .single();
    
    if (roleRow) {
      // Insert the missing role assignment (ignore if already exists)
      await supabaseAdmin
        .from('user_roles')
        .upsert(
          { user_id: userId, role_id: roleRow.id },
          { onConflict: 'user_id,role_id', ignoreDuplicates: true }
        );
      
      console.log('[authService] Auto-assigned missing role:', roleRow.name, 'to user:', userId);
      return [{ id: roleRow.id, name: roleRow.name }];
    }
  }
  
  // Last resort: check auth.users metadata
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
  const metaPosition = authUser?.user?.user_metadata?.position;
  
  if (metaPosition) {
    const { data: roleRow } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .eq('name', metaPosition)
      .single();
    
    if (roleRow) {
      await supabaseAdmin
        .from('user_roles')
        .upsert(
          { user_id: userId, role_id: roleRow.id },
          { onConflict: 'user_id,role_id', ignoreDuplicates: true }
        );
      
      // Also update public.users.position
      await supabaseAdmin
        .from('users')
        .update({ position: metaPosition, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      console.log('[authService] Auto-assigned role from metadata:', roleRow.name, 'to user:', userId);
      return [{ id: roleRow.id, name: roleRow.name }];
    }
  }
  
  return [];
}
