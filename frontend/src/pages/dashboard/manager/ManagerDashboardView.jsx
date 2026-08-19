import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, ShieldCheck, ClipboardList, TrendingUp, AlertTriangle,
  CheckCircle, Clock, RefreshCw, DollarSign, Package, Activity,
  Warehouse, BarChart3, Bell, ChevronRight, FileText, Target,
  TrendingDown, Award, Settings, ScrollText, Sparkles, UserCheck,
  PackageCheck, Boxes, ArrowRight, ListChecks, FileStack, Zap
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
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [quickNoticeModal, setQuickNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get('/dashboard/manager');
      
      if (data?.kpis) {
        setMetrics({
          pendingApprovals: data.kpis.pendingApprovals ?? 0,
          salesThisMonth: data.kpis.salesThisMonth ?? 0,
          stockMovement: data.kpis.stockMovement ?? 0,
          discrepancies: data.kpis.discrepancies ?? 0,
          employeeEfficiency: data.kpis.employeeEfficiency ?? 0,
          returnRate: data.kpis.returnRate ?? 0,
        });
      }

      if (data?.recentActivity) {
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.warn('Manager dashboard API notice:', error);
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 p-6 sm:p-8 text-white shadow-xl border border-blue-800"
      >
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Managerial Control Center • Operations Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <Target className="w-6 h-6 text-blue-400" />
            </h1>
            <p className="text-blue-200 text-sm max-w-2xl leading-relaxed">
              Comprehensive oversight of operations, approvals, team performance, and financial metrics. Monitor discrepancies and maintain workflow efficiency.
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-95"
            >
              <CheckCircle className="w-4 h-4" />
              Review Approvals
            </Link>

            <button
              onClick={() => setQuickNoticeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-700 text-blue-200 text-sm font-medium transition-all border border-blue-700 active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              Team Notice
            </button>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/80 border border-blue-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Pending Approvals</p>
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mt-0.5 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {metrics.pendingApprovals} awaiting review
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/80 border border-blue-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Monthly Sales</p>
              <p className="text-xs font-semibold text-blue-100 mt-0.5 truncate">{formatCurrency(metrics.salesThisMonth)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/80 border border-blue-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-300 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Discrepancies</p>
              <p className="text-xs font-semibold text-red-300 mt-0.5 truncate">{metrics.discrepancies} open issues</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-900/80 border border-blue-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Efficiency Rate</p>
              <p className="text-xs font-bold text-purple-300 mt-0.5 truncate">{metrics.employeeEfficiency}%</p>
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
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingApprovals}</span>
            <span className="text-xs font-medium text-slate-500">Awaiting review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-amber-600 font-medium">Requires attention</span>
            <Link to="/approvals" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Review <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Monthly Sales */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Sales</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(metrics.salesThisMonth)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> This month
            </span>
            <Link to="/reports/sales" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-0.5">
              Details <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Discrepancies */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Discrepancies</span>
            <div className="p-2.5 rounded-xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.discrepancies}</span>
            <span className="text-xs font-medium text-slate-500">Open reports</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-red-600 font-medium">Needs resolution</span>
            <Link to="/discrepancies" className="text-red-600 hover:text-red-700 font-medium inline-flex items-center gap-0.5">
              Investigate <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Team Efficiency */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Team Efficiency</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.employeeEfficiency}%</span>
            <span className="text-xs font-medium text-slate-500">Avg. rate</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-purple-600 font-medium">Performance metrics</span>
            <Link to="/reports/performance" className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-0.5">
              Analytics <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Discrepancy Overview & Performance ────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discrepancy & Approval Queue */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Discrepancy &amp; Approval Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Items requiring immediate managerial action</p>
            </div>
            <Link to="/approvals" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Pending Approvals</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {metrics.pendingApprovals} items
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Purchase orders, expense requests, and employee time-off awaiting approval</p>
              <Link to="/approvals" className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
                Review Queue <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Open Discrepancies</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  {metrics.discrepancies} reports
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Inventory count mismatches, damaged goods, and shipment variances</p>
              <Link to="/discrepancies" className="text-xs font-semibold text-red-700 hover:text-red-800 inline-flex items-center gap-1">
                Investigate Issues <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Stock Movement Today</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                  {metrics.stockMovement} transactions
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Real-time inventory adjustments and warehouse transfers</p>
              <Link to="/inventory/movements" className="text-xs font-semibold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1">
                View Movements <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Managerial Performance Metrics */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Performance Overview
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Operational efficiency and team productivity</p>
            </div>
            <Link to="/reports/performance" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Full Report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {/* Team Efficiency */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Team Efficiency Rate</span>
                <span className="text-sm font-bold text-purple-600">{metrics.employeeEfficiency}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-700"
                  style={{ width: `${metrics.employeeEfficiency}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">Average task completion rate across all teams</p>
            </div>

            {/* Sales Performance */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-800">Sales This Month</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(metrics.salesThisMonth)}</p>
              <p className="text-xs text-slate-600 mt-1">Revenue generated in current period</p>
            </div>

            {/* Return Rate */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-slate-800">Return Rate This Month</span>
                <TrendingDown className="w-4 h-4 text-slate-600" />
              </div>
              <p className="text-2xl font-bold text-slate-700">{metrics.returnRate}</p>
              <p className="text-xs text-slate-600 mt-1">Customer returns and refunds processed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Categorized Launchpad Modules ─────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Managerial Tools &amp; Quick Actions</h2>
            <p className="text-xs text-slate-500">Direct access to oversight, governance, and reporting modules</p>
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
                <h3 className="text-sm font-bold text-slate-900">Approvals &amp; Governance</h3>
                <p className="text-[11px] text-slate-500">Review &amp; authorize</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <Link to="/approvals" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-amber-600" /> Approval Queue</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/discrepancies" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" /> Discrepancy Reports</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/employees" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-amber-600" /> Team Management</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Inventory & Warehouses */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Warehouse className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Inventory &amp; Warehouses</h3>
                <p className="text-[11px] text-slate-500">Stock &amp; facility oversight</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-blue-100">
              <Link to="/inventory" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" /> Inventory Overview</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/warehouses" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Warehouse className="w-4 h-4 text-blue-600" /> Warehouse Status</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/inventory/movements" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-blue-600" /> Stock Movements</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Sales & Financial Performance */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales &amp; Financial</h3>
                <p className="text-[11px] text-slate-500">Revenue &amp; transactions</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              <Link to="/orders" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><PackageCheck className="w-4 h-4 text-emerald-600" /> Sales Orders</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/reports/sales" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" /> Revenue Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/returns" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-emerald-600" /> Returns &amp; Refunds</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Analytics & Reports Hub */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Analytics &amp; Reports</h3>
                <p className="text-[11px] text-slate-500">Insights &amp; metrics</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <Link to="/reports/performance" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Award className="w-4 h-4 text-purple-600" /> Performance Reports</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/audit-logs" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><ScrollText className="w-4 h-4 text-purple-600" /> Audit Timeline</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/reports" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><FileStack className="w-4 h-4 text-purple-600" /> Executive Reports</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live Manager Activity Stream ──────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Live Activity Stream
            </h2>
            <p className="text-xs text-slate-500">Real-time operational events and team actions</p>
          </div>
          <Link to="/audit-logs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Full Timeline <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Team events will appear here</p>
            </div>
          ) : (
            recentActivity.slice(0, 8).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-blue-100 text-blue-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{log.action || 'system.event'}</span>
                      <span className="text-[11px] text-slate-400">• {log.user || 'System'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details || 'Action executed'}</p>
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
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Team Notice</h3>
                    <p className="text-xs text-slate-500">Send an alert to your team members</p>
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
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-sm font-bold text-slate-900">Notice Sent!</h4>
                  <p className="text-xs text-slate-500">Your team will receive the message immediately.</p>
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
                      placeholder="e.g., Team meeting at 2 PM today. All warehouse supervisors required."
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                    >
                      Send Notice
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
