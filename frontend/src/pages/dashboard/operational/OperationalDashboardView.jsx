import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, Ship, Barcode, ClipboardList, Activity, RefreshCw,
  CheckCircle, Clock, AlertTriangle, TrendingUp, ArrowRight, ChevronRight,
  PackageCheck, PackageOpen, Boxes, FileText, QrCode, Tags, Layers,
  Calendar, ListChecks, FileStack, MapPin, Navigation, Zap, Bell,
  ShoppingCart, RotateCcw, Search, ScanBarcode, BookOpen, Settings
} from 'lucide-react';
import api from '../../../services/api.js';

// Motion variants
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

export default function OperationalDashboardView({ name = 'Operator' }) {
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

  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActionModal, setQuickActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionSubmitted, setActionSubmitted] = useState(false);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const { data } = await api.get('/dashboard/operational');
      
      if (data?.kpis) {
        setMetrics({
          pendingOrders: data.kpis.pendingOrders ?? 0,
          incomingShipments: data.kpis.incomingShipments ?? 0,
          productsRegistered: data.kpis.productsRegistered ?? 0,
          activeBatches: data.kpis.activeBatches ?? 0,
          returnsPending: data.kpis.returnsPending ?? 0,
          waybillsToday: data.kpis.waybillsToday ?? 0,
        });
      }

      if (data?.recentActivity) {
        setRecentActivity(data.recentActivity);
      }
    } catch (error) {
      console.warn('Operational dashboard API notice:', error);
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

  return (
    <div className="space-y-7">
      {/* ── Executive Hero Banner ─────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-900 p-6 sm:p-8 text-white shadow-xl border border-teal-800"
      >
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-12 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-teal-200 border border-white/15 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Operational Logistics Hub • Systems Online
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Welcome back, {name}
              <Ship className="w-6 h-6 text-teal-400" />
            </h1>
            <p className="text-teal-200 text-sm max-w-2xl leading-relaxed">
              Central command for shipment logistics, product registration, batch management, and waybill generation. Monitor incoming cargo and coordinate warehouse intake operations.
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
              Process Shipment
            </Link>

            <button
              onClick={() => handleQuickAction('waybill')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-teal-200 text-sm font-medium transition-all border border-teal-700 active:scale-95"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              Quick Waybill
            </button>
          </div>
        </div>

        {/* Real-time Status Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-900/80 border border-teal-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
              <Ship className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Pending Shipments</p>
              <p className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mt-0.5 truncate">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                {metrics.incomingShipments} incoming
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-900/80 border border-teal-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Products Registered</p>
              <p className="text-xs font-semibold text-teal-100 mt-0.5 truncate">{metrics.productsRegistered} this week</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-900/80 border border-teal-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300 shrink-0">
              <Boxes className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Active Batches</p>
              <p className="text-xs font-semibold text-purple-300 mt-0.5 truncate">{metrics.activeBatches} in progress</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-900/80 border border-teal-700/60 backdrop-blur-md shadow-sm">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Waybills Today</p>
              <p className="text-xs font-bold text-emerald-300 mt-0.5 truncate">{metrics.waybillsToday} generated</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Core Logistics KPIs ────────────────────────────────────── */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Pending Shipments */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Shipments</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.incomingShipments}</span>
            <span className="text-xs font-medium text-slate-500">To process</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-amber-600 font-medium">Intake queue</span>
            <Link to="/shipments/incoming" className="text-amber-600 hover:text-amber-700 font-medium inline-flex items-center gap-0.5">
              Process <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Products Registered */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Products Registered</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.productsRegistered}</span>
            <span className="text-xs font-medium text-slate-500">This week</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-blue-600 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Catalog growth
            </span>
            <Link to="/products/register" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-0.5">
              Register <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Active Batches */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Batches</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.activeBatches}</span>
            <span className="text-xs font-medium text-slate-500">In progress</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-purple-600 font-medium">Batch tracking</span>
            <Link to="/batches" className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center gap-0.5">
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Waybills Generated */}
        <motion.div variants={fadeUp} className="group relative rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 hover:shadow-md transition-all hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Waybills Today</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{metrics.waybillsToday}</span>
            <span className="text-xs font-medium text-slate-500">Generated</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
            <span className="text-emerald-600 font-medium">Shipping docs</span>
            <Link to="/waybills" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-0.5">
              View <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Middle Section: Shipment Status & Workflow ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipment Intake Status Breakdown */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Ship className="w-5 h-5 text-teal-600" />
                Shipment Intake Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Current cargo processing pipeline overview</p>
            </div>
            <Link to="/shipments" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Incoming Shipments</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                  {metrics.incomingShipments} pending
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Cargo en route or arrived at dock awaiting initial receiving scan</p>
              <Link to="/shipments/incoming" className="text-xs font-semibold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1">
                Start Receiving <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Active Batches</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  {metrics.activeBatches} batches
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Product batches currently being processed, inspected, or allocated</p>
              <Link to="/batches" className="text-xs font-semibold text-purple-700 hover:text-purple-800 inline-flex items-center gap-1">
                Manage Batches <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-800">Returns Pending</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  {metrics.returnsPending} items
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-3">Customer returns awaiting inspection and restocking decision</p>
              <Link to="/returns" className="text-xs font-semibold text-red-700 hover:text-red-800 inline-flex items-center gap-1">
                Process Returns <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Interactive Shipment Preparation Workflow */}
        <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-blue-600" />
                Shipment Preparation Workflow
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Step-by-step operational logistics guide</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Receive Incoming Cargo</h3>
                <p className="text-xs text-slate-600 mt-1">Scan shipment waybill, verify contents, update system status to "Received"</p>
                <Link to="/shipments/incoming" className="text-xs font-semibold text-teal-600 hover:text-teal-700 inline-flex items-center gap-1 mt-2">
                  Start Receiving <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Register Products &amp; Generate Labels</h3>
                <p className="text-xs text-slate-600 mt-1">Add tire SKUs to catalog, assign barcodes, print location labels</p>
                <Link to="/products/register" className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 mt-2">
                  Register Products <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Create Batches &amp; Coordinate Storage</h3>
                <p className="text-xs text-slate-600 mt-1">Organize products into batches, assign warehouse locations, notify floor staff</p>
                <Link to="/batches/create" className="text-xs font-semibold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 mt-2">
                  Create Batch <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-slate-800">Generate Waybills &amp; Documentation</h3>
                <p className="text-xs text-slate-600 mt-1">Print shipping manifests, internal transfer documents, and QC certificates</p>
                <Link to="/waybills/generate" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 mt-2">
                  Generate Waybill <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Categorized Operational Launchpad ─────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Operational Logistics Modules</h2>
            <p className="text-xs text-slate-500">Direct access to shipment processing, catalog management, and workflow tools</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Shipment & Cargo Logistics */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-teal-200/80 bg-gradient-to-b from-teal-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-md shadow-teal-500/20">
                <Ship className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Shipment &amp; Cargo</h3>
                <p className="text-[11px] text-slate-500">Logistics &amp; intake</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-teal-100">
              <Link to="/shipments/incoming" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-100/60 hover:text-teal-900 transition-colors">
                <span className="flex items-center gap-2"><Ship className="w-4 h-4 text-teal-600" /> Incoming Shipments</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/shipments" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-100/60 hover:text-teal-900 transition-colors">
                <span className="flex items-center gap-2"><PackageOpen className="w-4 h-4 text-teal-600" /> All Shipments</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/returns" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-100/60 hover:text-teal-900 transition-colors">
                <span className="flex items-center gap-2"><RotateCcw className="w-4 h-4 text-teal-600" /> Process Returns</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Product Catalog & Intake */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Product Catalog</h3>
                <p className="text-[11px] text-slate-500">Registration &amp; intake</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-blue-100">
              <Link to="/products/register" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Package className="w-4 h-4 text-blue-600" /> Register Products</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/products" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-600" /> Master Catalog</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/products/search" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-blue-100/60 hover:text-blue-900 transition-colors">
                <span className="flex items-center gap-2"><Search className="w-4 h-4 text-blue-600" /> Product Lookup</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Barcode & Label Management */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
                <Barcode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Barcode &amp; Labels</h3>
                <p className="text-[11px] text-slate-500">Scanning &amp; printing</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-purple-100">
              <Link to="/barcode/generate" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><QrCode className="w-4 h-4 text-purple-600" /> Generate Barcodes</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/barcode/scan" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><ScanBarcode className="w-4 h-4 text-purple-600" /> Scan Products</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/barcode/labels" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-purple-100/60 hover:text-purple-900 transition-colors">
                <span className="flex items-center gap-2"><Tags className="w-4 h-4 text-purple-600" /> Print Labels</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>

          {/* Batch & Order Logistics */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Batch &amp; Orders</h3>
                <p className="text-[11px] text-slate-500">Management &amp; docs</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-emerald-100">
              <Link to="/batches" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><Boxes className="w-4 h-4 text-emerald-600" /> Manage Batches</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/waybills" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-600" /> Waybills &amp; Docs</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
              <Link to="/orders" className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors">
                <span className="flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-emerald-600" /> Order Processing</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Live Operational Activity Stream ──────────────────────── */}
      <motion.div variants={fadeUp} className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600" />
              Live Operational Activity
            </h2>
            <p className="text-xs text-slate-500">Real-time shipment processing and logistics events</p>
          </div>
          <Link to="/activity" className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1">
            Full Activity Log <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.length === 0 ? (
            <div className="py-8 text-center">
              <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-600">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">Operational events will appear here</p>
            </div>
          ) : (
            recentActivity.slice(0, 8).map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-teal-100 text-teal-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{log.action || 'operational.event'}</span>
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
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Quick Waybill Generator</h3>
                    <p className="text-xs text-slate-500">Generate shipping documentation instantly</p>
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
                  <h4 className="text-sm font-bold text-slate-900">Waybill Generated!</h4>
                  <p className="text-xs text-slate-500">Document is ready for printing and distribution.</p>
                </div>
              ) : (
                <form onSubmit={handleActionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Shipment Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., SHP-2024-001234"
                      className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                      required
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
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
                    >
                      Generate Waybill
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
