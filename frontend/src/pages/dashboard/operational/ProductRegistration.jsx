import { useState } from 'react';
import { Package, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { createProduct } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

export default function ProductRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    sku: '',
    brand: 'Red Indian Customs',
    model: '',
    dimensions: '',
    category: 'Standard',
    unit_cost: '',
    retail_price: '',
    current_stock: '0',
    reorder_level: '10'
  });

  const categories = [
    'Standard',
    'Sawtooth',
    'Enduro',
    'Dual Sport',
    'Motocross',
    'Trail',
    'Street',
    'Off-Road',
    'All-Terrain'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await createProduct({
        sku: formData.sku,
        brand: formData.brand,
        model: formData.model,
        dimensions: formData.dimensions,
        category: formData.category,
        unitCost: parseFloat(formData.unit_cost) || 0,
        retailPrice: parseFloat(formData.retail_price) || 0,
        currentStock: parseInt(formData.current_stock) || 0,
        reorderLevel: parseInt(formData.reorder_level) || 10
      });

      setSuccess('Product registered successfully!');
      
      // Reset form after 2 seconds and optionally navigate
      setTimeout(() => {
        setSuccess('');
        resetForm();
      }, 2000);
      
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.error || 'Failed to register product');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      brand: 'Red Indian Customs',
      model: '',
      dimensions: '',
      category: 'Standard',
      unit_cost: '',
      retail_price: '',
      current_stock: '0',
      reorder_level: '10'
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Registration</h1>
          <p className="mt-1 text-sm text-gray-500">
            Register new tire products into the catalog
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/operational/products-list')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Package className="h-5 w-5 mr-2" />
          View Catalog
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Registration Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  required
                  placeholder="SAW-15-130/90"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Unique identifier for this product
                </p>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  required
                  placeholder="Red Indian Customs"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  required
                  placeholder="Classic Sawtooth"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions *
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  required
                  placeholder="130/90-15"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Width/Aspect-Diameter (e.g., 130/90-15)
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unit Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Cost (₱)
                </label>
                <input
                  type="number"
                  value={formData.unit_cost}
                  onChange={(e) => handleInputChange('unit_cost', e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Cost per unit from supplier
                </p>
              </div>

              {/* Retail Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Retail Price (₱) *
                </label>
                <input
                  type="number"
                  value={formData.retail_price}
                  onChange={(e) => handleInputChange('retail_price', e.target.value)}
                  required
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Selling price to customers
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => handleInputChange('current_stock', e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Initial quantity on hand (default: 0)
                </p>
              </div>

              {/* Reorder Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => handleInputChange('reorder_level', e.target.value)}
                  min="0"
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Alert when stock falls below this level
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Registering...' : 'Register Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Product Registration Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• SKU should be unique and follow your naming convention</li>
          <li>• Dimensions format: Width/Aspect-Diameter (e.g., 130/90-15)</li>
          <li>• Set retail price to enable sales transactions</li>
          <li>• Reorder level helps manage stock alerts</li>
          <li>• Initial stock is usually 0 - inventory increases through shipments</li>
        </ul>
      </div>
    </div>
  );
}
