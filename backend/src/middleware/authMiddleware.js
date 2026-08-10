import { supabaseAdmin } from '../config/supabase.js';

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

    const { data: roleRows, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('roles ( id, name )')
      .eq('user_id', data.user.id);

    if (roleError) {
      return res.status(500).json({ error: 'Failed to resolve user roles' });
    }

    req.user = data.user;
    req.accessToken = token;
    req.roles = (roleRows || []).map((r) => r.roles?.name).filter(Boolean);

    return next();
  } catch (err) {
    return next(err);
  }
}
