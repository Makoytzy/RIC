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

// ══════════════════════════════════════════════════════════════
// ROLE DASHBOARDS
// ══════════════════════════════════════════════════════════════

// ── ADMIN ──────────────────────────────────────────────────────
function AdminDashboard({ name }) {
  return <AdminDashboardView name={name} />;
}

// ── MANAGER ───────────────────────────────────────────────────
function ManagerDashboard({ name }) {
  return (
    <>
      <AlertBanner items={['Pending approvals require your review']} />

      {/* KPIs — Document: Total Inventory, Low Stock, Incoming Shipments,
                         Pending Receiving, Storage Capacity, Discrepancies,
                         Pending Approvals, Today's Orders */}
      <Section title="Operational Overview" cols={4}>
        <KpiCard icon={Boxes}         label="Total Inventory"      value="—" sub="Units in stock"               variant="blue"   />
        <KpiCard icon={AlertTriangle} label="Low Stock"            value="—" sub="Products below threshold"     variant="amber"  />
        <KpiCard icon={Ship}          label="Incoming Shipments"   value="—" sub="En route"                     variant="purple" />
        <KpiCard icon={PackageCheck}  label="Pending Receiving"    value="—" sub="Awaiting dock check-in"       variant="slate"  />
        <KpiCard icon={Warehouse}     label="Storage Capacity"     value="—" sub="Locations available"          variant="green"  />
        <KpiCard icon={AlertTriangle} label="Discrepancies"        value="—" sub="Open cases"                   variant="red"    />
        <KpiCard icon={CheckCircle}   label="Pending Approvals"    value="—" sub="Awaiting your review"         variant="amber"  />
        <KpiCard icon={ShoppingCart}  label="Today's Orders"       value="—" sub="New orders today"             variant="teal" />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Inventory & Warehouse</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            <QuickLink to="/inventory"       icon={Boxes}         label="Inventory Overview"    desc="Monitor stock levels and locations"           color="blue"   />
            <QuickLink to="/receiving"       icon={PackageCheck}  label="Receiving"             desc="Review incoming shipment results"            color="green"  />
            <QuickLink to="/warehouse"       icon={Warehouse}     label="Warehouse Storage"     desc="Monitor exact storage locations"             color="teal"   />
            <QuickLink to="/barcodes"        icon={Barcode}       label="Barcode Monitoring"    desc="Individual tire traceability"                color="purple" />
            <QuickLink to="/stock-movement"  icon={MoveRight}     label="Stock Movement"        desc="Track inventory movements"                   color="slate"  />
            <QuickLink to="/discrepancies"   icon={AlertTriangle} label="Discrepancies"         desc="Approve or reject discrepancy actions"       color="red"    />
          </motion.div>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Operations & Reports</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            <QuickLink to="/approvals"                icon={CheckCircle}   label="Approval Requests"      desc="Review and approve pending requests"         color="amber"  />
            <QuickLink to="/orders"                   icon={ShoppingCart}  label="Orders"                 desc="Monitor and supervise order activity"         color="blue"   />
            <QuickLink to="/returns"                  icon={RotateCcw}     label="Returns / Refunds"      desc="Monitor return and refund cases"              color="amber"  />
            <QuickLink to="/reports"                  icon={BarChart2}     label="All Reports"            desc="Access all operational reports"              color="purple" />
            <QuickLink to="/reports/inventory"        icon={Boxes}         label="Inventory Reports"      desc="Stock level and movement reports"            color="green"  />
            <QuickLink to="/reports/discrepancies"    icon={FileStack}     label="Discrepancy Reports"    desc="Missing, excess, wrong, damaged inventory"    color="red"    />
          </motion.div>
        </div>
      </div>
    </>
  );
}

