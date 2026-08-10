import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../middleware/errorMiddleware.js';

export async function listUsers() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, full_name, is_active, created_at, user_roles ( roles ( name ) )')
    .order('created_at', { ascending: false });
  if (error) throw new AppError(error.message, 500);

  return data.map((u) => ({
    id: u.id,
    email: u.email,
    fullName: u.full_name,
    isActive: u.is_active,
    createdAt: u.created_at,
    roles: (u.user_roles || []).map((ur) => ur.roles?.name).filter(Boolean),
  }));
}

export async function createUser({ email, password, fullName, roleNames = [] }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    const message = /already registered|already exists/i.test(error.message)
      ? 'An account with this email already exists'
      : error.message;
    throw new AppError(message, 400);
  }

  const userId = data.user.id;

  try {
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, email, full_name: fullName });
    if (profileError) throw new AppError(profileError.message, 400);

    const wantedRoles = roleNames.length ? roleNames : ['operational_staff'];
    const { data: roleRows, error: roleLookupError } = await supabaseAdmin
      .from('roles')
      .select('id, name')
      .in('name', wantedRoles);
    if (roleLookupError) throw new AppError(roleLookupError.message, 500);
    if (!roleRows?.length) throw new AppError('None of the requested roles exist', 400);

    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .insert(roleRows.map((r) => ({ user_id: userId, role_id: r.id })));
    if (assignError) throw new AppError(assignError.message, 400);

    return { id: userId, email, fullName, roles: roleRows.map((r) => r.name) };
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    throw err;
  }
}

export async function setUserActive(userId, isActive) {
  const { error } = await supabaseAdmin.from('users').update({ is_active: isActive }).eq('id', userId);
  if (error) throw new AppError(error.message, 400);
}

export async function assignRole(userId, roleName) {
  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();
  if (roleError || !role) throw new AppError('Unknown role', 400);

  const { error } = await supabaseAdmin
    .from('user_roles')
    .upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id,role_id' });
  if (error) throw new AppError(error.message, 400);
}

export async function removeRole(userId, roleName) {
  const { data: role, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('name', roleName)
    .single();
  if (roleError || !role) throw new AppError('Unknown role', 400);

  const { error } = await supabaseAdmin
    .from('user_roles')
    .delete()
    .match({ user_id: userId, role_id: role.id });
  if (error) throw new AppError(error.message, 400);
}
