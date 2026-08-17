import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PackageCheck,
  Boxes,
  Warehouse,
  ShoppingCart,
  ClipboardCheck,
  RotateCcw,
  BarChart3,
  FileWarning,
  AlertTriangle,
  Users,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import logo from '../../Image/logo.jpg';
import { useAuth } from '../../hooks/useAuth';

const NAVIGATION = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['admin', 'manager', 'operational_staff', 'warehouse_staff', 'sales_staff'],
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    type: 'section',
    items: [
      { 
        id: 'receiving', 
        label: 'Receiving & Inspection', 
        icon: PackageCheck, 
        path: '/receiving',
        roles: ['warehouse_staff']
      },
      { 
        id: 'inventory', 
        label: 'Inventory', 
        icon: Boxes, 
        path: '/inventory',
        roles: ['admin', 'manager', 'operational_staff']
      },
      { 
        id: 'warehouse', 
        label: 'Warehouse Locations', 
        icon: Warehouse, 
        path: '/warehouse',
        roles: ['admin', 'manager', 'operational_staff', 'warehouse_staff']
      },
      { 
        id: 'orders', 
        label: 'Orders', 
        icon: ShoppingCart, 
        path: '/orders',
        roles: ['operational_staff', 'sales_staff', 'manager']
      },
      { 
        id: 'picking', 
        label: 'Picking & Packing', 
        icon: ClipboardCheck, 
        path: '/picking',
        roles: ['warehouse_staff']
      },
      { 
        id: 'returns', 
        label: 'Returns', 
        icon: RotateCcw, 
        path: '/returns',
        roles: ['operational_staff', 'sales_staff', 'warehouse_staff']
      },
    ],
  },
  {
    id: 'reports',
    label: 'REPORTS',
    type: 'section',
    items: [
      { 
        id: 'reports-main', 
        label: 'All Reports', 
        icon: BarChart3, 
        path: '/reports',
        roles: ['manager', 'admin']
      },
      { 
        id: 'discrepancy', 
        label: 'Discrepancy Reports', 
        icon: FileWarning, 
        path: '/reports/discrepancies',
        roles: ['manager', 'admin']
      },
      { 
        id: 'defects', 
        label: 'Defect Reports', 
        icon: AlertTriangle, 
        path: '/reports/defects',
        roles: ['manager', 'admin']
      },
    ],
  },
  {
    id: 'management',
    label: 'MANAGEMENT',
    type: 'section',
    items: [
      { 
        id: 'users', 
        label: 'Users & Employees', 
        icon: Users, 
        path: '/users',
        roles: ['admin']
      },
      { 
        id: 'suppliers', 
        label: 'Suppliers', 
        icon: Truck, 
        path: '/suppliers',
        roles: ['admin', 'manager', 'operational_staff']
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings, 
        path: '/settings',
        roles: ['admin']
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { hasRole } = useAuth();
  const [expandedSections, setExpandedSections] = useState(['operations', 'reports', 'management']);

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const isActive = (path) => location.pathname === path;

  // Filter navigation items based on user roles
  const filterNavByRole = (items) => {
    return items.filter(item => {
      if (!item.roles) return true; // Show items without role restrictions
      return item.roles.some(role => hasRole(role));
    });
  };

  const filteredNavigation = NAVIGATION.map(item => {
    if (item.type === 'section') {
      const filteredItems = filterNavByRole(item.items);
      // Only show section if it has visible items
      return filteredItems.length > 0 ? { ...item, items: filteredItems } : null;
    }
    // Check if user has permission for top-level items
    if (item.roles && !item.roles.some(role => hasRole(role))) {
      return null;
    }
    return item;
  }).filter(Boolean); // Remove null items

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Inventory Management</h1>
            <p className="text-xs text-slate-500">Warehouse Operations</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {filteredNavigation.map((item) => {
            if (item.type === 'section') {
              const isExpanded = expandedSections.includes(item.id);
              return (
                <div key={item.id} className="mb-4">
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                  >
                    {item.label}
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              isActive(subItem.path)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <subItem.icon size={18} />
                            <span>{subItem.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-50 lg:hidden overflow-y-auto"
            >
              {/* Logo */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200">
                  <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-slate-900">Inventory Management</h1>
                  <p className="text-xs text-slate-500">Warehouse Operations</p>
                </div>
              </div>

              {/* Navigation - Same as desktop */}
              <nav className="py-4 px-3">
                {filteredNavigation.map((item) => {
                  if (item.type === 'section') {
                    const isExpanded = expandedSections.includes(item.id);
                    return (
                      <div key={item.id} className="mb-4">
                        <button
                          onClick={() => toggleSection(item.id)}
                          className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors"
                        >
                          {item.label}
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        {isExpanded && (
                          <div className="mt-1">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.id}
                                to={subItem.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  isActive(subItem.path)
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <subItem.icon size={18} />
                                <span>{subItem.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                        isActive(item.path)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
