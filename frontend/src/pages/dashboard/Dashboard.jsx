import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import KpiCard from '../../components/dashboard/KpiCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import {
  Boxes, AlertTriangle, PackageCheck, ShoppingCart,
  RotateCcw, AlertCircle, Users, FileText, TrendingUp,
  Package, ClipboardList, BarChart2, CheckCircle,
  Truck, ScanLine, Layers, Receipt, UserCheck,
  ShieldCheck, Settings, Activity, Clock, ArrowRight,
} from 'lucide-react';

const fadeInUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

// ── Quick Link card ──────────────────────────────────────────
function QuickLink({ to, icon: Icon, label, description, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50   border-blue-200   text-blue-700   hover:bg-blue-100',
    green:  'bg-green-50  border-green-200  text-green-700  hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    red:    'bg-red-50    border-red-200    text-red-700    hover:bg-red-100',
    teal:   'bg-teal-50   border-teal-200   text-teal-700   hover:bg-teal-100',
  };
  return (
    <Link to={to}>
      <div className={`flex items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer ${colors[color]}`}>
        <div className="shrink-0 rounded-lg bg-white/70 p-2 shadow-sm">
          <Icon size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{label}</p>
          {description && <p className="text-xs opacity-70 truncate">{description}</p>}
        </div>
        <ArrowRight size={14} className="shrink-0 opacity-50" />
      </div>
    </Link>
  );
}

// ── Activity row ─────────────────────────────────────────────
function ActivityRow({ time, user, action, reference, status }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
        {user?.charAt(0) ?? '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-700">
          <span className="font-medium">{user}</span> {action}
        </p>
        <p className="text-xs text-slate-400">{reference}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <StatusBadge status={status} />
        <span className="text-[10px] text-slate-400">{time}</span>
      </div>
    </div>
  );
}

