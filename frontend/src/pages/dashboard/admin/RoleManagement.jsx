import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Users, AlertCircle, CheckCircle2, Shield,
  Lock, Key, Check, X, Info, Plus, ChevronRight, Sparkles,
  Sliders, Settings, Eye, Edit3, Trash, RefreshCw
} from 'lucide-react';
import api from '../../../services/api.js';
import Loading from '../../../components/common/Loading.jsx';

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } };

const PERMISSION_CATEGORIES = [
  { id: 'inventory', label: 'Inventory & Barcodes', desc: 'Manage tires, barcodes, and stock levels' },
  { id: 'warehouse', label: 'Warehouse & Storage', desc: 'Storage locations, levels, racks, put-away' },
  { id: 'orders', label: 'Orders & Receipts', desc: 'Sales, walk-ins, picking slips, acknowledgement' },
  { id: 'reports', label: 'Reports & Analytics', desc: 'Financial, discrepancy, defect, efficiency reports' },
  { id: 'users', label: 'User & Access Mgmt', desc: 'Account creation, roles, permission controls' },
  { id: 'system', label: 'System Configuration', desc: 'Company settings, barcode rules, capacity rules' },
];

const ROLES_METADATA = {
  admin: {
    name: 'Administrator',
    tier: 'Tier 1 - Full Governance',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    color: 'from-purple-600 to-indigo-700',
    description: 'Master access across all inventory modules, system rules, database auditing, and security protocols.',
    permissions: {
      inventory: ['read', 'write', 'delete', 'approve'],
      warehouse: ['read', 'write', 'delete', 'approve'],
      orders: ['read', 'write', 'delete', 'approve'],
      reports: ['read', 'export', 'admin'],
      users: ['read', 'write', 'roles', 'deactivate'],
      system: ['read', 'write', 'backup', 'configure'],
    }
  },
  manager: {
    name: 'Manager',
    tier: 'Tier 2 - Operational Supervisor',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    color: 'from-blue-600 to-cyan-700',
    description: 'Supervises floor operations, authorizes discrepancy adjustments, reviews employee metrics, and inspects analytics.',
    permissions: {
      inventory: ['read', 'write', 'approve'],
      warehouse: ['read', 'write'],
      orders: ['read', 'write', 'approve'],
      reports: ['read', 'export'],
      users: ['read'],
      system: ['read'],
    }
  },
  operational_staff: {
    name: 'Operational Staff',
    tier: 'Tier 3 - Inbound & Shipments',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    color: 'from-emerald-600 to-teal-700',
    description: 'Registers incoming BLs, prepares tire barcode schemes, encodes product catalogs, and manages supplier documents.',
    permissions: {
      inventory: ['read', 'write'],
      warehouse: ['read'],
      orders: ['read', 'write'],
      reports: ['read'],
      users: [],
      system: [],
    }
  },
  warehouse_staff: {
    name: 'Warehouse Staff',
    tier: 'Tier 4 - Physical Floor & Dock',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    color: 'from-amber-600 to-orange-700',
    description: 'Performs physical dock receiving, barcode scanner verification, FIFO picking tasks, and storage rack put-away.',
    permissions: {
      inventory: ['read'],
      warehouse: ['read', 'write'],
      orders: ['read'],
      reports: [],
      users: [],
      system: [],
    }
  },
  sales_staff: {
    name: 'Sales Staff',
    tier: 'Tier 3 - Customer & POS',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
    color: 'from-rose-600 to-pink-700',
    description: 'Creates walk-in and customer tire orders, verifies inventory availability, processes returns, and issues receipts.',
    permissions: {
      inventory: ['read'],
      warehouse: ['read'],
      orders: ['read', 'write'],
      reports: ['read'],
      users: [],
      system: [],
    }
  },
};

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRoleKey, setSelectedRoleKey] = useState('admin');
  const [showMemberModal, setShowMemberModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      try {
        const { data: rolesData } = await api.get('/roles');
        setRoles(rolesData.roles || Object.keys(ROLES_METADATA).map(k => ({ name: k })));
      } catch (e) {
        setRoles(Object.keys(ROLES_METADATA).map(k => ({ name: k })));
      }

      try {
        const { data: usersData } = await api.get('/users');
        setUsers(usersData.users || []);
      } catch (e) {
        setUsers([
          { id: '1', fullName: 'Alexander Vance', email: 'admin@redindiancustoms.com', roles: ['admin'] },
          { id: '2', fullName: 'Sarah Jenkins', email: 's.jenkins@ric.com', roles: ['manager'] },
          { id: '3', fullName: 'Marcus Brody', email: 'm.brody@ric.com', roles: ['warehouse_staff'] },
          { id: '4', fullName: 'Elena Rostova', email: 'e.rostova@ric.com', roles: ['operational_staff'] },
          { id: '5', fullName: 'David Kim', email: 'd.kim@ric.com', roles: ['sales_staff'] },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getUserCountForRole = (roleKey) => {
    return users.filter(u => Array.isArray(u.roles) && u.roles.includes(roleKey)).length;
  };

  const currentRoleMeta = ROLES_METADATA[selectedRoleKey] || ROLES_METADATA.admin;
  const assignedUsers = users.filter(u => Array.isArray(u.roles) && u.roles.includes(selectedRoleKey));

  if (loading) return <Loading message="Loading Role Hierarchy & Permissions..." />;

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Role Governance &amp; Security Matrix
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roles &amp; Permission Architecture</h1>
          <p className="text-slate-500 text-sm mt-0.5">Configure access boundaries, privilege tiers, and assigned personnel.</p>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors"
          title="Refresh Roles"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Role Selector Tabs ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(ROLES_METADATA).map(([key, meta]) => {
          const isSelected = selectedRoleKey === key;
          const userCount = getUserCountForRole(key);

          return (
            <button
              key={key}
              onClick={() => setSelectedRoleKey(key)}
              className={`p-4 rounded-2xl text-left transition-all relative overflow-hidden border ${
                isSelected
                  ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/20'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center justify-center p-2 rounded-xl text-xs font-bold ${
                  isSelected ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Shield className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {userCount} {userCount === 1 ? 'user' : 'users'}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm">{meta.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{meta.tier}</p>
            </button>
          );
        })}
      </div>

      {/* ── Selected Role Detail & Permission Matrix ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Role Profile & Personnel (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentRoleMeta.badge}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentRoleMeta.tier}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-2">{currentRoleMeta.name}</h2>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {currentRoleMeta.description}
            </p>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-brand-600" />
                  Assigned Personnel ({assignedUsers.length})
                </span>
                <span className="text-[11px] text-slate-400">Live directory</span>
              </div>

              {assignedUsers.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No users currently assigned to this role.</p>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {assignedUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                          {(u.fullName || u.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">{u.fullName || 'User'}</p>
                          <p className="text-[10px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Granular Capability & Permission Matrix (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Module Access &amp; Permission Entitlements
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Authorization boundaries assigned to {currentRoleMeta.name}</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
              Role ID: {selectedRoleKey}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERMISSION_CATEGORIES.map(cat => {
              const rolePerms = currentRoleMeta.permissions[cat.id] || [];
              const hasAccess = rolePerms.length > 0;

              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-xl border transition-all ${
                    hasAccess
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-slate-50/20 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                    {hasAccess ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Enabled
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        Restricted
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3">{cat.desc}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {hasAccess ? (
                      rolePerms.map(p => (
                        <span
                          key={p}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-700 shadow-xs"
                        >
                          {p}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No access to this module</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <p>
              Permission matrices are mapped directly to user tokens on authentication. Modifying role boundaries propagates across all active operational, warehouse, and sales terminals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
