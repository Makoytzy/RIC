import { supabaseAdmin } from '../config/supabase.js';
import * as userService from '../services/userService.js';

export async function listRoles(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from('roles').select('id, name, description').order('name');
    if (error) throw error;
    return res.json({ roles: data });
  } catch (err) {
    return next(err);
  }
}

export async function assignRole(req, res, next) {
  try {
    const { userId, roleName } = req.body;
    await userService.assignRole(userId, roleName);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function removeRole(req, res, next) {
  try {
    const { userId, roleName } = req.body;
    await userService.removeRole(userId, roleName);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