// ── Alert banner ─────────────────────────────────────────────
function AlertBanner({ alerts }) {
  if (!alerts?.length) return null;
  return (
    <motion.div variants={fadeInUp} className="mb-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <h3 className="text-sm font-semibold text-amber-900 mb-1.5">Attention Required</h3>
            <ul className="space-y-1">
              {alerts.map((a, i) => (
                <li key={i} className="text-sm text-amber-800">⚠ {a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROLE-SPECIFIC DASHBOARD CONTENT
// ══════════════════════════════════════════════════════════════

// ── ADMIN DASHBOARD ──────────────────────────────────────────
function AdminDashboard({ firstName }) {
  const kpis = [
    { title: 'Total Users',     value: '—', subtitle: 'Registered accounts',       icon: Users,         trend: null, variant: 'blue' },
    { title: 'Total Inventory', value: '—', subtitle: 'Units in stock',             icon: Boxes,         trend: null, variant: 'purple' },
    { title: 'Low Stock',       value: '—', subtitle: 'Products need restocking',   icon: AlertTriangle, trend: null, variant: 'orange' },
    { title: 'Pending Orders',  value: '—', subtitle: 'Orders awaiting fulfillment',icon: ShoppingCart,  trend: null, variant: 'blue' },
    { title: 'Defective Items', value: '—', subtitle: 'Awaiting resolution',        icon: AlertCircle,   trend: null, variant: 'red' },
    { title: 'Audit Events',    value: '—', subtitle: 'Today\'s system events',     icon: Activity,      trend: null, variant: 'purple' },
  ];
  const quickLinks = [
    { to: '/users',      icon: Users,       label: 'User Management',   description: 'Manage employee accounts',     color: 'blue' },
    { to: '/roles',      icon: ShieldCheck, label: 'Role Management',   description: 'Assign and manage roles',      color: 'purple' },
    { to: '/products',   icon: Package,     label: 'Product Management',description: 'Manage product catalogue',     color: 'green' },
    { to: '/inventory',  icon: Boxes,       label: 'Inventory',         description: 'View full inventory',          color: 'teal' },
    { to: '/audit-logs', icon: FileText,    label: 'Audit Logs',        description: 'View system activity logs',   color: 'orange' },
    { to: '/settings',   icon: Settings,    label: 'System Settings',   description: 'Configure system preferences', color: 'red' },
  ];
  return (
    <>
      <AlertBanner alerts={[
        '128 products are low in stock',
        '17 defective items require action',
        '12 shipments have quantity discrepancies',
      ]} />
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={i} variants={fadeInUp}><KpiCard {...k} /></motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickLinks.map((l) => <QuickLink key={l.to} {...l} />)}
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Recent Activity</h3>
          <div>
            {[
              { time: '—', user: 'System', action: 'started',           reference: 'Inventory management system',  status: 'completed' },
              { time: '—', user: 'Admin',  action: 'configured roles',  reference: 'Role assignment system',       status: 'approved' },
            ].map((a, i) => <ActivityRow key={i} {...a} />)}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── MANAGER DASHBOARD ─────────────────────────────────────────
function ManagerDashboard({ firstName }) {
  const kpis = [
    { title: 'Pending Approvals',    value: '—', subtitle: 'Requests awaiting your review', icon: CheckCircle,   trend: null, variant: 'orange' },
    { title: 'Sales This Month',     value: '—', subtitle: 'Total revenue',                 icon: TrendingUp,    trend: null, variant: 'green' },
    { title: 'Stock Movement',       value: '—', subtitle: 'Items moved today',             icon: Boxes,         trend: null, variant: 'blue' },
    { title: 'Discrepancy Reports',  value: '—', subtitle: 'Open discrepancies',            icon: AlertCircle,   trend: null, variant: 'red' },
    { title: 'Employee Efficiency',  value: '—', subtitle: 'Average task completion',       icon: BarChart2,     trend: null, variant: 'purple' },
    { title: 'Return Rate',          value: '—', subtitle: 'Returns this month',            icon: RotateCcw,     trend: null, variant: 'orange' },
  ];
  const quickLinks = [
    { to: '/approvals',                   icon: CheckCircle,   label: 'Approval Requests',      description: 'Review pending approvals',     color: 'orange' },
    { to: '/reports/sales',               icon: TrendingUp,    label: 'Sales Reports',           description: 'View sales performance',       color: 'green' },
    { to: '/reports/inventory',           icon: Boxes,         label: 'Inventory Reports',       description: 'Monitor stock levels',         color: 'blue' },
    { to: '/reports/stock-movement',      icon: BarChart2,     label: 'Stock Movement',          description: 'Track inventory movements',    color: 'purple' },
    { to: '/reports/discrepancies',       icon: AlertCircle,   label: 'Discrepancy Reports',     description: 'Review reported issues',       color: 'red' },
    { to: '/reports/employee-efficiency', icon: UserCheck,     label: 'Employee Efficiency',     description: 'Monitor team performance',     color: 'teal' },
  ];
  return (
    <>
      <AlertBanner alerts={['5 approval requests are pending your review']} />
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={i} variants={fadeInUp}><KpiCard {...k} /></motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickLinks.map((l) => <QuickLink key={l.to} {...l} />)}
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Pending Approvals</h3>
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <CheckCircle size={32} className="mb-2 opacity-30" />
            <p className="text-sm">No pending approvals</p>
            <Link to="/approvals" className="mt-3 text-xs text-blue-600 hover:underline">View all approvals</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── OPERATIONAL STAFF DASHBOARD ───────────────────────────────
function OperationalDashboard({ firstName }) {
  const kpis = [
    { title: 'Pending Orders',       value: '—', subtitle: 'Orders to process',       icon: ShoppingCart,  trend: null, variant: 'blue' },
    { title: 'Incoming Shipments',   value: '—', subtitle: 'Shipments to register',   icon: Truck,         trend: null, variant: 'purple' },
    { title: 'Products Registered',  value: '—', subtitle: 'This week',               icon: Package,       trend: null, variant: 'green' },
    { title: 'Batches Active',       value: '—', subtitle: 'In-progress batches',     icon: Layers,        trend: null, variant: 'orange' },
    { title: 'Returns Pending',      value: '—', subtitle: 'Items to process',        icon: RotateCcw,     trend: null, variant: 'orange' },
    { title: 'Waybills Today',       value: '—', subtitle: 'Generated today',         icon: FileText,      trend: null, variant: 'teal' },
  ];
  const quickLinks = [
    { to: '/orders',            icon: ShoppingCart, label: 'Order Management',      description: 'Process pending orders',       color: 'blue' },
    { to: '/shipments/incoming',icon: Truck,        label: 'Incoming Shipments',    description: 'Register new shipments',       color: 'purple' },
    { to: '/products/register', icon: Package,      label: 'Product Registration',  description: 'Register new products',        color: 'green' },
    { to: '/inventory/register',icon: Boxes,        label: 'Inventory Registration',description: 'Add inventory records',        color: 'teal' },
    { to: '/batches',           icon: Layers,       label: 'Batch Management',      description: 'Manage product batches',       color: 'orange' },
    { to: '/returns/process',   icon: RotateCcw,    label: 'Return Processing',     description: 'Process customer returns',     color: 'red' },
  ];
  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={i} variants={fadeInUp}><KpiCard {...k} /></motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickLinks.map((l) => <QuickLink key={l.to} {...l} />)}
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Today's Tasks</h3>
          <div className="space-y-3 text-sm text-slate-600">
            {[
              { label: 'Register incoming shipments', path: '/shipments/incoming', done: false },
              { label: 'Update inventory records',    path: '/inventory/update',   done: false },
              { label: 'Generate waybills',           path: '/waybill',            done: false },
              { label: 'Process pending orders',      path: '/orders',             done: false },
            ].map((t, i) => (
              <Link key={i} to={t.path}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <div className={`h-4 w-4 rounded border-2 ${t.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`} />
                <span>{t.label}</span>
                <ArrowRight size={12} className="ml-auto text-slate-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── WAREHOUSE STAFF DASHBOARD ─────────────────────────────────
function WarehouseDashboard({ firstName }) {
  const kpis = [
    { title: 'Pending Receiving',  value: '—', subtitle: 'Shipments at dock',         icon: PackageCheck,  trend: null, variant: 'purple' },
    { title: 'Items to Pick',      value: '—', subtitle: 'Orders for picking',        icon: ClipboardList, trend: null, variant: 'blue' },
    { title: 'Items to Pack',      value: '—', subtitle: 'Ready for packing',         icon: Package,       trend: null, variant: 'green' },
    { title: 'Inspection Queue',   value: '—', subtitle: 'Items awaiting inspection', icon: ScanLine,      trend: null, variant: 'orange' },
    { title: 'Defective Found',    value: '—', subtitle: 'Today\'s defects',          icon: AlertCircle,   trend: null, variant: 'red' },
    { title: 'Tasks Completed',    value: '—', subtitle: 'Today\'s completions',      icon: CheckCircle,   trend: null, variant: 'teal' },
  ];
  const quickLinks = [
    { to: '/receiving',              icon: Truck,         label: 'Receiving',            description: 'Log incoming shipments',       color: 'purple' },
    { to: '/inspection',             icon: ScanLine,      label: 'Inspection',           description: 'Inspect received items',       color: 'orange' },
    { to: '/picking',                icon: ClipboardList, label: 'Picking',              description: 'Pick items for orders',        color: 'blue' },
    { to: '/picking/fifo',           icon: Layers,        label: 'FIFO Picking',         description: 'First-in-first-out picking',   color: 'green' },
    { to: '/packing',                icon: Package,       label: 'Packing',              description: 'Pack picked items',            color: 'teal' },
    { to: '/barcode/scan',           icon: ScanLine,      label: 'Barcode Scanner',      description: 'Scan product barcodes',        color: 'red' },
  ];
  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={i} variants={fadeInUp}><KpiCard {...k} /></motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickLinks.map((l) => <QuickLink key={l.to} {...l} />)}
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Workflow Queue</h3>
          <div className="space-y-2">
            {[
              { step: '1', label: 'Receive shipment at dock',    path: '/receiving',   color: 'bg-purple-100 text-purple-700' },
              { step: '2', label: 'Inspect received items',      path: '/inspection',  color: 'bg-orange-100 text-orange-700' },
              { step: '3', label: 'Pick items from shelves',     path: '/picking',     color: 'bg-blue-100 text-blue-700' },
              { step: '4', label: 'Pack items for shipping',     path: '/packing',     color: 'bg-green-100 text-green-700' },
              { step: '5', label: 'Attach waybill to shipment',  path: '/waybill/attach', color: 'bg-teal-100 text-teal-700' },
            ].map((s, i) => (
              <Link key={i} to={s.path}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.color}`}>
                  {s.step}
                </span>
                <span className="text-sm text-slate-700">{s.label}</span>
                <ArrowRight size={12} className="ml-auto text-slate-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ── SALES STAFF DASHBOARD ─────────────────────────────────────
function SalesDashboard({ firstName }) {
  const kpis = [
    { title: 'Sales Orders',      value: '—', subtitle: 'Active orders',            icon: ShoppingCart, trend: null, variant: 'blue' },
    { title: "Today's Revenue",   value: '—', subtitle: 'Sales today',              icon: TrendingUp,   trend: null, variant: 'green' },
    { title: 'Pending Payments',  value: '—', subtitle: 'Awaiting payment',         icon: Receipt,      trend: null, variant: 'orange' },
    { title: 'Customers',         value: '—', subtitle: 'Total customers',          icon: Users,        trend: null, variant: 'purple' },
    { title: 'Pending Returns',   value: '—', subtitle: 'Returns to verify',        icon: RotateCcw,    trend: null, variant: 'orange' },
    { title: 'Refunds Today',     value: '—', subtitle: 'Processed today',          icon: RotateCcw,    trend: null, variant: 'red' },
  ];
  const quickLinks = [
    { to: '/sales/walk-in',   icon: ShoppingCart, label: 'Walk-in Sales',       description: 'Process walk-in customers',    color: 'blue' },
    { to: '/sales/orders',    icon: ClipboardList,label: 'Sales Orders',        description: 'Manage sales orders',          color: 'purple' },
    { to: '/customers',       icon: Users,        label: 'Customers',           description: 'View customer records',        color: 'teal' },
    { to: '/payments',        icon: Receipt,      label: 'Payments',            description: 'Process payments',             color: 'green' },
    { to: '/invoices',        icon: FileText,     label: 'Invoices',            description: 'Generate and view invoices',   color: 'orange' },
    { to: '/returns/verify',  icon: RotateCcw,    label: 'Return Verification', description: 'Verify customer returns',      color: 'red' },
  ];
  return (
    <>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {kpis.map((k, i) => (
          <motion.div key={i} variants={fadeInUp}><KpiCard {...k} /></motion.div>
        ))}
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2.5">
            {quickLinks.map((l) => <QuickLink key={l.to} {...l} />)}
          </div>
        </motion.div>
        <motion.div variants={fadeInUp} initial="hidden" animate="visible"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Sales Workflow</h3>
          <div className="space-y-2">
            {[
              { step: '1', label: 'Create or find customer',     path: '/customers',       color: 'bg-blue-100 text-blue-700' },
              { step: '2', label: 'Create sales order',          path: '/sales/orders',    color: 'bg-purple-100 text-purple-700' },
              { step: '3', label: 'Release product to customer', path: '/product-release', color: 'bg-green-100 text-green-700' },
              { step: '4', label: 'Process payment',             path: '/payments',        color: 'bg-orange-100 text-orange-700' },
              { step: '5', label: 'Generate receipt / invoice',  path: '/receipts',        color: 'bg-teal-100 text-teal-700' },
            ].map((s, i) => (
              <Link key={i} to={s.path}
                className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.color}`}>
                  {s.step}
                </span>
                <span className="text-sm text-slate-700">{s.label}</span>
                <ArrowRight size={12} className="ml-auto text-slate-400" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN DASHBOARD — picks the right view by role
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
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const primaryRole = roles[0];

  // Pick the role-specific content
  const renderContent = () => {
    switch (primaryRole) {
      case 'admin':             return <AdminDashboard       firstName={firstName} />;
      case 'manager':           return <ManagerDashboard     firstName={firstName} />;
      case 'operational_staff': return <OperationalDashboard firstName={firstName} />;
      case 'warehouse_staff':   return <WarehouseDashboard   firstName={firstName} />;
      case 'sales_staff':       return <SalesDashboard       firstName={firstName} />;
      default:
        return (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <AlertTriangle size={32} className="mx-auto mb-3 text-amber-500" />
            <h3 className="font-semibold text-slate-700 mb-1">No role assigned yet</h3>
            <p className="text-sm text-slate-500">
              Your account doesn't have a role assigned. Please contact your administrator.
            </p>
          </div>
        );
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Greeting */}
      <motion.div variants={fadeInUp} className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-0.5">
          {greeting}, {firstName}.
        </h2>
        <p className="text-slate-500 text-sm">Here's what's happening with your inventory today.</p>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <Clock size={11} />
          {currentDate}
        </p>
      </motion.div>

      {/* Role-specific content */}
      {renderContent()}
    </motion.div>
  );
}
