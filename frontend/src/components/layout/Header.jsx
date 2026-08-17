import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

export default function Header() {
  const { user, roles, signOut } = useAuth();

  // Read full_name from the merged user object.
  // The /me endpoint now returns user.full_name (from public.users) AND
  // user.user_metadata.full_name — check both so it works regardless of
  // which path populated the user object.
  const displayName =
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    '';

  const displayRole = roles.join(', ').replace(/_/g, ' ') || 'No role assigned';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-ink">{displayName}</p>
        <p className="text-xs capitalize text-slate-500">{displayRole}</p>
      </div>
      <Button variant="ghost" onClick={signOut}>
        Sign out
      </Button>
    </header>
  );
}
