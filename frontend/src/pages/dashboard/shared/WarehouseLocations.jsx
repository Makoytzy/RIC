import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit, Trash2, MapPin, Package, Search, Filter,
  Hash, Tag, Grid2x2, Layers, BookOpen, Box,
  CheckCircle2, AlertCircle, XCircle, Wrench, X,
} from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import { showToast } from '../../../utils/toast';
import api from '../../../services/api';

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// ── Inline field label wrapper ────────────────────────────────────────────────
function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

// ── Styled text input ─────────────────────────────────────────────────────────
function TextInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      {Icon && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
          <Icon size={15} />
        </span>
      )}
      <input
        className={`w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 text-sm text-slate-900 outline-none transition
          placeholder:text-slate-400
          focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100
          ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
        {...props}
      />
    </div>
  );
}

// ── Status picker ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'active',      label: 'Active',      Icon: CheckCircle2, color: 'text-green-600 bg-green-50  border-green-200' },
  { value: 'full',        label: 'Full',         Icon: AlertCircle,  color: 'text-amber-600 bg-amber-50  border-amber-200' },
  { value: 'empty',       label: 'Empty',        Icon: XCircle,      color: 'text-slate-500 bg-slate-50  border-slate-200' },
  { value: 'maintenance', label: 'Maintenance',  Icon: Wrench,       color: 'text-red-600   bg-red-50    border-red-200'   },
];

function StatusPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {STATUS_OPTIONS.map(({ value: val, label, Icon, color }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all
            ${value === val
              ? `${color} shadow-sm ring-2 ring-current ring-offset-1`
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
        >
          <Icon size={15} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, label }) {
  return (
    <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
      <Icon size={12} /> {label}
    </p>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  code: '', name: '', zone: '', aisle: '', rack: '', shelf: '',
  capacity: '', currentStock: '0', status: 'active',
};

export default function WarehouseLocations() {
  const [locations,       setLocations]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showModal,       setShowModal]       = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [filterZone,      setFilterZone]      = useState('all');
  const [submitting,      setSubmitting]      = useState(false);
  const [formData,        setFormData]        = useState(EMPTY_FORM);
  const [dbReady,         setDbReady]         = useState(true);   // false = table not set up yet

  useEffect(() => { loadLocations(); }, []);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadLocations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouse/locations');
      const fetched  = response.data.locations || [];
      setLocations(fetched);
      setDbReady(true);
    } catch (err) {
      setLocations([]);
      // 503 means the DB table hasn't been created yet
      const is503 =
        err.response?.status === 503 ||
        err.status === 503 ||
        err.message?.toLowerCase().includes('not configured');
      if (is503) {
        setDbReady(false);
      } else {
        console.warn('Warehouse locations API error:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  const setField = (field) => (e) => setFormData((f) => ({ ...f, [field]: e.target.value }));

  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
    setFormData(EMPTY_FORM);
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingLocation) {
        await api.put(`/warehouse/locations/${editingLocation.id}`, formData);
        showToast('Location updated successfully', 'success');
      } else {
        await api.post('/warehouse/locations', formData);
        showToast('Location created successfully', 'success');
      }
      closeModal();
      loadLocations();
    } catch (err) {
      showToast(err.response?.data?.error || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData(location);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    try {
      await api.delete(`/warehouse/locations/${id}`);
      showToast('Location deleted successfully', 'success');
      loadLocations();
    } catch {
      showToast('Failed to delete location', 'error');
    }
  };

  // ── Filtering ───────────────────────────────────────────────────────────────
  const zones = [...new Set(locations.map((l) => l.zone))];
  const filteredLocations = locations.filter((loc) => {
    const q = searchQuery.toLowerCase();
    return (
      (loc.code.toLowerCase().includes(q) || loc.name.toLowerCase().includes(q)) &&
      (filterZone === 'all' || loc.zone === filterZone)
    );
  });

  const statusBadge = (s) => ({
    active:      'bg-green-100 text-green-700',
    full:        'bg-amber-100 text-amber-700',
    empty:       'bg-slate-100 text-slate-600',
    maintenance: 'bg-red-100   text-red-700',
  }[s] ?? 'bg-slate-100 text-slate-600');

  const capacityColor = (cur, cap) => {
    const pct = (cur / cap) * 100;
    if (pct >= 90) return 'text-red-600';
    if (pct >= 70) return 'text-amber-600';
    return 'text-green-600';
  };

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = [
    { key: 'code', label: 'Location Code', sortable: true },
    { key: 'name', label: 'Name' },
    { key: 'zone', label: 'Zone' },
    {
      key: 'position', label: 'Position',
      render: (_, row) => row ? `${row.aisle}-${row.rack}-${row.shelf}` : '-',
    },
    {
      key: 'capacity', label: 'Capacity',
      render: (_, row) => row ? (
        <span>
          <span className={`font-semibold ${capacityColor(row.currentStock, row.capacity)}`}>
            {row.currentStock}
          </span>
          <span className="text-slate-400"> / {row.capacity}</span>
        </span>
      ) : '-',
    },
    {
      key: 'utilization', label: 'Utilization',
      render: (_, row) => {
        if (!row) return '-';
        const pct = Math.round((row.currentStock / row.capacity) * 100);
        return (
          <div className="flex items-center gap-2">
            <div className="w-20 bg-slate-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{pct}%</span>
          </div>
        );
      },
    },
    {
      key: 'status', label: 'Status',
      render: (val) => {
        const s = typeof val === 'string' ? val : String(val ?? 'unknown');
        return (
          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge(s)}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => row ? (
        <div className="flex gap-1.5">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit size={15} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ) : null,
    },
  ];

  if (loading) return <Loading />;

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeIn} className="space-y-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouse Locations</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage storage locations and capacity</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Locations', value: locations.length,                                         Icon: MapPin,  bg: 'bg-blue-50',   iconCls: 'bg-blue-100 text-blue-600',     val: 'text-blue-700'   },
          { label: 'Total Capacity',  value: locations.reduce((s, l) => s + l.capacity, 0),             Icon: Package, bg: 'bg-green-50',  iconCls: 'bg-green-100 text-green-600',   val: 'text-green-700'  },
          { label: 'Current Stock',   value: locations.reduce((s, l) => s + (l.currentStock ?? 0), 0),  Icon: Box,     bg: 'bg-amber-50',  iconCls: 'bg-amber-100 text-amber-600',   val: 'text-amber-700'  },
          { label: 'Zones',           value: zones.length,                                             Icon: Grid2x2, bg: 'bg-purple-50', iconCls: 'bg-purple-100 text-purple-600', val: 'text-purple-700' },
        ].map(({ label, value, Icon, bg, iconCls, val }) => (
          <div key={label} className={`${bg} rounded-xl border border-slate-200 p-4`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconCls}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className={`text-2xl font-bold ${val}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>
          <div className="relative w-full md:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filterZone}
              onChange={(e) => setFilterZone(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
            >
              <option value="all">All Zones</option>
              {zones.map((z) => <option key={z} value={z}>Zone {z}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {!dbReady ? (
          /* Table hasn't been created — prompt admin to run migration */
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Layers size={28} className="text-amber-600" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">Database table not set up yet</p>
              <p className="mt-1 text-sm text-slate-500 max-w-md">
                The <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">warehouse_locations</code> table
                does not exist in Supabase. Run the SQL migration to start managing locations.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-left text-xs font-mono text-amber-800 max-w-sm w-full">
              Supabase Dashboard → SQL Editor<br />
              → Run: <strong>008_warehouse_locations.sql</strong>
            </div>
          </div>
        ) : filteredLocations.length > 0 ? (
          <Table columns={columns} data={filteredLocations} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <MapPin size={26} className="text-blue-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-800">No locations yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Add your first warehouse location to start tracking storage and capacity.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> Add First Location
            </button>
          </div>
        )}
      </div>

      {/* ================================================================
          ADD / EDIT MODAL
      ================================================================ */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        size="lg"
        title={
          <span className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-500" />
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </span>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Identification */}
          <div className="space-y-3">
            <SectionHeader icon={Tag} label="Identification" />
            <Field label="Location Code" required hint="Format: ZONE-AISLE-RACK-SHELF  e.g. A-01-01-01">
              <TextInput
                icon={Hash}
                value={formData.code}
                onChange={setField('code')}
                placeholder="A-01-01-01"
                required
              />
            </Field>
            <Field label="Display Name" required>
              <TextInput
                icon={BookOpen}
                value={formData.name}
                onChange={setField('name')}
                placeholder="Zone A - Aisle 1 - Rack 1 - Shelf 1"
                required
              />
            </Field>
          </div>

          <hr className="border-slate-100" />

          {/* Position */}
          <div className="space-y-3">
            <SectionHeader icon={Layers} label="Position" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Zone" required hint="Single letter: A, B, C...">
                <TextInput
                  icon={Grid2x2}
                  value={formData.zone}
                  onChange={setField('zone')}
                  placeholder="A"
                  maxLength={10}
                  required
                />
              </Field>
              <Field label="Aisle" required hint="Zero-padded: 01, 02...">
                <TextInput
                  value={formData.aisle}
                  onChange={setField('aisle')}
                  placeholder="01"
                  maxLength={10}
                  required
                />
              </Field>
              <Field label="Rack" required>
                <TextInput
                  value={formData.rack}
                  onChange={setField('rack')}
                  placeholder="01"
                  maxLength={10}
                  required
                />
              </Field>
              <Field label="Shelf" required>
                <TextInput
                  value={formData.shelf}
                  onChange={setField('shelf')}
                  placeholder="01"
                  maxLength={10}
                  required
                />
              </Field>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Capacity */}
          <div className="space-y-3">
            <SectionHeader icon={Package} label="Capacity" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Max Capacity" required hint="Total units this shelf holds">
                <TextInput
                  icon={Package}
                  type="number"
                  min="0"
                  value={formData.capacity}
                  onChange={setField('capacity')}
                  placeholder="100"
                  required
                />
              </Field>
              <Field label="Current Stock" required hint="Units currently stored">
                <TextInput
                  icon={Box}
                  type="number"
                  min="0"
                  value={formData.currentStock}
                  onChange={setField('currentStock')}
                  placeholder="0"
                  required
                />
              </Field>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Status */}
          <div className="space-y-3">
            <SectionHeader icon={CheckCircle2} label="Status" />
            <StatusPicker
              value={formData.status}
              onChange={(val) => setFormData((f) => ({ ...f, status: val }))}
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <X size={15} /> Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                : editingLocation ? <Edit size={15} /> : <Plus size={15} />
              }
              {submitting ? 'Saving...' : editingLocation ? 'Update Location' : 'Create Location'}
            </button>
          </div>

        </form>
      </Modal>

    </motion.div>
  );
}
