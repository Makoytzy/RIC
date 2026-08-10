import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { NAV_SECTIONS } from '../../utils/permissions.js';

const roleCopy = {
  admin: 'Manage users, roles, and system-wide settings.',
  manager: 'Review reports and approve pending requests.',
  operational_staff: 'Register shipments, products, and validate orders.',
  warehouse_staff: 'Receive, inspect, pick, and pack inventory.',
  sales_staff: 'Handle walk-in sales, payments, and returns.',
};

export default function Dashboard() {
  const { user, roles, hasRole } = useAuth();

  // Every module this user's role(s) can reach, grouped the same way the
  // sidebar groups them, minus Dashboard itself.
  const sections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.path !== '/dashboard' && hasRole(...item.roles)),
  })).filter((section) => section.items.length > 0);

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink">
        Welcome, {user?.user_metadata?.full_name || user?.email}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {roles.map((r) => roleCopy[r]).filter(Boolean).join(' ') || 'No role assigned yet — contact an admin.'}
      </p>

      {sections.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No modules are available for your role yet. Contact an administrator if you believe this is a mistake.
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <div key={section.section ?? 'top'}>
              {section.section && (
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {section.section}
                </h2>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-600">
                        {item.label.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-ink group-hover:text-brand-700">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