// ── OPERATIONAL STAFF ─────────────────────────────────────────
function OperationalDashboard({ name }) {
  return (
    <>
      {/* KPIs — Document: Expected Shipments, Today's Arrivals,
                         Pending Shipments, Completed Shipments, Products Expected */}
      <Section title="Shipment Overview" cols={3}>
        <KpiCard icon={Calendar}      label="Expected Shipments"    value="—" sub="Scheduled arrivals"          variant="blue"   />
        <KpiCard icon={Ship}          label="Today's Arrivals"      value="—" sub="Arriving today"              variant="green"  />
        <KpiCard icon={Clock}         label="Pending Shipments"     value="—" sub="Not yet received"            variant="amber"  />
        <KpiCard icon={CheckCircle}   label="Completed Shipments"   value="—" sub="Received this week"          variant="slate"  />
        <KpiCard icon={Package}       label="Products Expected"     value="—" sub="Units on incoming shipments" variant="purple" />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Shipments</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            <QuickLink to="/shipments/incoming"  icon={Ship}         label="Incoming Shipments"    desc="Create and manage shipment records"           color="blue"   />
            <QuickLink to="/shipments/documents" icon={FileStack}    label="Shipment Documents"    desc="BL number, packing list, container info"       color="slate"  />
            <QuickLink to="/shipments/schedule"  icon={Calendar}     label="Shipment Schedule"     desc="View expected arrival dates"                  color="purple" />
          </motion.div>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Products & Inventory</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            <QuickLink to="/products/list"       icon={Package}      label="Products"              desc="Encode product info and expected quantities"   color="green"  />
            <QuickLink to="/expected-inventory"  icon={ListChecks}   label="Expected Inventory"    desc="Maintain expected inventory records"           color="teal"   />
            <QuickLink to="/barcode/prepare"     icon={Barcode}      label="Barcode Preparation"   desc="Prepare shipment barcode information"          color="amber"  />
            <QuickLink to="/suppliers"           icon={Truck}        label="Suppliers"             desc="View supplier information"                     color="slate"  />
          </motion.div>
        </div>
      </div>

      {/* Workflow guide */}
      <div className="mt-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Shipment Preparation Workflow</h3>
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
          {[
            { step: '1', label: 'Create incoming shipment record',                    path: '/shipments/incoming',  color: 'bg-blue-100 text-blue-700'   },
            { step: '2', label: 'Encode supplier, BL number, container & packing list', path: '/shipments/documents', color: 'bg-purple-100 text-purple-700' },
            { step: '3', label: 'Encode product information and expected quantities', path: '/products/list',       color: 'bg-green-100 text-green-700'  },
            { step: '4', label: 'Prepare barcode information for shipment',           path: '/barcode/prepare',     color: 'bg-amber-100 text-amber-700'  },
            { step: '5', label: 'Confirm expected arrival date in schedule',          path: '/shipments/schedule',  color: 'bg-teal-100 text-teal-700'    },
          ].map((s) => (
            <Link key={s.step} to={s.path}>
              <motion.div variants={fadeUp}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.color}`}>{s.step}</span>
                <span className="text-sm text-slate-700">{s.label}</span>
                <ChevronRight size={13} className="ml-auto text-slate-400" />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </>
  );
}

// ── WAREHOUSE STAFF ───────────────────────────────────────────
function WarehouseDashboard({ name }) {
  return (
    <>
      {/* KPIs — Document: Shipments to Receive, Receiving Today,
                         Items to Store, Storage Tasks, Pending Discrepancies,
                         Stock Count Tasks */}
      <Section title="Warehouse Overview" cols={3}>
        <KpiCard icon={Ship}          label="Shipments to Receive"  value="—" sub="At dock awaiting check-in"   variant="purple" />
        <KpiCard icon={PackageCheck}  label="Receiving Today"       value="—" sub="Scheduled for today"         variant="blue"   />
        <KpiCard icon={MapPin}        label="Items to Store"        value="—" sub="Pending storage assignment"  variant="green"  />
        <KpiCard icon={ListChecks}    label="Storage Tasks"         value="—" sub="Active put-away tasks"       variant="teal"   />
        <KpiCard icon={AlertTriangle} label="Pending Discrepancies" value="—" sub="Open discrepancy reports"   variant="red"    />
        <KpiCard icon={ClipboardList} label="Stock Count Tasks"     value="—" sub="Scheduled counts"           variant="amber"  />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Access</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            <QuickLink to="/receiving"       icon={PackageCheck}  label="Receiving"              desc="Receive physical shipments at dock"           color="blue"   />
            <QuickLink to="/barcode/scan"    icon={ScanBarcode}   label="Barcode Scanner"        desc="Scan individual tire barcodes"                color="purple" />
            <QuickLink to="/inventory"       icon={Boxes}         label="Inventory"              desc="View current inventory levels"                color="green"  />
            <QuickLink to="/warehouse"       icon={Warehouse}     label="Storage Locations"      desc="Follow system-assigned shelf locations"       color="teal"   />
            <QuickLink to="/stock-movement"  icon={MoveRight}     label="Stock Movement"         desc="Move stock between authorized locations"      color="slate"  />
            <QuickLink to="/inventory/count" icon={ClipboardList} label="Inventory Count"        desc="Perform inventory counts"                     color="amber"  />
            <QuickLink to="/discrepancies"   icon={AlertTriangle} label="Discrepancies"          desc="Create and report discrepancy cases"          color="red"    />
            <QuickLink to="/location-lookup" icon={Search}        label="Location Lookup"        desc="Find exact location and traceability of a tire" color="blue" />
          </motion.div>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Physical Receiving Workflow</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {[
              { step: '1', label: 'Receive physical shipment at dock',                path: '/receiving',       color: 'bg-blue-100 text-blue-700'   },
              { step: '2', label: 'Verify shipment documents and quantities',         path: '/receiving',       color: 'bg-purple-100 text-purple-700' },
              { step: '3', label: 'Scan individual tire barcodes',                   path: '/barcode/scan',    color: 'bg-green-100 text-green-700'  },
              { step: '4', label: 'Inspect tires and report any discrepancies',      path: '/discrepancies',   color: 'bg-amber-100 text-amber-700'  },
              { step: '5', label: 'Follow system-assigned storage location',         path: '/warehouse',       color: 'bg-teal-100 text-teal-700'    },
              { step: '6', label: 'Record stock movement after storage',             path: '/stock-movement',  color: 'bg-slate-100 text-slate-700'  },
            ].map((s) => (
              <Link key={s.step} to={s.path}>
                <motion.div variants={fadeUp}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.color}`}>{s.step}</span>
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <ChevronRight size={13} className="ml-auto text-slate-400" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}

// ── SALES STAFF ───────────────────────────────────────────────
function SalesDashboard({ name }) {
  return (
    <>
      {/* KPIs — Document: Today's Orders, Pending Orders, Orders to Pick,
                         Ready for Release, Completed Orders, Returns */}
      <Section title="Sales Overview" cols={3}>
        <KpiCard icon={ShoppingCart}  label="Today's Orders"        value="—" sub="New orders today"            variant="blue"   />
        <KpiCard icon={Clock}         label="Pending Orders"         value="—" sub="Awaiting processing"         variant="amber"  />
        <KpiCard icon={ListChecks}    label="Orders to Pick"         value="—" sub="Ready for warehouse pick"    variant="purple" />
        <KpiCard icon={Package}       label="Ready for Release"      value="—" sub="Packed and waiting"          variant="green"  />
        <KpiCard icon={CheckCircle}   label="Completed Orders"       value="—" sub="Delivered today"             variant="slate"  />
        <KpiCard icon={RotateCcw}     label="Returns"                value="—" sub="Pending verification"        variant="red"    />
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Quick Access</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            <QuickLink to="/orders"          icon={ShoppingCart}  label="Orders"                  desc="Create and manage online & walk-in orders"   color="blue"   />
            <QuickLink to="/customers"       icon={Users}         label="Customers"               desc="Create and view customer records"             color="green"  />
            <QuickLink to="/inventory/lookup" icon={Search}       label="Inventory Lookup"        desc="Check inventory availability by product"      color="teal"   />
            <QuickLink to="/picking"         icon={ListChecks}    label="Picking"                 desc="Create and monitor picking tasks"             color="purple" />
            <QuickLink to="/barcode/scan"    icon={ScanBarcode}   label="Barcode Scanner"         desc="Verify individual inventory items"            color="slate"  />
            <QuickLink to="/receipts"        icon={Receipt}       label="Acknowledgement Receipts" desc="Prepare and manage receipts"                 color="amber"  />
            <QuickLink to="/returns"         icon={RotateCcw}     label="Returns"                 desc="Process sales-related returns"                color="red"    />
          </motion.div>
        </div>
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Sales Order Workflow</h3>
          <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-2">
            {[
              { step: '1', label: 'Create or find the customer record',       path: '/customers',        color: 'bg-blue-100 text-blue-700'   },
              { step: '2', label: 'Create online or walk-in order',           path: '/orders',           color: 'bg-purple-100 text-purple-700' },
              { step: '3', label: 'Check inventory availability',             path: '/inventory/lookup', color: 'bg-green-100 text-green-700'  },
              { step: '4', label: 'Create or monitor picking task',           path: '/picking',          color: 'bg-amber-100 text-amber-700'  },
              { step: '5', label: 'Scan barcode to verify inventory item',    path: '/barcode/scan',     color: 'bg-teal-100 text-teal-700'    },
              { step: '6', label: 'Prepare acknowledgement receipt',          path: '/receipts',         color: 'bg-slate-100 text-slate-700'  },
            ].map((s) => (
              <Link key={s.step} to={s.path}>
                <motion.div variants={fadeUp}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.color}`}>{s.step}</span>
                  <span className="text-sm text-slate-700">{s.label}</span>
                  <ChevronRight size={13} className="ml-auto text-slate-400" />
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
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

      {/* Greeting */}
      <motion.div variants={fadeUp} className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {greeting}, {firstName}.
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Here's what's happening with your inventory today.
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
          <Clock size={11} /> {dateStr}
        </p>
      </motion.div>

      {content}
    </motion.div>
  );
}
