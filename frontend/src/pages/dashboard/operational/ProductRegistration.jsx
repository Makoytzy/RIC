import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Tag,
  DollarSign,
  Ruler,
  Box,
  Sparkles,
  Info,
  ShoppingBag,
  Layers
} from 'lucide-react';
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
      setTimeout(() => {
        setSuccess('');
        resetForm();
      }, 3000);
      
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.response?.data?.error || 'Failed to register product');
      setTimeout(() => setError(''), 5000);
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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -m-6 p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 mb-2">
              <Package className="w-3.5 h-3.5" />
              PRODUCT REGISTRATION
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 bg-clip-text text-transparent tracking-tight">
              Register New Product
            </h1>
            <div className="text-slate-600 text-sm flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Add new tire products to your catalog
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/operational/products-list')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-emerald-700 bg-white border-2 border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4" />
            View Catalog
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-3 shadow-md"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto p-1 hover:bg-emerald-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-3 shadow-md"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{error}</span>
            <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-rose-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Product Details</h2>
              <p className="text-emerald-100 text-sm">Fill in the information below</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Info className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SKU */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  SKU (Stock Keeping Unit) *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  required
                  placeholder="SAW-15-130/90"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-xs text-slate-500 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Unique identifier for this product
                </p>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Brand *
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  required
                  placeholder="Red Indian Customs"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Box className="w-4 h-4 inline mr-1" />
                  Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  required
                  placeholder="Classic Sawtooth"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Ruler className="w-4 h-4 inline mr-1" />
                  Dimensions *
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => handleInputChange('dimensions', e.target.value)}
                  required
                  placeholder="130/90-15"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Width/Aspect-Diameter (e.g., 130/90-15)
                </p>
              </div>

              {/* Category */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  <Layers className="w-4 h-4 inline mr-1" />
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all appearance-none cursor-pointer bg-slate-50/50"
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
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pricing</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Unit Cost */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Unit Cost (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₱</span>
                  <input
                    type="number"
                    value={formData.unit_cost}
                    onChange={(e) => handleInputChange('unit_cost', e.target.value)}
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Cost per unit from supplier
                </p>
              </div>

              {/* Retail Price */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Retail Price (₱) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 font-bold">₱</span>
                  <input
                    type="number"
                    value={formData.retail_price}
                    onChange={(e) => handleInputChange('retail_price', e.target.value)}
                    required
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Selling price to customers
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Settings */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Inventory Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Stock */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Initial Stock
                </label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => handleInputChange('current_stock', e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Initial quantity on hand (default: 0)
                </p>
              </div>

              {/* Reorder Level */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reorder Level
                </label>
                <input
                  type="number"
                  value={formData.reorder_level}
                  onChange={(e) => handleInputChange('reorder_level', e.target.value)}
                  min="0"
                  placeholder="10"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Alert when stock falls below this level
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t-2 border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <X className="w-4 h-4" />
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Registering...' : 'Register Product'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Help Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-3">Product Registration Tips</h4>
            <ul className="text-xs text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>SKU should be unique and follow your naming convention</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Dimensions format: Width/Aspect-Diameter (e.g., 130/90-15)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Set retail price to enable sales transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Reorder level helps manage stock alerts automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Initial stock is usually 0 - inventory increases through shipments</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
