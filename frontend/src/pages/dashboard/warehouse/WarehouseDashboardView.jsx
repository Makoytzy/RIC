import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship, PackageCheck, MapPin, ListChecks, AlertTriangle,
  ClipboardList, ScanBarcode, Boxes, MoveRight, Search,
  RefreshCw, Sparkles, ChevronRight, ArrowRight, Activity,
  CheckCircle2, Bell, ShieldAlert, CheckCircle, Package
} from 'lucide-react';
import api from '../../../services/api.js';

// Motion variants
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function WarehouseDashboardView({ name = 'Warehouse Staff' }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    pendingReceiving: 0,
    itemsToPick: 0,
    itemsToPack: 0,
    inspectionQueue: 0,
    defectiveToday: 0,
    tasksCompleted: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // 1. Warehouse KPIs
      try {
        const { data } = await api.get('/dashboard/warehouse');
        if (data?.kpis) {
          setMetrics(prev => ({
            ...prev,
            pendingReceiving: data.kpis.pendingReceiving ?? prev.pendingReceiving,
            itemsToPick: data.kpis.itemsToPick ?? prev.itemsToPick,
            itemsToPack: data.kpis.itemsToPack ?? prev.itemsToPack,
            inspectionQueue: data.kpis.inspectionQueue ?? prev.inspectionQueue,
            defectiveToday: data.kpis.defectiveToday ?? prev.defectiveToday,
            tasksCompleted: data.kpis.tasksCompleted ?? prev.tasksCompleted,
          }));
        }
      } catch (err) {
        console.warn('Warehouse dashboard API notice:', err);
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

  return (
    <div className="space-y-7">
      {/* ── Executive Hero Banner ─────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-indigo-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Warehouse Floor &amp; Dock Control • Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Warehouse floor terminal active. Receive physical cargo at the dock, scan tire barcodes, perform put-away storage, pick sales orders, and execute stock counts.
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
              to="/receiving"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
            >
              <PackageCheck className="w-4 h-4" />
              Dock Receiving
            </Link>

            <Link
              to="/barcode/scan"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700 active:scale-95"
            >
              <ScanBarcode className="w-4 h-4 text-purple-400" />
              Scan Barcodes
            </Link>
          </div>
        </div>

        {/* Real-time Floor Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
              <Ship className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Dock Receiving</p>
              <p className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mt-0.5 truncate">
                {metrics.pendingReceiving} Shipments Awaiting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
              <ListChecks className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Picking Queue</p>
              <p className="text-xs font-semibold text-purple-300 mt-0.5 truncate">{metrics.itemsToPick} Pick Tasks</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Quality Check</p>
              <p className="text-xs font-semibold text-amber-300 mt-0.5 truncate">{metrics.inspectionQueue} Pending Check</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">My Completed Tasks</p>
              <p className="text-xs font-bold text-emerald-400 mt-0.5 truncate">{metrics.tasksCompleted} Tasks Today</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Core Floor Operations KPIs ────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Shipments to Receive */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipments to Receive</span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingReceiving}</span>
            <span className="inline-flex items-center text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              At dock
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Dock check-in required</span>
            <Link to="/receiving" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-0.5">
              Receiving <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Items to Pick */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Picking Tasks</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <ListChecks className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.itemsToPick}</span>
            <span className="text-xs font-medium text-purple-600">Pending pick</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Sales picking list</span>
            <Link to="/picking" className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-0.5">
              Pick List <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Quality Inspection Queue */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Inspection Queue</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.inspectionQueue}</span>
            <span className="text-xs font-medium text-amber-600">Awaiting audit</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Tire quality verification</span>
            <Link to="/inspection" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Inspect <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Defect Reports Today */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Defects Found Today</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.defectiveToday}</span>
            <span className="text-xs font-medium text-rose-600">Flagged items</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Discrepancy logs</span>
            <Link to="/picking-discrepancy" className="text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-0.5">
              Discrepancies <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Dock Receiving & Physical Operations Workflow ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dock Receiving & Storage Allocation (2 Cols) */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Dock Receiving &amp; Put-Away Locations
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Execute physical cargo intake and place tires into system-assigned shelf slots</p>
            </div>
            <Link
              to="/location-lookup"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Location Lookup <Search className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 mt-0.5">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Physical Dock Check-In</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Unload container cargo, count delivered physical tires, and compare against expected BL packing slips.
                  </p>
                </div>
              </div>
              <Link
                to="/receiving"
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Start Dock Check-In
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 mt-0.5">
                  <ScanBarcode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Tire Barcode Scanning &amp; Tag Binding</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Scan individual tire barcode tags to record serial traceability into the system.
                  </p>
                </div>
              </div>
              <Link
                to="/barcode/scan"
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Open Scanner
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Physical Receiving & Storage Workflow Guide (1 Col) */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-indigo-600" />
                  Floor Receiving Guide
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Standard floor operations</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { step: '1', label: 'Receive physical shipment at dock', path: '/receiving', color: 'bg-indigo-100 text-indigo-700' },
                { step: '2', label: 'Verify docs & physical quantities', path: '/receiving', color: 'bg-purple-100 text-purple-700' },
                { step: '3', label: 'Scan individual tire barcodes', path: '/barcode/scan', color: 'bg-emerald-100 text-emerald-700' },
                { step: '4', label: 'Inspect tires for defects/discrepancies', path: '/inspection', color: 'bg-amber-100 text-amber-700' },
                { step: '5', label: 'Place in assigned shelf location', path: '/warehouse', color: 'bg-teal-100 text-teal-700' },
                { step: '6', label: 'Record stock movement upon put-away', path: '/stock-movement', color: 'bg-slate-100 text-slate-700' },
              ].map((s) => (
                <Link key={s.step} to={s.path}>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 hover:bg-indigo-50 hover:border-indigo-200 transition-colors">
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

      {/* ── Categorized Warehouse Launchpad ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Floor Operations Toolsets</h2>
            <p className="text-xs text-slate-500">Direct access to dock receiving, picking, scanning, and stock count tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Dock Receiving & Inspection */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dock &amp; Receiving</h3>
                <p className="text-[11px] text-slate-500">Intake &amp; inspection</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-indigo-100">
              <Link to="/receiving" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-100/60 hover:text-indigo-900 transition-colors">
                <span className="flex items-center gap-2"><PackageCheck className="w-4 h-4 text-indigo-600" /> Dock Receiving</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/inspection" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-100/60 hover:text-indigo-900 transition-colors">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-indigo-600" /> Quality Inspection</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/location-lookup" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-100/60 hover:text-indigo-900 transition-colors">
                <span className="flex items-center gap-2"><Search className="w-4 h-4 text-indigo-600" /> Location Lookup</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Picking & Order Fulfillment */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <ListChecks className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Picking &amp; Packing</h3>
                <p className="text-[11px] text-slate-500">Order fulfillment</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <Link to="/picking" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><ListChecks className="w-4 h-4 text-purple-600" /> FIFO Picking Tasks</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/packing" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-purple-600" /> Packing Operations</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/picking-discrepancy" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-purple-600" /> Picking Discrepancies</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Barcode & Inventory Stock */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <ScanBarcode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scanning &amp; Counts</h3>
                <p className="text-[11px] text-slate-500">Tire tags &amp; audit counts</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              <Link to="/barcode/scan" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ScanBarcode className="w-4 h-4 text-emerald-600" /> Barcode Scanner</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/inventory/count" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ClipboardList className="w-4 h-4 text-emerald-600" /> Stock Audit Counts</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/inventory" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><Boxes className="w-4 h-4 text-emerald-600" /> Inventory Stock Live</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Movements & Efficiency */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
                <MoveRight className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Movements &amp; Logs</h3>
                <p className="text-[11px] text-slate-500">Stock transfers &amp; reports</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <Link to="/stock-movement" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><MoveRight className="w-4 h-4 text-amber-600" /> Stock Movements</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/efficiency-report" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-600" /> Floor Efficiency Report</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/waybill-attachment" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Waybill Attachments</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live Floor Activity Stream ────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              Live Floor &amp; Dock Activity Stream
            </h2>
            <p className="text-xs text-slate-500">Real-time log of physical dock check-ins, barcode scans, and storage tasks</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent floor activity</p>
              <p className="text-xs text-slate-400 mt-1">Warehouse task logs will appear here</p>
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
                      <span className="text-xs font-bold text-slate-800">{log.action || 'warehouse.task'}</span>
                      <span className="text-[11px] text-slate-400">• {log.user || 'Warehouse Staff'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details || 'Floor operation executed'}</p>
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
