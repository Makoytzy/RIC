import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { NAV_SECTIONS } from '../../utils/permissions.js';

function NavItem({ item }) {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `block rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { hasRole } = useAuth();

  // Filter each section down to the items this user's role(s) can see,
  // then drop any section that ends up empty.
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => hasRole(...item.roles)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <div className="h-7 w-7 rounded-md bg-brand-500" />
        <span className="font-mono text-sm font-semibold tracking-tight text-ink">INVENTORY</span>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {visibleSections.map((section) => (
          <div key={section.section ?? 'top'}>
            {section.section && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {section.section}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
