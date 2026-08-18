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

    // Try getting roles from user_roles table first
    let resolvedRoles = [];
    try {
      const { data: roleRows } = await supabaseAdmin
        .from('user_roles')
        .select('roles ( id, name )')
        .eq('user_id', data.user.id);
      resolvedRoles = (roleRows || []).map(r => r.roles?.name).filter(Boolean);
    } catch (_) {}

    // Fallback 1: read from public.users.position
    if (resolvedRoles.length === 0) {
      try {
        const { data: userRow } = await supabaseAdmin
          .from('users')
          .select('position')
          .eq('id', data.user.id)
          .single();
        if (userRow?.position) {
          const { data: roleRow } = await supabaseAdmin
            .from('roles').select('id, name').eq('name', userRow.position).single();
          if (roleRow) {
            await supabaseAdmin.from('user_roles')
              .upsert({ user_id: data.user.id, role_id: roleRow.id }, { onConflict: 'user_id,role_id', ignoreDuplicates: true });
            resolvedRoles = [roleRow.name];
          }
        }
      } catch (_) {}
    }

    // Fallback 2: read position directly from auth metadata (always works)
    if (resolvedRoles.length === 0) {
      const metaPosition = data.user.user_metadata?.position;
      if (metaPosition) {
        try {
          const { data: roleRow } = await supabaseAdmin
            .from('roles').select('id, name').eq('name', metaPosition).single();
          if (roleRow) {
            // Try to create the user profile and assign role
            try {
              await supabaseAdmin.from('users').upsert(
                { id: data.user.id, email: data.user.email,
                  full_name: data.user.user_metadata?.fullName || data.user.user_metadata?.full_name || data.user.email,
                  position: metaPosition },
                { onConflict: 'id' }
              );
              await supabaseAdmin.from('user_roles')
                .upsert({ user_id: data.user.id, role_id: roleRow.id }, { onConflict: 'user_id,role_id', ignoreDuplicates: true });
            } catch (_) {}
            resolvedRoles = [roleRow.name];
          }
        } catch (_) {}
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
