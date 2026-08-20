import { useState, useEffect } from 'react';
import { Plus, Package, Search, Calendar, Truck, CheckCircle, XCircle } from 'lucide-react';
import { fetchShipments, createShipment, updateShipment, deleteShipment } from '../../../services/api';
import { fetchSuppliers } from '../../../services/api';

export default function ShipmentRegistration() {
  const [shipments, setShipments] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingShipment, setEditingShipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    shipment_number: '',
    container_number: '',
    bl_number: '',
    expected_quantity: '',
    expected_arrival_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shipmentsData, suppliersData] = await Promise.all([
        fetchShipments({ status: statusFilter === 'all' ? null : statusFilter }),
        fetchSuppliers()
      ]);
      setShipments(shipmentsData.shipments || []);
      setSuppliers(suppliersData.suppliers || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      if (err.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.status === 403) {
        setError('Access denied. You do not have permission to view shipments.');
      } else {
        setError(err.message || 'Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingShipment) {
        await updateShipment(editingShipment.id, formData);
      } else {
        await createShipment(formData);
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error('Error saving shipment:', err);
      setError(err.response?.data?.error || 'Failed to save shipment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (shipment) => {
    setEditingShipment(shipment);
    setFormData({
      supplier_id: shipment.supplier_id || '',
      shipment_number: shipment.shipment_number || '',
      container_number: shipment.container_number || '',
      bl_number: shipment.bl_number || '',
      expected_quantity: shipment.expected_quantity || '',
      expected_arrival_date: shipment.expected_arrival_date || '',
      notes: shipment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this shipment?')) return;
    
    try {
      await deleteShipment(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting shipment:', err);
      setError('Failed to cancel shipment');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: '',
      shipment_number: '',
      container_number: '',
      bl_number: '',
      expected_quantity: '',
      expected_arrival_date: '',
      notes: ''
    });
    setEditingShipment(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_TRANSIT: 'bg-blue-100 text-blue-800',
      RECEIVED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.shipment_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.container_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.suppliers?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && shipments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading shipments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Registration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register and manage incoming tire shipments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Shipment
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingShipment ? 'Edit Shipment' : 'New Shipment'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier *
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipment Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment Number *
                </label>
                <input
                  type="text"
                  value={formData.shipment_number}
                  onChange={(e) => setFormData({ ...formData, shipment_number: e.target.value })}
                  required
                  placeholder="SHIP-2026-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Container Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Number *
                </label>
                <input
                  type="text"
                  value={formData.container_number}
                  onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                  required
                  placeholder="MSKU1234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* BL Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bill of Lading (BL) Number
                </label>
                <input
                  type="text"
                  value={formData.bl_number}
                  onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
                  placeholder="BL-2026-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Expected Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Quantity
                </label>
                <input
                  type="number"
                  value={formData.expected_quantity}
                  onChange={(e) => setFormData({ ...formData, expected_quantity: e.target.value })}
                  min="0"
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Expected Arrival Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Arrival Date
                </label>
                <input
                  type="date"
                  value={formData.expected_arrival_date}
                  onChange={(e) => setFormData({ ...formData, expected_arrival_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                placeholder="Additional notes about this shipment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingShipment ? 'Update Shipment' : 'Create Shipment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shipments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="RECEIVED">Received</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Container/BL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Arrival
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredShipments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No shipments found</p>
                  <p className="mt-1">Create your first shipment to get started</p>
                </td>
              </tr>
            ) : (
              filteredShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.shipment_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(shipment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{shipment.suppliers?.name || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{shipment.suppliers?.contact_person || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{shipment.container_number}</div>
                    <div className="text-xs text-gray-500">{shipment.bl_number || 'No BL'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {shipment.actual_quantity || 0} / {shipment.expected_quantity || 0}
                    </div>
                    <div className="text-xs text-gray-500">actual / expected</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {shipment.expected_arrival_date 
                        ? new Date(shipment.expected_arrival_date).toLocaleDateString()
                        : 'Not set'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(shipment.status)}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(shipment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {shipment.status === 'PENDING' && (
                      <button
                        onClick={() => handleDelete(shipment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
