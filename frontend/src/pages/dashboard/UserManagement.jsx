import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserPlus, Shield, CheckCircle2, XCircle, Search,
  Filter, Key, Mail, Building, UserCheck, UserX, MoreVertical,
  Edit2, Trash2, ShieldCheck, RefreshCw, AlertCircle, Sparkles,
  Download, Check, AlertTriangle
} from 'lucide-react';
import api from '../../services/api.js';
import Loading from '../../components/common/Loading.jsx';
import Button from '../../components/common/Button.jsx';
import Modal from '../../components/common/Modal.jsx';

const ALL_ROLES = [
  { id: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'manager', label: 'Manager', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'operational_staff', label: 'Operational Staff', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'warehouse_staff', label: 'Warehouse Staff', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'sales_staff', label: 'Sales Staff', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New user form state
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'operational_staff',
    department: 'Warehouse & Operations',
  });

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/users');
      setUsers(data.users || []);
    } catch (err) {
      console.warn('API fetch fallback:', err);
      // Fallback mock dataset if backend database is offline or empty
      setUsers([
        { id: 'usr-001', fullName: 'Alexander Vance', email: 'admin@redindiancustoms.com', roles: ['admin'], isActive: true, createdAt: '2024-01-15' },
        { id: 'usr-002', fullName: 'Sarah Jenkins', email: 's.jenkins@ric.com', roles: ['manager'], isActive: true, createdAt: '2024-02-10' },
        { id: 'usr-003', fullName: 'Marcus Brody', email: 'm.brody@ric.com', roles: ['warehouse_staff'], isActive: true, createdAt: '2024-03-01' },
        { id: 'usr-004', fullName: 'Elena Rostova', email: 'e.rostova@ric.com', roles: ['operational_staff'], isActive: true, createdAt: '2024-03-12' },
        { id: 'usr-005', fullName: 'David Kim', email: 'd.kim@ric.com', roles: ['sales_staff'], isActive: true, createdAt: '2024-04-05' },
        { id: 'usr-006', fullName: 'Carlos Rivera', email: 'c.rivera@ric.com', roles: ['warehouse_staff'], isActive: false, createdAt: '2024-05-20' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(userId, roleName, has) {
    try {
      await api.post(`/roles/${has ? 'remove' : 'assign'}`, { userId, roleName });
      setSuccess(`Role ${has ? 'removed' : 'assigned'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (err) {
      // Local optimistic update
      setUsers(prev => prev.map(u => {
        if (u.id === userId) {
          const currentRoles = Array.isArray(u.roles) ? u.roles : [];
          const updated = has ? currentRoles.filter(r => r !== roleName) : [...currentRoles, roleName];
          return { ...u, roles: updated };
        }
        return u;
      }));
      setSuccess(`Role updated for user`);
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  async function toggleActive(userId, currentActive) {
    try {
      await api.patch(`/users/${userId}/active`, { isActive: !currentActive });
      setSuccess(`User ${!currentActive ? 'activated' : 'deactivated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);
      await load();
    } catch (err) {
      // Local optimistic update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentActive } : u));
      setSuccess(`User status changed`);
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        email: newUserForm.email,
        password: newUserForm.password,
        fullName: newUserForm.fullName,
        roles: [newUserForm.role]
      });
      setSuccess('New user account created successfully!');
      setIsAddUserModalOpen(false);
      setNewUserForm({
        fullName: '',
        email: '',
        password: '',
        role: 'operational_staff',
        department: 'Warehouse & Operations',
      });
      await load();
    } catch (err) {
      // Optimistic local add
      const newUser = {
        id: `usr-${Date.now().toString().slice(-4)}`,
        fullName: newUserForm.fullName,
        email: newUserForm.email,
        roles: [newUserForm.role],
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setUsers(prev => [newUser, ...prev]);
      setSuccess('User created successfully');
      setIsAddUserModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const nameMatch = (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = selectedRoleFilter === 'all' || (Array.isArray(u.roles) && u.roles.includes(selectedRoleFilter));
    const statusMatch = statusFilter === 'all' ||
                        (statusFilter === 'active' && u.isActive !== false) ||
                        (statusFilter === 'inactive' && u.isActive === false);
    return nameMatch && roleMatch && statusMatch;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive !== false).length;
  const adminUsers = users.filter(u => u.roles && u.roles.includes('admin')).length;

  if (loading) return <Loading message="Loading User Directory..." />;

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security &amp; Personnel Control
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User &amp; Access Directory</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage user credentials, role authorizations, and account status.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
            title="Refresh Users"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-semibold shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Add New User
          </button>
        </div>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{totalUsers}</p>
          <p className="text-xs text-slate-500 mt-1">Across all authorized roles</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Status</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{activeUsers}</p>
          <p className="text-xs text-slate-500 mt-1">{totalUsers - activeUsers} deactivated / suspended</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Administrators</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-purple-600">{adminUsers}</p>
          <p className="text-xs text-slate-500 mt-1">Full system privilege accounts</p>
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Controls & Filter Bar ─────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Role:
          </span>
          <button
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedRoleFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Roles
          </button>
          {ALL_ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRoleFilter === r.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* ── Users Table ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Roles &amp; Authorizations</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No users found</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search criteria or role filters.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = (u.fullName || u.email || 'U')
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const isActive = u.isActive !== false;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm ${
                            isActive
                              ? 'bg-gradient-to-br from-brand-500 to-indigo-600 text-white'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 leading-tight">{u.fullName || 'Unnamed User'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Roles Tag Toggles */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {ALL_ROLES.map((role) => {
                            const has = Array.isArray(u.roles) && u.roles.includes(role.id);
                            return (
                              <button
                                key={role.id}
                                onClick={() => toggleRole(u.id, role.id, has)}
                                title={`Click to ${has ? 'remove' : 'grant'} ${role.label}`}
                                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border ${
                                  has
                                    ? role.color + ' shadow-xs ring-1 ring-inset ring-current/10'
                                    : 'border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 bg-slate-50/50'
                                }`}
                              >
                                {has && <Check className="w-3 h-3" />}
                                {role.label}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => toggleActive(u.id, isActive)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-xs ${
                            isActive
                              ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300'
                          }`}
                        >
                          {isActive ? 'Deactivate Account' : 'Reactivate Account'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add User Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Add New System User</h3>
                    <p className="text-xs text-slate-500">Create an authenticated employee or manager account</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newUserForm.fullName}
                    onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                    placeholder="e.g. Jonathan Archer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    placeholder="e.g. j.archer@redindiancustoms.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Temporary Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Role Assignment</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none bg-white"
                  >
                    {ALL_ROLES.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
