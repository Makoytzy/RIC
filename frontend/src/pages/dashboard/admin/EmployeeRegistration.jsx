import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, Search, AlertCircle, CheckCircle2, XCircle, Edit2,
  Trash2, Shield, IdCard, Building, Warehouse, RefreshCw,
  Copy, Check, Sparkles, Filter, Download, Upload, ArrowRight,
  Eye, FileText, X, AlertTriangle, Loader2
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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const [csvData, setCsvData] = useState([]);
  const [csvErrors, setCsvErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    employeeCode: '',
    role: 'operational_staff',
    department: 'Warehouse Operations',
    assignedWarehouse: 'Warehouse 1',
  });

  // Updated department prefix mapping
  const generateEmployeeCode = (dept) => {
    const prefix = 
      dept === 'Office' ? 'EMP-OF' :
      dept === 'Digital' ? 'EMP-DG' :
      dept === 'Warehouse Operations' ? 'EMP-WH' :
      dept === 'Sales & POS' ? 'EMP-SL' :
      dept === 'Inbound Logistics' ? 'EMP-IL' :
      dept === 'Floor Supervision' ? 'EMP-FS' :
      'EMP-OP';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${random}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

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
        setEmployees([]);
      }
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees. Please ensure the database is set up correctly.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    const code = generateEmployeeCode('Warehouse Operations');
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      employeeCode: code,
      role: 'operational_staff',
      department: 'Warehouse Operations',
      assignedWarehouse: 'Warehouse 1',
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (emp) => {
    setSelectedEmployee(emp);
    setFormData({
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone === '—' ? '' : emp.phone,
      employeeCode: emp.employeeCode,
      role: emp.role,
      department: emp.department,
      assignedWarehouse: emp.assignedWarehouse,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    try {
      setError('');
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
      console.error('Error creating employee:', err);
      setError(err.response?.data?.error || 'Failed to create employee. Please try again.');
    }
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await api.put(`/employees/${selectedEmployee.id}`, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        employeeCode: formData.employeeCode,
        role: formData.role,
        department: formData.department,
        assignedWarehouse: formData.assignedWarehouse,
      });

      setSuccess(`Employee ${formData.fullName} updated successfully!`);
      setIsEditModalOpen(false);
      await loadData();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.response?.data?.error || 'Failed to update employee. Please try again.');
    }
  };

  const handleDeleteEmployee = async (empId, empName) => {
    if (!window.confirm(`Are you sure you want to delete ${empName}?`)) return;
    
    try {
      await api.delete(`/employees/${empId}`);
      setSuccess(`Employee ${empName} deleted successfully!`);
      await loadData();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError('Failed to delete employee. Please try again.');
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        
        if (rows.length < 2) {
          setError('CSV file must contain headers and at least one data row');
          return;
        }

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const data = [];
        const errors = [];

        // Expected headers: Full Name, Email, Phone, Employee Code, Department, Assigned Facility, Role
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',').map(v => v.trim());
          
          if (values.length < headers.length) {
            errors.push(`Row ${i + 1}: Incomplete data`);
            continue;
          }

          const emp = {
            fullName: values[headers.indexOf('full name')] || values[headers.indexOf('fullname')] || values[0],
            email: values[headers.indexOf('email')] || values[1],
            phone: values[headers.indexOf('phone')] || values[2] || '',
            employeeCode: values[headers.indexOf('employee code')] || values[headers.indexOf('employeecode')] || values[headers.indexOf('biometric code')] || values[3] || '',
            department: values[headers.indexOf('department')] || values[4] || 'Warehouse Operations',
            assignedWarehouse: values[headers.indexOf('assigned facility')] || values[headers.indexOf('assignedfacility')] || values[headers.indexOf('facility')] || values[5] || 'Warehouse 1',
            role: values[headers.indexOf('role')] || values[headers.indexOf('position')] || values[6] || 'operational_staff',
          };

          // Validate email
          if (!emp.email || !emp.email.includes('@')) {
            errors.push(`Row ${i + 1}: Invalid email address`);
            continue;
          }

          // Generate employee code if not provided
          if (!emp.employeeCode) {
            emp.employeeCode = generateEmployeeCode(emp.department);
          }

          data.push(emp);
        }

        setCsvData(data);
        setCsvErrors(errors);
        setIsImportModalOpen(true);
      } catch (err) {
        console.error('CSV parsing error:', err);
        setError('Failed to parse CSV file. Please check the format.');
      }
    };

    reader.onerror = () => {
      setError('Failed to read file. Please try again.');
    };

    reader.readAsText(file);
  };

  const handleBulkImport = async () => {
    try {
      setImporting(true);
      setError('');

      const { data } = await api.post('/employees/import', {
        employees: csvData
      });

      setSuccess(`Successfully imported ${data.imported} employees!`);
      setIsImportModalOpen(false);
      setCsvData([]);
      setCsvErrors([]);
      await loadData();
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      console.error('Bulk import error:', err);
      setError(err.response?.data?.error || 'Failed to import employees. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadCSVTemplate = () => {
    const template = `Full Name,Email,Phone,Employee Code,Department,Assigned Facility,Role
John Doe,john.doe@company.com,+1234567890,EMP-WH-1234,Warehouse Operations,Warehouse 1,warehouse_staff
Jane Smith,jane.smith@company.com,+1234567891,EMP-OF-5678,Office,Office,admin`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
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
          <p className="text-slate-500 text-sm mt-0.5">Issue unique employee identifiers, facility assignments, and access badges.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSVTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium shadow-sm transition-colors"
            title="Download CSV Template"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium shadow-sm transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          
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
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <option value="Office">Office</option>
            <option value="Digital">Digital</option>
            <option value="Warehouse Operations">Warehouse Operations</option>
            <option value="Sales & POS">Sales &amp; POS</option>
            <option value="Inbound Logistics">Inbound Logistics</option>
            <option value="Floor Supervision">Floor Supervision</option>
          </select>
        </div>
      </div>

      {/* ── Employees Grid ────────────────────────────────────────── */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 border border-slate-200/80 shadow-sm text-center">
          <UserPlus className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">No Employees Found</h3>
          <p className="text-sm text-slate-500 mb-4">
            {employees.length === 0 ? 'Get started by registering your first employee' : 'Try adjusting your search or filter criteria'}
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
          >
            <UserPlus className="w-4 h-4" />
            Register First Employee
          </button>
        </div>
      ) : (
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
                  {emp.isActive ? 'Active' : 'Used'}
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Joined: {emp.joinedDate}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(emp)}
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                    title="Edit employee"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEmployee(emp.id, emp.fullName)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                    title="Delete employee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create Employee Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
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

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    >
                      <option value="Office">Office</option>
                      <option value="Digital">Digital</option>
                      <option value="Warehouse Operations">Warehouse Operations</option>
                      <option value="Sales & POS">Sales & POS</option>
                      <option value="Inbound Logistics">Inbound Logistics</option>
                      <option value="Floor Supervision">Floor Supervision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Facility</label>
                    <select
                      value={formData.assignedWarehouse}
                      onChange={(e) => setFormData({ ...formData, assignedWarehouse: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    >
                      <option value="Office">Office</option>
                      <option value="Digital">Digital</option>
                      <option value="Warehouse 1">Warehouse 1</option>
                      <option value="Warehouse 2">Warehouse 2</option>
                    </select>
                  </div>
                </div>

                {/* Editable Employee Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Badge ID (Biometric Code)
                    <span className="text-slate-400 font-normal ml-1">- Editable</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                    placeholder="EMP-WH-1234"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-sm font-mono font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">You can edit this code or keep the auto-generated one</p>
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

      {/* ── Edit Employee Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {isEditModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                    <Edit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Edit Employee Details</h3>
                    <p className="text-xs text-slate-500">Update employee information and badge code</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmployee} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="Office">Office</option>
                      <option value="Digital">Digital</option>
                      <option value="Warehouse Operations">Warehouse Operations</option>
                      <option value="Sales & POS">Sales & POS</option>
                      <option value="Inbound Logistics">Inbound Logistics</option>
                      <option value="Floor Supervision">Floor Supervision</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Facility</label>
                    <select
                      value={formData.assignedWarehouse}
                      onChange={(e) => setFormData({ ...formData, assignedWarehouse: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="Office">Office</option>
                      <option value="Digital">Digital</option>
                      <option value="Warehouse 1">Warehouse 1</option>
                      <option value="Warehouse 2">Warehouse 2</option>
                    </select>
                  </div>
                </div>

                {/* Editable Employee Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Employee Badge ID (Biometric Code)
                    <span className="text-amber-600 font-normal ml-1">- Editable</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-blue-200 bg-blue-50/30 text-sm font-mono font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                  <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Changing the badge code will affect employee authentication
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── CSV Import Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">CSV Import Preview</h3>
                    <p className="text-xs text-slate-500">Review and import {csvData.length} employees</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setCsvData([]);
                    setCsvErrors([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              {csvErrors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <p className="text-xs font-semibold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {csvErrors.length} row(s) had errors and will be skipped:
                  </p>
                  <ul className="text-xs text-amber-800 space-y-0.5 ml-6 list-disc">
                    {csvErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {csvErrors.length > 5 && (
                      <li className="text-amber-600">... and {csvErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="max-h-96 overflow-auto border border-slate-200 rounded-xl mb-4">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Name</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Email</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Code</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Department</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-700">Facility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {csvData.map((emp, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-3 py-2 text-slate-900">{emp.fullName}</td>
                        <td className="px-3 py-2 text-slate-600">{emp.email}</td>
                        <td className="px-3 py-2 font-mono font-semibold text-slate-800">{emp.employeeCode}</td>
                        <td className="px-3 py-2 text-slate-600">{emp.department}</td>
                        <td className="px-3 py-2 text-slate-600">{emp.assignedWarehouse}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-600" />
                  {csvData.length} valid employee(s) ready to import
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setCsvData([]);
                      setCsvErrors([]);
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    disabled={importing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkImport}
                    disabled={importing || csvData.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Import {csvData.length} Employees
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
