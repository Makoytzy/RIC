import { supabaseAdmin } from '../config/supabase.js';
import { getRolesForUser } from '../services/authService.js';

/**
 * Verifies the Bearer token issued by Supabase Auth, then loads the user's
 * profile + role names from our own tables and attaches everything to req.
 */
export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Missing Authorization bearer token' });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Use getRolesForUser which has full fallback logic:
    // 1. user_roles table
    // 2. public.users.position → auto-assign
    // 3. auth.users metadata.position → auto-assign
    const roleObjects = await getRolesForUser(data.user.id);

    // Last-resort fallback: if still no roles, check employeeCode metadata
    // to find the position from the employees table
    let resolvedRoles = roleObjects.map((r) => r.name).filter(Boolean);

    if (resolvedRoles.length === 0) {
      const empCode = data.user.user_metadata?.employeeCode;
      if (empCode) {
        const { data: empRow } = await supabaseAdmin
          .from('employees')
          .select('employee_position')
          .eq('employee_code', empCode)
          .single();

        if (empRow?.employee_position) {
          const { data: roleRow } = await supabaseAdmin
            .from('roles')
            .select('id, name')
            .eq('name', empRow.employee_position)
            .single();

          if (roleRow) {
            // Auto-assign role and update user profile
            await supabaseAdmin
              .from('user_roles')
              .upsert(
                { user_id: data.user.id, role_id: roleRow.id },
                { onConflict: 'user_id,role_id', ignoreDuplicates: true }
              );
            await supabaseAdmin
              .from('users')
              .update({ position: empRow.employee_position, updated_at: new Date().toISOString() })
              .eq('id', data.user.id);

            resolvedRoles = [roleRow.name];
            console.log('[authMiddleware] Auto-assigned role from employee code:', roleRow.name);
          }
        }
      }
    }

    req.user        = data.user;
    req.accessToken = token;
    req.roles       = resolvedRoles;

    return next();
  } catch (err) {
    return next(err);
  }
}

// Export as both names for compatibility
export const authenticate = authMiddleware;
