import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Users, Search, ListChecks, ScanBarcode, Receipt,
  RotateCcw, DollarSign, Clock, Package, CheckCircle, RefreshCw,
  Sparkles, ChevronRight, ArrowRight, Activity, CreditCard, FileText,
  Building, CheckCircle2, Bell
} from 'lucide-react';
import api from '../../../services/api.js';

// Motion variants
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function SalesDashboardView({ name = 'Sales Staff' }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    salesOrders: 0,
    revenueToday: 0,
    pendingPayments: 0,
    customers: 0,
    pendingReturns: 0,
    refundsToday: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // 1. Sales KPIs
      try {
        const { data } = await api.get('/dashboard/sales');
        if (data?.kpis) {
          setMetrics(prev => ({
            ...prev,
            salesOrders: data.kpis.salesOrders ?? prev.salesOrders,
            revenueToday: data.kpis.revenueToday ?? prev.revenueToday,
            pendingPayments: data.kpis.pendingPayments ?? prev.pendingPayments,
            customers: data.kpis.customers ?? prev.customers,
            pendingReturns: data.kpis.pendingReturns ?? prev.pendingReturns,
            refundsToday: data.kpis.refundsToday ?? prev.refundsToday,
          }));
        }
      } catch (err) {
        console.warn('Sales dashboard API notice:', err);
      }

      // 2. Recent activity
      try {
        const { data: adminData } = await api.get('/dashboard/admin');
        if (adminData?.recentActivity && adminData.recentActivity.length > 0) {
          setRecentLogs(adminData.recentActivity);
        }
      } catch (err) {
        console.warn('Activity log notice:', err);
      }

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="space-y-7">
      {/* ── Executive Hero Banner ─────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-rose-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Sales Terminal &amp; Customer Portal • Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Sales terminal active. Process online &amp; walk-in sales orders, verify tire inventory availability, manage customer records, issue receipts, and process returns.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all backdrop-blur-md border border-white/10 active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Syncing...' : 'Refresh Data'}
            </button>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              New Sales Order
            </Link>

            <Link
              to="/inventory/lookup"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700 active:scale-95"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              Inventory Lookup
            </Link>
          </div>
        </div>

        {/* Real-time Sales Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Sales Orders</p>
              <p className="text-xs font-semibold text-rose-300 flex items-center gap-1.5 mt-0.5 truncate">
                {metrics.salesOrders} Orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Today's Revenue</p>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">{formatCurrency(metrics.revenueToday)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Pending Payments</p>
              <p className="text-xs font-semibold text-amber-300 mt-0.5 truncate">{metrics.pendingPayments} Pending</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Total Customers</p>
              <p className="text-xs font-bold text-blue-300 mt-0.5 truncate">{metrics.customers} Records</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Core Sales KPIs ────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Sales Orders */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sales Orders</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.salesOrders}</span>
            <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              Recorded
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Online &amp; walk-in orders</span>
            <Link to="/orders" className="text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-0.5">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Today's Revenue */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue Today</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(metrics.revenueToday)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Settled transactions today</span>
            <Link to="/payments" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-0.5">
              Payments <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Pending Payments */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingPayments}</span>
            <span className="text-xs font-medium text-amber-600">Awaiting settlement</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Unpaid invoices</span>
            <Link to="/payments" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Settle <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Returns & Refunds */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Returns Pending</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingReturns}</span>
            <span className="text-xs font-medium text-blue-600">Pending review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Customer returns</span>
            <Link to="/returns" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5">
              Verify <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Sales Terminal & Order Workflow ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Orders & Inventory Lookup (2 Cols) */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-rose-600" />
                Sales Terminal &amp; Stock Availability
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Create sales orders, check real-time tire stock by size, and issue receipts</p>
            </div>
            <Link
              to="/inventory/lookup"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Lookup Tire Stock <Search className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Walk-In &amp; Counter Sales</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Process immediate counter sales, select tire models, apply discounts, and generate instant receipts.
                  </p>
                </div>
              </div>
              <Link
                to="/sales/walk-in"
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Walk-In Terminal
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Acknowledgement Receipts &amp; Invoices</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Prepare printable customer receipts and formal sales invoices.
                  </p>
                </div>
              </div>
              <Link
                to="/receipts"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Issue Receipts
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Sales Order Workflow Guide (1 Col) */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-rose-600" />
                  Sales Order Workflow
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Step-by-step customer checkout</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { step: '1', label: 'Create or find customer record', path: '/customers', color: 'bg-rose-100 text-rose-700' },
                { step: '2', label: 'Create online or walk-in sales order', path: '/orders', color: 'bg-purple-100 text-purple-700' },
                { step: '3', label: 'Check inventory stock availability', path: '/inventory/lookup', color: 'bg-emerald-100 text-emerald-700' },
                { step: '4', label: 'Create or monitor picking task', path: '/picking', color: 'bg-amber-100 text-amber-700' },
                { step: '5', label: 'Scan barcode to verify item', path: '/barcode/scan', color: 'bg-teal-100 text-teal-700' },
                { step: '6', label: 'Prepare acknowledgement receipt', path: '/receipts', color: 'bg-slate-100 text-slate-700' },
              ].map((s) => (
                <Link key={s.step} to={s.path}>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 hover:bg-rose-50 hover:border-rose-200 transition-colors">
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${s.color}`}>
                      {s.step}
                    </span>
                    <span className="text-xs font-medium text-slate-700 truncate">{s.label}</span>
                    <ChevronRight size={13} className="ml-auto text-slate-400 shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Categorized Sales Launchpad ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sales Command Toolsets</h2>
            <p className="text-xs text-slate-500">Direct access to orders, customers, inventory lookup, and receipts</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Sales & Walk-In Terminal */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-rose-200/80 bg-gradient-to-b from-rose-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-500/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales Orders</h3>
                <p className="text-[11px] text-slate-500">Terminal &amp; orders</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-rose-100">
              <Link to="/orders" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-100/60 hover:text-rose-900 transition-colors">
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-rose-600" /> Sales Orders</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/sales/walk-in" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-100/60 hover:text-rose-900 transition-colors">
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-rose-600" /> Walk-In Counter</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/product-release" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-100/60 hover:text-rose-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-rose-600" /> Product Release</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Customers & Accounts */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customers &amp; Billing</h3>
                <p className="text-[11px] text-slate-500">Accounts &amp; payments</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-blue-100">
              <Link to="/customers" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-600" /> Customer Directory</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/payments" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Payments &amp; Settlement</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/invoices" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-blue-600" /> Invoices</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Stock Lookup & Barcode */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stock &amp; Barcode</h3>
                <p className="text-[11px] text-slate-500">Availability &amp; verification</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              <Link to="/inventory/lookup" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><Search className="w-4 h-4 text-emerald-600" /> Inventory Lookup</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/barcode/scan" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ScanBarcode className="w-4 h-4 text-emerald-600" /> Barcode Verification</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/picking" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ListChecks className="w-4 h-4 text-emerald-600" /> Picking Orders</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Receipts & Returns */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Receipts &amp; Returns</h3>
                <p className="text-[11px] text-slate-500">Acknowledgements &amp; refunds</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <Link to="/receipts" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Receipt className="w-4 h-4 text-purple-600" /> Acknowledgements</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/returns" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-purple-600" /> Returns Verification</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/refunds" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-600" /> Refund Processing</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live Sales Activity Stream ────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              Live Sales &amp; Transaction Stream
            </h2>
            <p className="text-xs text-slate-500">Real-time log of customer orders, payments, receipts, and returns</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent sales activity</p>
              <p className="text-xs text-slate-400 mt-1">Transaction logs will appear here</p>
            </div>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-100 text-slate-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{log.action || 'sales.transaction'}</span>
                      <span className="text-[11px] text-slate-400">• {log.user || 'Sales Staff'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details || 'Sales transaction executed'}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">{log.time || 'Recently'}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
