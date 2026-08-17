import * as authService from '../services/authService.js';
import { supabaseAdmin } from '../config/supabase.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Verify Employee Code Endpoint
 */
export async function verifyEmployeeCode(req, res, next) {
  try {
    console.log('[authController] verifyEmployeeCode called');
    console.log('[authController] Request body:', req.body);
    
    const { code } = req.body;
    
    if (!code || typeof code !== 'string') {
      console.log('[authController] Invalid code format');
      return res.status(400).json({ error: 'Employee code is required' });
    }
    
    console.log('[authController] Calling authService.verifyEmployeeCode');
    const employee = await authService.verifyEmployeeCode(code.trim().toUpperCase());
    
    if (!employee) {
      return res.status(404).json({ 
        error: 'Employee code not found. Please check the code and try again, or contact your administrator.'
      });
    }
    
    return res.json({ employee });
    
  } catch (err) {
    console.error('[authController] Error in verifyEmployeeCode:', err);
    return next(err);
  }
}

/**
 * Sign Up Endpoint
 */
export async function signUp(req, res, next) {
  try {
    console.log('[authController] signUp called');
    console.log('[authController] Request body:', req.body);
    
    const { email, password, fullName, employeeCode } = req.body;
    
    // Validate required fields
    if (!password || !fullName) {
      return res.status(400).json({ 
        error: 'password and fullName are required' 
      });
    }
    
    // If employee code is provided, validate it
    if (employeeCode) {
      if (typeof employeeCode !== 'string' || !employeeCode.trim()) {
        return res.status(400).json({ error: 'Invalid employee code' });
      }
    }
    
    // Validate password
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters' 
      });
    }
    
    // Validate full name
    if (typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    
    console.log('[authController] Calling authService.signUp');
    
    const user = await authService.signUp({
      email: email ? email.trim().toLowerCase() : null,
      password,
      fullName: fullName.trim(),
      employeeCode: employeeCode ? employeeCode.trim().toUpperCase() : null,
    });
    
    console.log('[authController] Signup successful');
    return res.status(201).json({ user });
    
  } catch (err) {
    console.error('[authController] Error in signUp:', err);
    return next(err);
  }
}

/**
 * Sign In Endpoint
 */
export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    
    const result = await authService.signIn({ 
      email: email.trim().toLowerCase(), 
      password 
    });
    
    const roles = await authService.getRolesForUser(result.user.id);
    
    return res.json({ 
      session: result.session, 
      user: result.user, 
      roles: roles.map((r) => r.name) 
    });
    
  } catch (err) {
    return next(err);
  }
}

/**
 * Sign Out Endpoint
 */
export async function signOut(req, res, next) {
  try {
    await authService.signOut(req.accessToken);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

/**
 * Get Current User Endpoint
 * Returns merged auth user + public.users profile for accurate display
 */
export async function me(req, res) {
  try {
    // req.user is the Supabase auth user (from JWT verification in authMiddleware)
    const authUser = req.user;

    // Also fetch the public.users profile row for accurate display data
    const { data: profileRow, error: profileError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, position, is_active, employee_code, created_at, updated_at')
      .eq('id', authUser.id)
      .single();

    if (profileError) {
      // If profile row doesn't exist yet (trigger may not have run), fall back to auth user only
      console.warn('[me] public.users row not found for user:', authUser.id, profileError.message);
      return res.json({ user: authUser, roles: req.roles });
    }

    // Merge: auth user fields + public.users fields
    // public.users.full_name and position take precedence over user_metadata
    const mergedUser = {
      ...authUser,
      // Override with accurate public.users data
      full_name: profileRow.full_name || authUser.user_metadata?.full_name || authUser.email,
      position:  profileRow.position  || authUser.user_metadata?.position  || '',
      is_active: profileRow.is_active,
      employee_code: profileRow.employee_code,
      // Keep these accessible on user_metadata too for Header.jsx compatibility
      user_metadata: {
        ...authUser.user_metadata,
        full_name: profileRow.full_name || authUser.user_metadata?.full_name || authUser.email,
        position:  profileRow.position  || authUser.user_metadata?.position  || '',
      }
    };

    return res.json({ user: mergedUser, roles: req.roles });
  } catch (err) {
    console.error('[me] Error fetching profile:', err);
    // Fallback to auth user on error
    return res.json({ user: req.user, roles: req.roles });
  }
}
