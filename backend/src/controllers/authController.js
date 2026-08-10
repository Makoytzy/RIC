import * as authService from '../services/authService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signUp(req, res, next) {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'email, password and fullName are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }
    const user = await authService.signUp({ email: email.trim().toLowerCase(), password, fullName: fullName.trim() });
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    const result = await authService.signIn({ email: email.trim().toLowerCase(), password });
    const roles = await authService.getRolesForUser(result.user.id);
    return res.json({ session: result.session, user: result.user, roles: roles.map((r) => r.name) });
  } catch (err) {
    return next(err);
  }
}

export async function signOut(req, res, next) {
  try {
    await authService.signOut(req.accessToken);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function me(req, res) {
  return res.json({ user: req.user, roles: req.roles });
}
