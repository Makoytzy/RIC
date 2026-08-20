import { useState, useEffect } from 'react';
import { Plus, Layers, Search, Calendar, Package, Barcode } from 'lucide-react';
import { 
  fetchBatches, 
  createBatch, 
  updateBatch, 
  deleteBatch,
  fetchShipments,
  fetchProducts
} from '../../../services/api';

export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  // Form state
  const [formData, setFormData] = useState({
    shipment_id: '',
    product_id: '',
    batch_number: '',
    batch_month: new Date().getMonth() + 1,
    batch_year: new Date().getFullYear(),
    manufactured_date: '',
    expiry_date: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchesData, shipmentsData, productsData] = await Promise.all([
        fetchBatches({ status: statusFilter }),
        fetchShipments({ status: 'RECEIVED' }), // Only show received shipments
        fetchProducts({ status: 'In Stock' })
      ]);
      
      setBatches(batchesData.batches || []);
      setShipments(shipmentsData.shipments || []);
      setProducts(productsData.products || []);
      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      if (err.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.status === 403) {
        setError('Access denied. You do not have permission to view batches.');
      } else {
        setError(err.message || 'Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateBatchNumber = () => {
    const { batch_month, batch_year } = formData;
    const monthStr = String(batch_month).padStart(2, '0');
    const yearStr = String(batch_year).slice(-2);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BATCH-${yearStr}${monthStr}-${randomNum}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Auto-generate batch number if not provided
      const batchData = {
        ...formData,
        batch_number: formData.batch_number || generateBatchNumber()
      };

      if (editingBatch) {
        await updateBatch(editingBatch.id, batchData);
      } else {
        await createBatch(batchData);
      }

      resetForm();
      await loadData();
    } catch (err) {
      console.error('Error saving batch:', err);
      setError(err.response?.data?.error || 'Failed to save batch');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormData({
      shipment_id: batch.shipment_id || '',
      product_id: batch.product_id || '',
      batch_number: batch.batch_number || '',
      batch_month: batch.batch_month || new Date().getMonth() + 1,
      batch_year: batch.batch_year || new Date().getFullYear(),
      manufactured_date: batch.manufactured_date || '',
      expiry_date: batch.expiry_date || '',
      notes: batch.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to deactivate this batch?')) return;
    
    try {
      await deleteBatch(id);
      await loadData();
    } catch (err) {
      console.error('Error deleting batch:', err);
      setError(err.response?.data?.error || 'Failed to delete batch');
    }
  };

  const resetForm = () => {
    setFormData({
      shipment_id: '',
      product_id: '',
      batch_number: '',
      batch_month: new Date().getMonth() + 1,
      batch_year: new Date().getFullYear(),
      manufactured_date: '',
      expiry_date: '',
      notes: ''
    });
    setEditingBatch(null);
    setShowForm(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      COMPLETED: 'bg-blue-100 text-blue-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = 
      batch.batch_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.products?.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.products?.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.shipments?.shipment_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  if (loading && batches.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading batches...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batch Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage tire batches from received shipments
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Batch
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
            {editingBatch ? 'Edit Batch' : 'New Batch'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipment *
                </label>
                <select
                  value={formData.shipment_id}
                  onChange={(e) => setFormData({ ...formData, shipment_id: e.target.value })}
                  required
                  disabled={editingBatch}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Shipment</option>
                  {shipments.map(shipment => (
                    <option key={shipment.id} value={shipment.id}>
                      {shipment.shipment_number} - {shipment.container_number}
                    </option>
                  ))}
                </select>
                {shipments.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    No received shipments available. Please receive a shipment first.
                  </p>
                )}
              </div>

              {/* Product */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  disabled={editingBatch}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select Product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.brand} {product.model} ({product.dimensions})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batch_number}
                  onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                  placeholder="Leave blank to auto-generate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: BATCH-YYMM-XXX (auto-generated if empty)
                </p>
              </div>

              {/* Batch Month */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Month *
                </label>
                <select
                  value={formData.batch_month}
                  onChange={(e) => setFormData({ ...formData, batch_month: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {new Date(2000, month - 1).toLocaleString('default', { month: 'long' })} ({month})
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Year *
                </label>
                <input
                  type="number"
                  value={formData.batch_year}
                  onChange={(e) => setFormData({ ...formData, batch_year: parseInt(e.target.value) })}
                  required
                  min="2000"
                  max="2100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Manufactured Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufactured Date
                </label>
                <input
                  type="date"
                  value={formData.manufactured_date}
                  onChange={(e) => setFormData({ ...formData, manufactured_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
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
                placeholder="Additional notes about this batch..."
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
                {loading ? 'Saving...' : editingBatch ? 'Update Batch' : 'Create Batch'}
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
              placeholder="Search batches..."
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
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Batches List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Shipment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month/Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Barcodes
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
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <Layers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No batches found</p>
                  <p className="mt-1">Create your first batch to get started</p>
                </td>
              </tr>
            ) : (
              filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {batch.batch_number}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(batch.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {batch.products?.sku || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {batch.products?.brand} {batch.products?.model}
                    </div>
                    <div className="text-xs text-gray-400">
                      {batch.products?.dimensions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {batch.shipments?.shipment_number || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {batch.shipments?.container_number}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {batch.batch_month}/{batch.batch_year}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Barcode className="h-4 w-4 mr-1 text-gray-400" />
                      {batch.barcode_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    {batch.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleDelete(batch.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
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
