import React from 'react';
import { motion } from 'framer-motion';
import KpiCard from '../../components/dashboard/KpiCard';
import StatusBadge from '../../components/dashboard/StatusBadge';
import {
  Boxes,
  AlertTriangle,
  PackageCheck,
  ShoppingCart,
  RotateCcw,
  AlertCircle,
  TrendingUp,
  Package,
  Clock,
} from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Dashboard() {
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Mock data - replace with actual API data
  const kpiData = [
    {
      title: 'Total Inventory',
      value: '24,850',
      subtitle: 'Units in stock',
      icon: Boxes,
      trend: '+8.4%',
      variant: 'blue',
    },
    {
      title: 'Low Stock',
      value: '128',
      subtitle: 'Products requiring attention',
      icon: AlertTriangle,
      trend: '+12',
      variant: 'orange',
    },
    {
      title: 'Pending Receiving',
      value: '14',
      subtitle: 'Shipments awaiting inspection',
      icon: PackageCheck,
      trend: null,
      variant: 'purple',
    },
    {
      title: 'Pending Orders',
      value: '86',
      subtitle: 'Orders awaiting fulfillment',
      icon: ShoppingCart,
      trend: '+23',
      variant: 'blue',
    },
    {
      title: 'Returned Items',
      value: '23',
      subtitle: 'Items requiring inspection',
      icon: RotateCcw,
      trend: null,
      variant: 'orange',
    },
    {
      title: 'Defective Items',
      value: '17',
      subtitle: 'Items awaiting resolution',
      icon: AlertCircle,
      trend: '-5',
      variant: 'red',
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      time: '08:42 AM',
      user: 'Maria Santos',
      action: 'received shipment',
      reference: 'Container: CNTR-2026-0812',
      status: 'approved',
    },
    {
      id: 2,
      time: '08:21 AM',
      user: 'John Cruz',
      action: 'updated inventory',
      reference: 'Batch: AUG-2026-CNTR01',
      status: 'completed',
    },
    {
      id: 3,
      time: '07:55 AM',
      user: 'System',
      action: 'Order #ORD-20260814-0012 packed',
      reference: 'Ready for release',
      status: 'ready',
    },
    {
      id: 4,
      time: '07:32 AM',
      user: 'Maria Santos',
      action: 'created defect report',
      reference: 'Batch: AUG-2026-CNTR02',
      status: 'pending',
    },
  ];

  // Mock alerts
  const criticalAlerts = [
    { id: 1, type: 'warning', message: '12 shipments have quantity discrepancies' },
    { id: 2, type: 'warning', message: '128 products are low in stock' },
    { id: 3, type: 'danger', message: '17 defective items require action' },
  ];

  return (
    <>
      {/* Welcome Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Good morning, Maria.
        </h2>
        <p className="text-slate-600">
          Here's what's happening with your inventory today.
        </p>
        <p className="text-sm text-slate-500 mt-1">{currentDate}</p>
      </motion.div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Attention Required</h3>
                <ul className="space-y-1">
                  {criticalAlerts.map((alert) => (
                    <li key={alert.id} className="text-sm text-amber-800">
                      ⚠ {alert.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
      >
        {kpiData.map((kpi, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Overview */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Inventory Overview</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>

          {/* Stock Status Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Healthy Stock</span>
                <span className="text-sm font-bold text-emerald-600">82%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Low Stock</span>
                <span className="text-sm font-bold text-amber-600">12%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Out of Stock</span>
                <span className="text-sm font-bold text-red-600">4%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Defective</span>
                <span className="text-sm font-bold text-slate-600">2%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 rounded-full" style={{ width: '2%' }} />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg mx-auto mb-2">
                <Package size={20} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">24,850</p>
              <p className="text-xs text-slate-500">Total Stock</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-50 rounded-lg mx-auto mb-2">
                <TrendingUp size={20} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">20,402</p>
              <p className="text-xs text-slate-500">Available</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 bg-purple-50 rounded-lg mx-auto mb-2">
                <Clock size={20} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">4,448</p>
              <p className="text-xs text-slate-500">Reserved</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl border border-slate-200 p-6"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activities</h3>

          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1">{activity.time}</p>
                  <p className="text-sm text-slate-900 font-medium">
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">{activity.reference}</p>
                  <div className="mt-2">
                    <StatusBadge status={activity.status} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 pt-4 border-t border-slate-200 text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All Activities
          </button>
        </motion.div>
      </div>
    </>
  );
}
