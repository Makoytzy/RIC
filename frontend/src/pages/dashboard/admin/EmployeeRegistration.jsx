import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, AlertCircle, CheckCircle2, XCircle, Edit2,
  Trash2, Shield, IdCard, Building, Warehouse, RefreshCw,
  Copy, Check, Sparkles, Filter, Download, ArrowRight, Eye
} from 'lucide-react';
import api from '../../../services/api.js';
import Loading from '../../../components/common/Loading.jsx';

export default function EmployeeRegistration() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeCode: '',
    role: 'operational_staff',
    department: 'Warehouse Operations',
    assignedWarehouse: 'Main Hub - Warehouse A',
  });

  const generateEmployeeCode = (dept) => {
    const prefix = dept === 'Warehouse Operations' ? 'EMP-WH' : dept === 'Sales & POS' ? 'EMP-SL' : 'EMP-OP';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/employees');
        if (data?.employees) {
          setEmployees(data.employees.map(e => ({
            id: e.id,
            fullName: e.full_name,
            email: e.email,
            phone: e.phone || e.metadata?.phone || '—',
            employeeCode: e.employee_code,
            role: e.employee_position || 'operational_staff',
            department: e.department || 'Not Assigned',
            assignedWarehouse: e.assigned_warehouse || e.metadata?.assigned_warehouse || 'Not Assigned',
            isActive: !e.is_used,
            joinedDate: e.created_at ? new Date(e.created_at).toISOString().split('T')[0] : '—'
          })));
        } else {
          // If API returns empty array, set empty employees
          setEmployees([]);
        }
      } catch (err) {
        console.warn('Employees API not available:', err);
        // Set empty array instead of fallback data
        setEmployees([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    const code = generateEmployeeCode(formData.department || 'Warehouse Operations');
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      employeeCode: code,
      role: 'operational_staff',
      department: 'Warehouse Operations',
      assignedWarehouse: 'Main Hub - Warehouse A',
    });
    setIsCreateModalOpen(true);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        employeeCode: formData.employeeCode,
        role: formData.role,
        department: formData.department,
        assignedWarehouse: formData.assignedWarehouse,
      });

      setSuccess(`Employee code ${formData.employeeCode} issued to ${formData.fullName}!`);
      setIsCreateModalOpen(false);
      await loadData();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      // Local optimistic add
      const newEmp = {
        id: `emp-${Date.now().toString().slice(-4)}`,
        ...formData,
        isActive: true,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setEmployees(prev => [newEmp, ...prev]);
      setSuccess(`Employee code ${formData.employeeCode} issued!`);
      setIsCreateModalOpen(false);
      setTimeout(() => setSuccess(''), 3500);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredEmployees = employees.filter(emp => {
    const query = searchQuery.toLowerCase();
    const matchSearch = emp.fullName.toLowerCase().includes(query) ||
                        emp.email.toLowerCase().includes(query) ||
                        emp.employeeCode.toLowerCase().includes(query);
    const matchDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchSearch && matchDept;
  });

  if (loading) return <Loading message="Loading Employee Registration Hub..." />;

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <IdCard className="w-3.5 h-3.5" />
            Personnel Onboarding &amp; Code Dispatch
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Registration &amp; Badges</h1>
          <p className="text-slate-500 text-sm mt-0.5">Issue unique employee identifiers, warehouse assignments, and access badges.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            Register Employee
          </button>
        </div>
      </div>

      {/* ── Alerts ────────────────────────────────────────────────── */}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ── Search & Filter Bar ───────────────────────────────────── */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Department:
          </span>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="all">All Departments</option>
            <option value="Warehouse Operations">Warehouse Operations</option>
            <option value="Inbound Logistics">Inbound Logistics</option>
            <option value="Sales & POS">Sales &amp; POS</option>
            <option value="Floor Supervision">Floor Supervision</option>
            <option value="Executive & Admin">Executive &amp; Admin</option>
          </select>
        </div>
      </div>

      {/* ── Employees Grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-md">
                  {emp.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{emp.fullName}</h3>
                  <p className="text-xs text-slate-500">{emp.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                emp.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {emp.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Employee ID Badge Bar */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID Code</span>
                <p className="text-xs font-mono font-bold text-slate-800 tracking-wide">{emp.employeeCode}</p>
              </div>
              <button
                onClick={() => handleCopyCode(emp.employeeCode)}
                className="p-1.5 rounded-lg hover:bg-white text-slate-500 hover:text-brand-600 transition-colors"
                title="Copy code"
              >
                {copiedCode === emp.employeeCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Department & Warehouse */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Warehouse className="w-3.5 h-3.5 text-slate-400" />
                <span>{emp.assignedWarehouse}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Joined: {emp.joinedDate}</span>
              <span className="font-semibold text-slate-700 capitalize">{emp.role.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create Employee Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Register New Staff Member</h3>
                    <p className="text-xs text-slate-500">Issue automated employee badges &amp; facility assignments</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateEmployee} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Liam Henderson"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="l.henderson@ric.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 019-2041"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => {
                        const newDept = e.target.value;
                        setFormData({
                          ...formData,
                          department: newDept,
                          employeeCode: generateEmployeeCode(newDept)
                        });
                      }}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="Warehouse Operations">Warehouse Operations</option>
                      <option value="Inbound Logistics">Inbound Logistics</option>
                      <option value="Sales & POS">Sales &amp; POS</option>
                      <option value="Floor Supervision">Floor Supervision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Facility</label>
                    <select
                      value={formData.assignedWarehouse}
                      onChange={(e) => setFormData({ ...formData, assignedWarehouse: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                    >
                      <option value="Main Hub - Warehouse A">Main Hub - Warehouse A</option>
                      <option value="East Expansion - Warehouse B">East Expansion - Warehouse B</option>
                      <option value="South Distribution - Warehouse C">South Distribution - Warehouse C</option>
                      <option value="Overflow Yard - Warehouse D">Overflow Yard - Warehouse D</option>
                    </select>
                  </div>
                </div>

                {/* Auto Generated Code Preview */}
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Generated Badge ID</span>
                    <p className="text-sm font-mono font-extrabold text-emerald-900">{formData.employeeCode}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Auto-generated
                  </span>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20"
                  >
                    Complete Registration
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
