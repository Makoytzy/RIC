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

    // Use getRolesForUser which has fallback logic for missing roles
    const roleObjects = await getRolesForUser(data.user.id);

    req.user        = data.user;
    req.accessToken = token;
    req.roles       = roleObjects.map((r) => r.name).filter(Boolean);

    return next();
  } catch (err) {
    return next(err);
  }
}

// Export as both names for compatibility
export const authenticate = authMiddleware;
