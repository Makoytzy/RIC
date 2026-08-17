import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Truck, Search, Phone, Mail, MapPin, Eye } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import { showToast } from '../../../utils/toast';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Suppliers() {
  const { hasRole } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentTerms: '',
    taxId: '',
    status: 'active',
    notes: ''
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data.suppliers || []);
    } catch (error) {
      showToast('Failed to load suppliers', 'error');
      // Mock data
      setSuppliers([
        {
          id: 1,
          name: 'Tech Solutions Inc',
          contactPerson: 'John Smith',
          email: 'john@techsolutions.com',
          phone: '+1-555-0100',
          address: '123 Tech Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA',
          paymentTerms: 'Net 30',
          taxId: '12-3456789',
          status: 'active',
          totalOrders: 145,
          totalValue: 1250000
        },
        {
          id: 2,
          name: 'Global Supplies Co',
          contactPerson: 'Sarah Johnson',
          email: 'sarah@globalsupplies.com',
          phone: '+1-555-0200',
          address: '456 Supply Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
          paymentTerms: 'Net 45',
          taxId: '98-7654321',
          status: 'active',
          totalOrders: 89,
          totalValue: 890000
        },
        {
          id: 3,
          name: 'Quality Parts Ltd',
          contactPerson: 'Mike Brown',
          email: 'mike@qualityparts.com',
          phone: '+1-555-0300',
          address: '789 Industrial Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA',
          paymentTerms: 'Net 60',
          taxId: '45-6789012',
          status: 'inactive',
          totalOrders: 12,
          totalValue: 120000
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, formData);
        showToast('Supplier updated successfully', 'success');
      } else {
        await api.post('/suppliers', formData);
        showToast('Supplier created successfully', 'success');
      }
      setShowModal(false);
      setEditingSupplier(null);
      resetForm();
      loadSuppliers();
    } catch (error) {
      showToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
      showToast('Supplier deleted successfully', 'success');
      loadSuppliers();
    } catch (error) {
      showToast('Failed to delete supplier', 'error');
    }
  };

  const handleViewDetails = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      paymentTerms: '',
      taxId: '',
      status: 'active',
      notes: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    resetForm();
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-slate-100 text-slate-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const columns = [
    { key: 'name', label: 'Supplier Name', sortable: true },
    { key: 'contactPerson', label: 'Contact Person' },
    {
      key: 'email',
      label: 'Email',
      render: (value) => (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      )
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (value) => (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      )
    },
    {
      key: 'location',
      label: 'Location',
      render: (_, row) => `${row.city}, ${row.state}`
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      render: (value) => <span className="font-semibold">{value || 0}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {hasRole('admin', 'manager', 'operational_staff') && (
            <>
              <button
                onClick={() => handleEdit(row)}
                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              {hasRole('admin') && (
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your supplier relationships</p>
        </div>
        {hasRole('admin', 'manager', 'operational_staff') && (
          <Button onClick={() => setShowModal(true)} icon={Plus}>
            Add Supplier
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Suppliers</p>
              <p className="text-2xl font-bold text-slate-900">{suppliers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Truck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {suppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Truck className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-2xl font-bold text-slate-900">
                {suppliers.reduce((sum, s) => sum + (s.totalOrders || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Truck className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Value</p>
              <p className="text-2xl font-bold text-slate-900">
                ${(suppliers.reduce((sum, s) => sum + (s.totalValue || 0), 0) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, contact, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredSuppliers.length > 0 ? (
          <Table columns={columns} data={filteredSuppliers} />
        ) : (
          <EmptyState
            icon={Truck}
            title="No suppliers found"
            description="Add your first supplier to get started"
            action={
              hasRole('admin', 'manager', 'operational_staff') && (
                <Button onClick={() => setShowModal(true)} icon={Plus}>
                  Add Supplier
                </Button>
              )
            }
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Supplier Details"
      >
        {selectedSupplier && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{selectedSupplier.name}</h3>
              <span className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSupplier.status)}`}>
                {selectedSupplier.status.charAt(0).toUpperCase() + selectedSupplier.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-500">Contact Person</p>
                <p className="font-semibold">{selectedSupplier.contactPerson}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Payment Terms</p>
                <p className="font-semibold">{selectedSupplier.paymentTerms}</p>
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="text-slate-400" size={16} />
                <a href={`mailto:${selectedSupplier.email}`} className="text-blue-600 hover:underline">
                  {selectedSupplier.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="text-slate-400" size={16} />
                <a href={`tel:${selectedSupplier.phone}`} className="text-blue-600 hover:underline">
                  {selectedSupplier.phone}
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="text-slate-400 shrink-0 mt-0.5" size={16} />
                <div>
                  <p>{selectedSupplier.address}</p>
                  <p>{selectedSupplier.city}, {selectedSupplier.state} {selectedSupplier.zipCode}</p>
                  <p>{selectedSupplier.country}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="text-2xl font-bold text-blue-600">{selectedSupplier.totalOrders || 0}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Value</p>
                <p className="text-2xl font-bold text-green-600">
                  ${((selectedSupplier.totalValue || 0) / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
            {selectedSupplier.taxId && (
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500">Tax ID</p>
                <p className="font-mono text-sm">{selectedSupplier.taxId}</p>
              </div>
            )}
            {selectedSupplier.notes && (
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500 mb-1">Notes</p>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
                  {selectedSupplier.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Supplier Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Tech Solutions Inc"
            required
          />
          <Input
            label="Contact Person"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            placeholder="e.g., John Smith"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contact@supplier.com"
              required
            />
            <Input
              label="Phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0100"
              required
            />
          </div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="123 Main Street"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="San Francisco"
              required
            />
            <Input
              label="State/Province"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              placeholder="CA"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ZIP/Postal Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              placeholder="94105"
              required
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="USA"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Payment Terms"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
              placeholder="Net 30"
              required
            />
            <Input
              label="Tax ID"
              value={formData.taxId}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              placeholder="12-3456789"
            />
          </div>
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'suspended', label: 'Suspended' }
            ]}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information about this supplier..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={handleCloseModal} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingSupplier ? 'Update' : 'Create'} Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
