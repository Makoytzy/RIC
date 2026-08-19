import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, ShoppingCart, Users, CreditCard, TrendingUp, Activity,
  RefreshCw, CheckCircle, Clock, Package, Receipt, RotateCcw, Search,
  UserPlus, FileText, BarChart3, ArrowRight, ChevronRight, Wallet,
  ShoppingBag, PackageSearch, ScanBarcode, Calculator, Bell, Target,
  MessageSquare, BookOpen, History, AlertCircle, Sparkles, Zap
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

  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionSubmitted, setActionSubmitted] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get('/dashboard/sales');
      
      if (data?.kpis) {
        setMetrics({
          salesOrders: data.kpis.salesOrders ?? 0,
          revenueToday: data.kpis.revenueToday ?? 0,
          pendingPayments: data.kpis.pendingPayments ?? 0,
          customers: data.kpis.customers ?? 0,
          pendingReturns: data.kpis.pendingReturns ?? 0,
          refundsToday: data.kpis.refundsToday ?? 0,
        });
      }

      if (data?.recentActivity) {
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.warn('Sales dashboard API notice:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickAction = (type) => {
    setActionType(type);
    setQuickActionModal(true);
  };

  const handleActionSubmit = (e) => {
    e.preventDefault();
    setActionSubmitted(true);
    setTimeout(() => {
      setActionSubmitted(false);
      setQuickActionModal(false);
      setActionType('');
    }, 1500);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-7">
      {/* ── Executive Hero Banner ─────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-rose-900 to-pink-900 p-6 sm:p-8 text-white shadow-xl border border-rose-800"
      >
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-rose-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Sales Terminal &amp; Customer Portal • Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <ShoppingBag className="w-6 h-6 text-rose-400" />
            </h1>
            <p className="text-rose-200 text-sm max-w-2xl leading-relaxed">
              Customer-facing sales terminal for walk-in transactions, order creation, payment processing, customer account management, and returns handling.
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
              to="/sales/new-order"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              New Sale
            </Link>

            <button
              onClick={() => handleQuickAction('customer')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-rose-200 text-sm font-medium transition-all border border-rose-700 active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              Quick Customer
            </button>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-900/80 border border-rose-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Total Sales Orders</p>
              <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mt-0.5 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shrink-0" />
                {metrics.salesOrders} orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-900/80 border border-rose-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Today's Revenue</p>
              <p className="text-xs font-semibold text-rose-100 mt-0.5 truncate">{formatCurrency(metrics.revenueToday)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-900/80 border border-rose-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Pending Payments</p>
              <p className="text-xs font-semibold text-blue-300 mt-0.5 truncate">{metrics.pendingPayments} awaiting</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-900/80 border border-rose-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300">Total Customers</p>
              <p className="text-xs font-bold text-purple-300 mt-0.5 truncate">{metrics.customers} accounts</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Core Sales KPIs ─────────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Sales Orders */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sales Orders</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.salesOrders}</span>
            <span className="text-xs font-medium text-slate-500">Total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> All time
            </span>
            <Link to="/sales/orders" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-0.5">
              View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Revenue Today */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Revenue Today</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(metrics.revenueToday)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-amber-600 font-medium">Today's sales</span>
            <Link to="/sales/revenue" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Pending Payments */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payments</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingPayments}</span>
            <span className="text-xs font-medium text-slate-500">Awaiting</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-blue-600 font-medium">Payment tracking</span>
            <Link to="/sales/payments" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5">
              Process <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Customer Accounts */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Accounts</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.customers}</span>
            <span className="text-xs font-medium text-slate-500">Total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-purple-600 font-medium">Customer database</span>
            <Link to="/customers" className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-0.5">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Sales Transactions & Workflow ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Transactions & Revenue Tracker */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Sales Transactions &amp; Revenue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Current period performance overview</p>
            </div>
            <Link to="/sales/reports" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Revenue Today</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                  {formatCurrency(metrics.revenueToday)}
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Total sales revenue generated from completed transactions today</p>
              <Link to="/sales/revenue" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1">
                View Revenue Report <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Pending Payments</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {metrics.pendingPayments} orders
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Orders awaiting payment confirmation or partial payment completion</p>
              <Link to="/sales/payments" className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1">
                Process Payments <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Returns &amp; Refunds</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {metrics.pendingReturns} pending
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Customer returns awaiting processing and refund issuance</p>
              <Link to="/sales/returns" className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
                Process Returns <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Interactive Sales Order Workflow */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-600" />
                Sales Order Workflow Guide
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Step-by-step transaction processing</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Customer Check-In &amp; Lookup</h3>
                <p className="text-xs text-slate-600 mt-1">Search existing customer or create new account with contact details</p>
                <button 
                  onClick={() => handleQuickAction('customer')}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 mt-2"
                >
                  Quick Customer Lookup <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Product Selection &amp; Cart</h3>
                <p className="text-xs text-slate-600 mt-1">Scan barcodes or search catalog, add items to cart, verify pricing</p>
                <Link to="/sales/new-order" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 mt-2">
                  Start New Order <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Payment Processing &amp; Receipt</h3>
                <p className="text-xs text-slate-600 mt-1">Process payment (cash, card, account), print receipt, update inventory</p>
                <Link to="/sales/checkout" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-2">
                  Checkout Terminal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Order Fulfillment &amp; Handoff</h3>
                <p className="text-xs text-slate-600 mt-1">Coordinate product pickup, customer handoff, generate shipping docs if needed</p>
                <Link to="/sales/fulfillment" className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 mt-2">
                  Fulfillment Queue <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Categorized Sales Launchpad ────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sales Terminal &amp; Customer Services</h2>
            <p className="text-xs text-slate-500">Direct access to order processing, customer management, and transaction tools</p>
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
                <h3 className="text-sm font-bold text-slate-900">Sales &amp; Walk-In</h3>
                <p className="text-[11px] text-slate-500">Order &amp; checkout</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-rose-100">
              <Link to="/sales/new-order" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-100/60 hover:text-rose-900 transition-colors">
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-rose-600" /> New Sales Order</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/sales/checkout" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-100/60 hover:text-rose-900 transition-colors">
                <span className="flex items-center gap-2"><Calculator className="w-4 h-4 text-rose-600" /> Checkout Terminal</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/sales/orders" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-100/60 hover:text-rose-900 transition-colors">
                <span className="flex items-center gap-2"><History className="w-4 h-4 text-rose-600" /> Order History</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Customer & Accounts */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Customer &amp; Accounts</h3>
                <p className="text-[11px] text-slate-500">Management &amp; lookup</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <button 
                onClick={() => handleQuickAction('customer')}
                className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors"
              >
                <span className="flex items-center gap-2"><Search className="w-4 h-4 text-purple-600" /> Customer Lookup</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
              <Link to="/customers" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Users className="w-4 h-4 text-purple-600" /> Customer Directory</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/customers/new" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><UserPlus className="w-4 h-4 text-purple-600" /> New Customer</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Stock Lookup & Barcode */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <PackageSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Stock &amp; Barcode</h3>
                <p className="text-[11px] text-slate-500">Inventory lookup</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-blue-100">
              <Link to="/inventory/lookup" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><PackageSearch className="w-4 h-4 text-blue-600" /> Stock Lookup</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/barcode/scan" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><ScanBarcode className="w-4 h-4 text-blue-600" /> Barcode Scanner</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/products" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" /> Product Catalog</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Receipts, Returns & Refunds */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Receipts &amp; Returns</h3>
                <p className="text-[11px] text-slate-500">Processing &amp; refunds</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <Link to="/sales/receipts" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><Receipt className="w-4 h-4 text-amber-600" /> Print Receipts</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/sales/returns" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-amber-600" /> Process Returns</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/sales/refunds" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><Wallet className="w-4 h-4 text-amber-600" /> Issue Refunds</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live Sales Activity Stream ─────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-600" />
              Live Sales Activity
            </h2>
            <p className="text-xs text-slate-500">Real-time transaction and customer service events</p>
          </div>
          <Link to="/sales/activity" className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
            Full Log <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Sales transactions will appear here</p>
            </div>
          ) : (
            recentActivity.slice(0, 8).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-rose-100 text-rose-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{log.action || 'sales.event'}</span>
                      <span className="text-[11px] text-slate-400">• {log.user || 'Sales Staff'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details || 'Transaction completed'}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">{log.time || 'Recently'}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Quick Action Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {quickActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Quick Customer Lookup</h3>
                    <p className="text-xs text-slate-500">Search by name, phone, or email</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickActionModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {actionSubmitted ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-900">Customer Found!</h4>
                  <p className="text-xs text-slate-500">Customer details retrieved successfully.</p>
                </div>
              ) : (
                <form onSubmit={handleActionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Search Customer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., John Smith, 555-0123, john@example.com"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none"
                      required
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setQuickActionModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-500/20"
                    >
                      Search Customer
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
