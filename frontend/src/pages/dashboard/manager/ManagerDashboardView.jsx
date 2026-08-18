import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, Warehouse, Package, Barcode,
  ScrollText, Activity, TrendingUp, CheckCircle, AlertTriangle,
  Clock, RefreshCw, Sparkles, ChevronRight, Plus, Search,
  BarChart3, Bell, ArrowRight, DollarSign, MoveRight, RotateCcw,
  FileStack, CheckCircle2, ShoppingCart, UserCheck, Layers
} from 'lucide-react';
import api from '../../../services/api.js';

// Motion variants
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function ManagerDashboardView({ name = 'Manager' }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    pendingApprovals: 0,
    salesThisMonth: 0,
    stockMovement: 0,
    discrepancies: 0,
    employeeEfficiency: 0,
    returnRate: 0,
    totalInventory: 0,
    lowStockAlerts: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [quickNoticeModal, setQuickNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // 1. Manager KPIs
      try {
        const { data } = await api.get('/dashboard/manager');
        if (data?.kpis) {
          setMetrics(prev => ({
            ...prev,
            pendingApprovals: data.kpis.pendingApprovals ?? prev.pendingApprovals,
            salesThisMonth: data.kpis.salesThisMonth ?? prev.salesThisMonth,
            stockMovement: data.kpis.stockMovement ?? prev.stockMovement,
            discrepancies: data.kpis.discrepancies ?? prev.discrepancies,
            employeeEfficiency: data.kpis.employeeEfficiency ?? prev.employeeEfficiency,
            returnRate: data.kpis.returnRate ?? prev.returnRate,
          }));
        }
      } catch (err) {
        console.warn('Manager dashboard API notice:', err);
      }

      // 2. Fetch recent activity / logs
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

  const handleBroadcastNotice = (e) => {
    e.preventDefault();
    if (!noticeText.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setQuickNoticeModal(false);
      setNoticeText('');
    }, 1500);
  };

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
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Managerial Operations &amp; Oversight • Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Full managerial authority active. Review pending operational approvals, track stock movement, evaluate team efficiency metrics, and supervise sales performance.
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
              to="/approvals"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-semibold shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Pending Approvals ({metrics.pendingApprovals})
            </Link>

            <button
              onClick={() => setQuickNoticeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700 active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              Broadcast Notice
            </button>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Approval Queue</p>
              <p className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mt-0.5 truncate">
                {metrics.pendingApprovals} Pending Review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Monthly Revenue</p>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">{formatCurrency(metrics.salesThisMonth)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Open Discrepancies</p>
              <p className="text-xs font-semibold text-rose-300 mt-0.5 truncate">{metrics.discrepancies} Open Cases</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Staff Efficiency</p>
              <p className="text-xs font-bold text-blue-300 mt-0.5 truncate">{metrics.employeeEfficiency}% Avg Completion</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Core Executive KPIs ────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Pending Approvals */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Approvals</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingApprovals}</span>
            <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Requires Review
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Operational requests</span>
            <Link to="/approvals" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Review <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Monthly Sales Revenue */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Revenue</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(metrics.salesThisMonth)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Completed sales this month</span>
            <Link to="/reports/sales" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-0.5">
              Sales Report <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Open Discrepancies */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Stock Discrepancies</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.discrepancies}</span>
            <span className="text-xs font-medium text-rose-600">Open cases</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-rose-600 font-medium">Flagged inventory</span>
            <Link to="/reports/discrepancies" className="text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-0.5">
              Cases <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Team Efficiency Rate */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Efficiency</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.employeeEfficiency}%</span>
            <span className="text-xs font-medium text-slate-500">Average score</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Task execution velocity</span>
            <Link to="/employee-efficiency" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5">
              Efficiency <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Discrepancy & Approval Queue Oversight ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Discrepancies & Approvals (2 Cols) */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-600" />
                Operational Approvals &amp; Discrepancy Actions
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Manager authorization required for inventory write-offs and custom overrides</p>
            </div>
            <Link
              to="/approvals"
              className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Approval Hub <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Pending Inventory Adjustments</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {metrics.pendingApprovals === 0
                      ? 'No pending approval requests at this moment.'
                      : `${metrics.pendingApprovals} stock discrepancy and adjustment requests awaiting authorization.`}
                  </p>
                </div>
              </div>
              <Link
                to="/approvals"
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Review Requests
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Discrepancy Investigation Queue</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {metrics.discrepancies === 0
                      ? 'All discrepancy reports resolved cleanly.'
                      : `${metrics.discrepancies} open discrepancy reports logged by floor staff require manager sign-off.`}
                  </p>
                </div>
              </div>
              <Link
                to="/reports/discrepancies"
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Inspect Cases
              </Link>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <MoveRight className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Recorded stock movements today: <strong className="font-semibold text-slate-900">{metrics.stockMovement} events</strong></span>
            </div>
            <Link to="/reports/inventory" className="font-semibold text-blue-700 hover:underline shrink-0 ml-2">
              Movement Logs →
            </Link>
          </div>
        </motion.div>

        {/* Managerial Oversight & Performance (1 Col) */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Team Performance
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Operational throughput</p>
              </div>
              <Link to="/employee-efficiency" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                Details →
              </Link>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">Overall Efficiency</span>
                  <span className="font-bold text-blue-700">{metrics.employeeEfficiency}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${Math.min(100, metrics.employeeEfficiency || 75)}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Return &amp; Refund Rate</p>
                  <p className="text-[10px] text-slate-500">Monthly cases</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {metrics.returnRate} cases
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              to="/reports"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Open Reports Central Hub
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Categorized Manager Launchpad ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Managerial Command Toolsets</h2>
            <p className="text-xs text-slate-500">Direct access to manager supervision modules, reports, and controls</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Approvals & Governance */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Approvals &amp; Control</h3>
                <p className="text-[11px] text-slate-500">Authorizations &amp; overrides</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <Link to="/approvals" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-amber-600" /> Approval Requests</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/reports/discrepancies" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Discrepancy Actions</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/employee-efficiency" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-amber-600" /> Employee Efficiency</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Inventory & Warehouse Oversight */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inventory &amp; Storage</h3>
                <p className="text-[11px] text-slate-500">Stock &amp; barcodes</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-blue-100">
              <Link to="/inventory" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" /> Inventory Overview</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/warehouse" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Warehouse className="w-4 h-4 text-blue-600" /> Storage Capacity</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/barcodes" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Barcode className="w-4 h-4 text-blue-600" /> Barcode Monitoring</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Operations & Orders */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Orders &amp; Fulfillment</h3>
                <p className="text-[11px] text-slate-500">Sales &amp; returns</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              <Link to="/orders" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-emerald-600" /> Orders Management</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/returns" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-emerald-600" /> Returns &amp; Refunds</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/receiving" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" /> Dock Receiving</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Reports Hub */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Analytics &amp; Reports</h3>
                <p className="text-[11px] text-slate-500">Executive reporting</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <Link to="/reports" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-600" /> All Reports</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/reports/inventory" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-purple-600" /> Inventory Reports</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/reports/sales" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-600" /> Sales Reports</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live System Activity Stream ────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Managerial Activity Stream
            </h2>
            <p className="text-xs text-slate-500">Real-time audit log of approvals, inventory movements, and staff actions</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Full Reports <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Operational logs will appear here</p>
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
                      <span className="text-xs font-bold text-slate-800">{log.action || 'system.event'}</span>
                      <span className="text-[11px] text-slate-400">• {log.user || 'Operational Staff'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details || 'Action completed successfully'}</p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">{log.time || 'Recently'}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Broadcast Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {quickNoticeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Broadcast Manager Notice</h3>
                    <p className="text-xs text-slate-500">Send an instant operational banner to active personnel</p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickNoticeModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {broadcastSent ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-900">Notice Broadcasted!</h4>
                  <p className="text-xs text-slate-500">Operational staff sessions will receive the banner immediately.</p>
                </div>
              ) : (
                <form onSubmit={handleBroadcastNotice} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Notice Message
                    </label>
                    <textarea
                      rows={3}
                      value={noticeText}
                      onChange={(e) => setNoticeText(e.target.value)}
                      placeholder="e.g., Priority inventory count scheduled for Warehouse A tomorrow morning. Please finalize pending receiving logs."
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setQuickNoticeModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-md shadow-amber-500/20"
                    >
                      Send Announcement
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
