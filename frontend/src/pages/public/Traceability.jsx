/**
 * ============================================================================
 * TRACEABILITY PAGE
 * ============================================================================
 * Public page for scanning QR codes and viewing complete traceability chain
 * 
 * URL: /trace/:barcodeValue
 * Example: /trace/RIC000000000001
 * 
 * Shows: Product → Batch → Shipment → Container Number → Supplier
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package,
  Box,
  Truck,
  Factory,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Hash,
  Barcode as BarcodeIcon
} from 'lucide-react';
import api from '../../services/api.js';

export default function Traceability() {
  const { barcodeValue } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTraceability() {
      if (!barcodeValue) {
        setError('No barcode value provided');
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/barcodes/trace/${encodeURIComponent(barcodeValue)}`
        );

        if (response.data?.success && response.data?.traceability) {
          setData(response.data.traceability);
        } else {
          setError('Barcode not found');
        }
      } catch (err) {
        console.error('Traceability lookup error:', err);
        setError(err.response?.data?.error || 'Failed to retrieve traceability information');
      } finally {
        setLoading(false);
      }
    }

    loadTraceability();
  }, [barcodeValue]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading traceability data...</p>
        </motion.div>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Barcode Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The barcode you scanned could not be found in our system.'}</p>
          <p className="text-sm font-mono text-slate-500 mb-6 px-4 py-2 bg-slate-100 rounded">
            {barcodeValue}
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  const product = data.products;
  const batch = data.batches;
  const shipment = batch?.shipments;
  const supplier = shipment?.suppliers;
  const inventoryUnit = data.inventory_units;
  const warehouse = inventoryUnit?.warehouses;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                  Inventory Traceability
                </h1>
                <p className="text-slate-600">Complete supply chain tracking</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl">
                <BarcodeIcon className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Barcode Value */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">Barcode:</span>
                <span className="font-mono text-lg font-bold text-slate-900 px-3 py-1 bg-slate-100 rounded">
                  {data.barcode_value}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  data.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {data.status?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Traceability Chain */}
        <div className="space-y-4">
          {/* Product Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Product Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 font-medium">Product Name:</span>
                    <p className="font-bold text-slate-900 mt-1">
                      {product?.brand && product?.model 
                        ? `${product.brand} ${product.model}` 
                        : product?.product_name || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">SKU:</span>
                    <p className="font-mono font-bold text-blue-600 mt-1">{product?.sku || '-'}</p>
                  </div>
                  {product?.dimensions && (
                    <div>
                      <span className="text-slate-600 font-medium">Dimensions:</span>
                      <p className="font-semibold text-slate-900 mt-1">{product.dimensions}</p>
                    </div>
                  )}
                  {product?.category && (
                    <div>
                      <span className="text-slate-600 font-medium">Category:</span>
                      <p className="font-semibold text-slate-900 mt-1">{product.category}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Inventory Unit Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Inventory Unit</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 font-medium">Unit Code:</span>
                    <p className="font-mono font-bold text-emerald-600 mt-1">
                      {inventoryUnit?.inventory_unit_code || '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600 font-medium">Status:</span>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        inventoryUnit?.status === 'AVAILABLE' 
                          ? 'bg-emerald-100 text-emerald-700'
                          : inventoryUnit?.status === 'SOLD'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inventoryUnit?.status || 'UNKNOWN'}
                      </span>
                    </p>
                  </div>
                  {warehouse && (
                    <div className="md:col-span-2">
                      <span className="text-slate-600 font-medium">Location:</span>
                      <p className="font-semibold text-slate-900 mt-1">
                        {warehouse.name} 
                        {inventoryUnit.level && ` - ${inventoryUnit.level}`}
                        {inventoryUnit.rack && ` - Rack ${inventoryUnit.rack}`}
                        {inventoryUnit.shelf && ` - Shelf ${inventoryUnit.shelf}`}
                      </p>
                    </div>
                  )}
                  {inventoryUnit?.received_at && (
                    <div>
                      <span className="text-slate-600 font-medium">Received:</span>
                      <p className="font-semibold text-slate-900 mt-1">
                        {new Date(inventoryUnit.received_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Batch Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <Box className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-slate-900 mb-3">Batch Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600 font-medium">Batch Number:</span>
                    <p className="font-mono font-bold text-purple-600 mt-1">
                      {batch?.batch_number || '-'}
                    </p>
                  </div>
                  {batch?.manufactured_date && (
                    <div>
                      <span className="text-slate-600 font-medium">Manufactured:</span>
                      <p className="font-semibold text-slate-900 mt-1">
                        {new Date(batch.manufactured_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {batch?.status && (
                    <div>
                      <span className="text-slate-600 font-medium">Batch Status:</span>
                      <p className="mt-1">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                          {batch.status}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipment Information */}
          {shipment && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Shipment Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600 font-medium">Shipment Number:</span>
                      <p className="font-mono font-bold text-amber-600 mt-1">
                        {shipment.shipment_number || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-600 font-medium">Container Number:</span>
                      <p className="font-mono font-bold text-slate-900 mt-1">
                        {shipment.container_number || '-'}
                      </p>
                    </div>
                    {shipment.bl_number && (
                      <div>
                        <span className="text-slate-600 font-medium">BL Number:</span>
                        <p className="font-mono font-bold text-slate-900 mt-1">
                          {shipment.bl_number}
                        </p>
                      </div>
                    )}
                    {shipment.received_date && (
                      <div>
                        <span className="text-slate-600 font-medium">Received Date:</span>
                        <p className="font-semibold text-slate-900 mt-1">
                          {new Date(shipment.received_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Supplier Information */}
          {supplier && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-cyan-500"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900 mb-3">Supplier Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-slate-600 font-medium">Supplier Name:</span>
                      <p className="font-bold text-slate-900 mt-1">{supplier.name || '-'}</p>
                    </div>
                    {supplier.supplier_code && (
                      <div>
                        <span className="text-slate-600 font-medium">Supplier Code:</span>
                        <p className="font-mono font-bold text-cyan-600 mt-1">
                          {supplier.supplier_code}
                        </p>
                      </div>
                    )}
                    {supplier.contact_person && (
                      <div>
                        <span className="text-slate-600 font-medium">Contact Person:</span>
                        <p className="font-semibold text-slate-900 mt-1">
                          {supplier.contact_person}
                        </p>
                      </div>
                    )}
                    {supplier.email && (
                      <div>
                        <span className="text-slate-600 font-medium">Email:</span>
                        <p className="font-semibold text-slate-900 mt-1">{supplier.email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Success Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Complete Traceability Verified</p>
              <p className="text-sm text-emerald-700">
                Full supply chain from supplier to inventory unit successfully traced
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
