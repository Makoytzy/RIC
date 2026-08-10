import { supabaseAdmin, supabaseForUserToken } from '../config/supabase.js';
import { AppError } from '../middleware/errorMiddleware.js';

const DEFAULT_ROLE = 'operational_staff';

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    // Supabase returns a generic message for a lot of cases; surface the
    // common one clearly so the frontend can show something useful.
    const message = /already registered|already exists/i.test(error.message)
      ? 'An account with this email already exists'
      : error.message;
    throw new AppError(message, 400);
  }

  const userId = data.user.id;

  // If anything below fails, delete the auth user we just created so the
  // email isn't left in a permanent "orphaned, can never sign up" state.
  try {
    // Create profile row
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({ id: userId, email, full_name: fullName });
    if (profileError) throw new AppError(profileError.message, 400);

    // Assign default role
    const { data: roleRow, error: roleLookupError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', DEFAULT_ROLE)
      .single();
    if (roleLookupError || !roleRow) {
      throw new AppError('Default role is not configured. Run the database migration first.', 500);
    }

    const { error: assignError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userId, role_id: roleRow.id });
    if (assignError) throw new AppError(assignError.message, 400);
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    throw err;
  }

  return { id: userId, email, fullName };
}

export async function signIn({ email, password }) {
  const client = supabaseForUserToken(''); // anon client, no token needed for password login
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw new AppError('Invalid email or password', 401);

  return {
    session: data.session,
    user: data.user,
  };
}

export async function signOut(accessToken) {
  const { error } = await supabaseAdmin.auth.admin.signOut(accessToken);
  if (error) throw new AppError(error.message, 400);
}

export async function getRolesForUser(userId) {
  const { data, error } = await supabaseAdmin
    .from('user_roles')
    .select('roles ( id, name )')
    .eq('user_id', userId);
  if (error) throw new AppError(error.message, 500);
  return (data || []).map((r) => r.roles).filter(Boolean);
}
