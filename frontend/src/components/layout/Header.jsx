import { useAuth } from '../../hooks/useAuth.js';
import Button from '../common/Button.jsx';

export default function Header() {
  const { user, roles, signOut } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-sm font-medium text-ink">{user?.user_metadata?.full_name || user?.email}</p>
        <p className="text-xs capitalize text-slate-500">{roles.join(', ').replace(/_/g, ' ') || 'No role assigned'}</p>
      </div>
      <Button variant="ghost" onClick={signOut}>
        Sign out
      </Button>
    </header>
  );
}
