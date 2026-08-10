import * as userService from '../services/userService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listUsers(req, res, next) {
  try {
    const users = await userService.listUsers();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { email, password, fullName, roles } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'email, password and fullName are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const user = await userService.createUser({
      email: email.trim().toLowerCase(),
      password,
      fullName: fullName.trim(),
      roleNames: Array.isArray(roles) ? roles : [],
    });
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

export async function setActive(req, res, next) {
  try {
    const { isActive } = req.body;
    await userService.setUserActive(req.params.id, Boolean(isActive));
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
