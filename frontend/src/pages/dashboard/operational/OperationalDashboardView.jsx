import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ship, Calendar, Clock, CheckCircle, Package, FileStack,
  ListChecks, Barcode, Truck, RefreshCw, Sparkles, ChevronRight,
  Plus, Search, ArrowRight, Activity, CheckCircle2, Bell,
  Layers, ShoppingCart, RotateCcw, FileText
} from 'lucide-react';
import api from '../../../services/api.js';

// Motion variants
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function OperationalDashboardView({ name = 'Operational Staff' }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState({
    pendingOrders: 0,
    incomingShipments: 0,
    productsRegistered: 0,
    activeBatches: 0,
    returnsPending: 0,
    waybillsToday: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [quickNoticeModal, setQuickNoticeModal] = useState(false);
  const [noticeText, setNoticeText] = useState('');
  const [broadcastSent, setBroadcastSent] = useState(false);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);

      // 1. Operational KPIs
      try {
        const { data } = await api.get('/dashboard/operational');
        if (data?.kpis) {
          setMetrics(prev => ({
            ...prev,
            pendingOrders: data.kpis.pendingOrders ?? prev.pendingOrders,
            incomingShipments: data.kpis.incomingShipments ?? prev.incomingShipments,
            productsRegistered: data.kpis.productsRegistered ?? prev.productsRegistered,
            activeBatches: data.kpis.activeBatches ?? prev.activeBatches,
            returnsPending: data.kpis.returnsPending ?? prev.returnsPending,
            waybillsToday: data.kpis.waybillsToday ?? prev.waybillsToday,
          }));
        }
      } catch (err) {
        console.warn('Operational dashboard API notice:', err);
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

  return (
    <div className="space-y-7">
      {/* ── Executive Hero Banner ─────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-slate-800"
      >
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational Logistics Control • Active
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <Sparkles className="w-6 h-6 text-amber-400" />
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Operational logistics terminal active. Manage incoming cargo shipments, BL numbers, container documents, tire barcode preparation, and product master encoding.
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
              to="/shipments/incoming"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white text-sm font-semibold shadow-lg shadow-teal-500/25 transition-all active:scale-95"
            >
              <Ship className="w-4 h-4" />
              New Shipment
            </Link>

            <Link
              to="/products/list"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-all border border-slate-700 active:scale-95"
            >
              <Package className="w-4 h-4 text-emerald-400" />
              Encode Products
            </Link>
          </div>
        </div>

        {/* Real-time Logistics Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0">
              <Ship className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Incoming Cargo</p>
              <p className="text-xs font-semibold text-teal-300 flex items-center gap-1.5 mt-0.5 truncate">
                {metrics.incomingShipments} En-route
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Registered (7 Days)</p>
              <p className="text-xs font-semibold text-emerald-400 mt-0.5 truncate">{metrics.productsRegistered} Products</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Active Batches</p>
              <p className="text-xs font-semibold text-purple-300 mt-0.5 truncate">{metrics.activeBatches} Active Lots</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Waybills Today</p>
              <p className="text-xs font-bold text-amber-400 mt-0.5 truncate">{metrics.waybillsToday} Dispatched</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Core Logistics KPIs ────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Incoming Shipments */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Incoming Shipments</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.incomingShipments}</span>
            <span className="inline-flex items-center text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
              In transit
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Cargo manifest records</span>
            <Link to="/shipments/incoming" className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-0.5">
              Shipments <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Pending Orders */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Orders</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.pendingOrders}</span>
            <span className="text-xs font-medium text-purple-600">Awaiting processing</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Operational order queue</span>
            <Link to="/orders" className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-0.5">
              View Orders <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Active Product Batches */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Batches</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.activeBatches}</span>
            <span className="text-xs font-medium text-emerald-600">Active lots</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Batch tracking active</span>
            <Link to="/batch-management" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-0.5">
              Batches <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Waybills Created Today */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Waybills Today</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.waybillsToday}</span>
            <span className="text-xs font-medium text-slate-500">Generated today</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span>Waybill document stream</span>
            <Link to="/waybill" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Waybills <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Cargo Intake & Interactive Workflow Guide ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cargo & Document Intake Overview (2 Cols) */}
        <motion.div variants={fadeUp} className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ship className="w-5 h-5 text-teal-600" />
                Shipment Cargo &amp; Document Intake Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Monitor incoming BL documents, container numbers, and expected arrival schedules</p>
            </div>
            <Link
              to="/shipments/schedule"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 self-start sm:self-auto"
            >
              Arrival Schedule <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-teal-100 bg-teal-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
                  <FileStack className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Bill of Lading &amp; Container Documents</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Encode supplier invoice, bill of lading (BL), and container details prior to dock arrival.
                  </p>
                </div>
              </div>
              <Link
                to="/shipments/documents"
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Encode Documents
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 mt-0.5">
                  <Barcode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Barcode Preparation &amp; Tag Pre-Allocation</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Prepare barcode series and tire tags for dock scanning before unloading begins.
                  </p>
                </div>
              </div>
              <Link
                to="/barcode/prepare"
                className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shrink-0 transition-colors shadow-sm text-center"
              >
                Prepare Barcodes
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Interactive Shipment Preparation Workflow (1 Col) */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-teal-600" />
                  Shipment Prep Workflow
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Sequential operational steps</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { step: '1', label: 'Create incoming shipment record', path: '/shipments/incoming', color: 'bg-teal-100 text-teal-700' },
                { step: '2', label: 'Encode BL number, container & packing list', path: '/shipments/documents', color: 'bg-purple-100 text-purple-700' },
                { step: '3', label: 'Encode product info & expected quantities', path: '/products/list', color: 'bg-emerald-100 text-emerald-700' },
                { step: '4', label: 'Prepare barcode info for shipment', path: '/barcode/prepare', color: 'bg-amber-100 text-amber-700' },
                { step: '5', label: 'Confirm arrival date in schedule', path: '/shipments/schedule', color: 'bg-blue-100 text-blue-700' },
              ].map((s) => (
                <Link key={s.step} to={s.path}>
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 hover:bg-teal-50 hover:border-teal-200 transition-colors">
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

      {/* ── Categorized Operational Launchpad ───────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Operational Toolsets &amp; Modules</h2>
            <p className="text-xs text-slate-500">Direct access to shipment, catalog, batch, and logistics tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Cargo Logistics */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-teal-200/80 bg-gradient-to-b from-teal-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cargo &amp; Shipments</h3>
                <p className="text-[11px] text-slate-500">Logistics &amp; arrivals</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-teal-100">
              <Link to="/shipments/incoming" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-100/60 hover:text-teal-900 transition-colors">
                <span className="flex items-center gap-2"><Ship className="w-4 h-4 text-teal-600" /> Incoming Shipments</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/shipments/documents" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-100/60 hover:text-teal-900 transition-colors">
                <span className="flex items-center gap-2"><FileStack className="w-4 h-4 text-teal-600" /> Shipment Documents</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/shipments/schedule" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-100/60 hover:text-teal-900 transition-colors">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-teal-600" /> Arrival Schedule</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Product Master Catalog */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product Intake</h3>
                <p className="text-[11px] text-slate-500">Encoding &amp; expected stock</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              <Link to="/products/list" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-emerald-600" /> Products Master</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/expected-inventory" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ListChecks className="w-4 h-4 text-emerald-600" /> Expected Inventory</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/suppliers" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-600" /> Suppliers</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Barcode & Label Rules */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Barcode &amp; Labeling</h3>
                <p className="text-[11px] text-slate-500">Tire tagging &amp; series</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <Link to="/barcode/prepare" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Barcode className="w-4 h-4 text-purple-600" /> Barcode Preparation</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/barcode/config" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Barcode className="w-4 h-4 text-purple-600" /> Barcode Rules Studio</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Batch & Dispatch Logistics */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batch &amp; Dispatch</h3>
                <p className="text-[11px] text-slate-500">Waybills &amp; packing slips</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-amber-100">
              <Link to="/batch-management" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-amber-600" /> Batch Management</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/waybill" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-amber-600" /> Waybill Generator</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/packing-slip" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-100/60 hover:text-amber-900 transition-colors">
                <span className="flex items-center gap-2"><FileStack className="w-4 h-4 text-amber-600" /> Packing Slips</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live Operational Stream ────────────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Live Cargo &amp; Operational Stream
            </h2>
            <p className="text-xs text-slate-500">Real-time log of shipment registrations, barcode prep, and product encoding</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Operational events will appear here</p>
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
                      <span className="text-xs font-bold text-slate-800">{log.action || 'operational.event'}</span>
                      <span className="text-[11px] text-slate-400">• {log.user || 'Operational Staff'}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.details || 'Logistics update logged'}</p>
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
