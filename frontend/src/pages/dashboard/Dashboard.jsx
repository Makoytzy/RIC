import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import {
  Users, ShieldCheck, IdCard, Warehouse, Package, Barcode,
  Ruler, Truck, ScrollText, Settings, LayoutDashboard,
  Boxes, PackageCheck, MapPin, MoveRight, AlertTriangle,
  ClipboardList, CheckCircle, RotateCcw, BarChart2, Bell,
  FileStack, Ship, Calendar, ListChecks, ScanBarcode,
  BookOpen, ShoppingCart, UserSearch, ArrowDown,
  Receipt, Search, ChevronRight, Clock,
} from 'lucide-react';

// ── shared animation ──────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

// ── KPI card ──────────────────────────────────────────────────
const VARIANT_STYLES = {
  blue:   { bg: 'bg-blue-50',   icon: 'bg-blue-100 text-blue-600',   value: 'text-blue-700'   },
  green:  { bg: 'bg-green-50',  icon: 'bg-green-100 text-green-600', value: 'text-green-700'  },
  amber:  { bg: 'bg-amber-50',  icon: 'bg-amber-100 text-amber-600', value: 'text-amber-700'  },
  red:    { bg: 'bg-red-50',    icon: 'bg-red-100 text-red-600',     value: 'text-red-700'    },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', value: 'text-purple-700' },
  slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600', value: 'text-slate-700'  },
};

function KpiCard({ icon: Icon, label, value, sub, variant = 'blue' }) {
  const s = VARIANT_STYLES[variant] ?? VARIANT_STYLES.blue;
  return (
    <motion.div variants={fadeUp}
      className={`rounded-xl border border-slate-200 ${s.bg} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-lg p-2 ${s.icon}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className={`mt-3 text-2xl font-bold ${s.value}`}>{value}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  );
}

// ── quick-link tile ───────────────────────────────────────────
function QuickLink({ to, icon: Icon, label, desc, color = 'blue' }) {
  const colors = {
    blue:   'border-blue-200   bg-blue-50/70   text-blue-700   hover:bg-blue-100',
    green:  'border-green-200  bg-green-50/70  text-green-700  hover:bg-green-100',
    amber:  'border-amber-200  bg-amber-50/70  text-amber-700  hover:bg-amber-100',
    red:    'border-red-200    bg-red-50/70    text-red-700    hover:bg-red-100',
    purple: 'border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100',
    slate:  'border-slate-200  bg-slate-50/70  text-slate-700  hover:bg-slate-100',
    teal:   'border-teal-200   bg-teal-50/70   text-teal-700   hover:bg-teal-100',
  };
  return (
    <Link to={to}>
      <motion.div variants={fadeUp}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all cursor-pointer ${colors[color]}`}>
        <div className="shrink-0 rounded-lg bg-white/80 p-2 shadow-sm">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{label}</p>
          {desc && <p className="mt-0.5 text-xs opacity-70 truncate">{desc}</p>}
        </div>
        <ChevronRight size={14} className="shrink-0 opacity-40" />
      </motion.div>
    </Link>
  );
}

// ── section wrapper ───────────────────────────────────────────
function Section({ title, children, cols = 3 }) {
  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
      {title && <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{title}</h3>}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className={`grid gap-4 ${
          cols === 2 ? 'grid-cols-1 sm:grid-cols-2' :
          cols === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          cols === 4 ? 'grid-cols-2 lg:grid-cols-4' :
          'grid-cols-1'
        }`}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── alert banner ──────────────────────────────────────────────
function AlertBanner({ items }) {
  if (!items?.length) return null;
  return (
    <motion.div variants={fadeUp} className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Attention Required</p>
          <ul className="mt-1 space-y-0.5">
            {items.map((msg, i) => <li key={i} className="text-sm text-amber-800">⚠ {msg}</li>)}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

import AdminDashboardView from './admin/AdminDashboardView.jsx';
import ManagerDashboardView from './manager/ManagerDashboardView.jsx';
import OperationalDashboardView from './operational/OperationalDashboardView.jsx';
import WarehouseDashboardView from './warehouse/WarehouseDashboardView.jsx';
import SalesDashboardView from './sales/SalesDashboardView.jsx';

// ══════════════════════════════════════════════════════════════
// ROLE DASHBOARDS
// ══════════════════════════════════════════════════════════════

function AdminDashboard({ name }) {
  return <AdminDashboardView name={name} />;
}

function ManagerDashboard({ name }) {
  return <ManagerDashboardView name={name} />;
}

function OperationalDashboard({ name }) {
  return <OperationalDashboardView name={name} />;
}

function WarehouseDashboard({ name }) {
  return <WarehouseDashboardView name={name} />;
}

function SalesDashboard({ name }) {
  return <SalesDashboardView name={name} />;
}

// ── No-role fallback ──────────────────────────────────────────
function NoRoleDashboard() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <AlertTriangle size={36} className="mx-auto mb-3 text-amber-500" />
      <h3 className="mb-1 text-base font-semibold text-slate-800">No Role Assigned</h3>
      <p className="text-sm text-slate-500">
        Your account does not have a role yet. Please contact your administrator to get your role assigned.
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { user, roles } = useAuth();

  const firstName = (
    user?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'
  ).split(' ')[0];

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr  = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const role = roles[0];

  const content = {
    admin:             <AdminDashboard     name={firstName} />,
    manager:           <ManagerDashboard   name={firstName} />,
    operational_staff: <OperationalDashboard name={firstName} />,
    warehouse_staff:   <WarehouseDashboard name={firstName} />,
    sales_staff:       <SalesDashboard     name={firstName} />,
  }[role] ?? <NoRoleDashboard />;

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger}>
      {content}
    </motion.div>
  );
}
