/**
 * ============================================================================
 * RELOCATE INVENTORY PAGE - OPERATIONAL STAFF & MANAGER
 * ============================================================================
 * Page for relocating tires when racks are full or reorganization is needed
 * Only accessible to Operational Staff and Manager roles
 * ============================================================================
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode,
  Package,
  MapPin,
  MoveRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Box,
  Warehouse,
  FileText,
  History
} from 'lucide-react';
import api from '../../../services/api.js';
import PremiumModal from '../../../components/shared/PremiumModal.jsx';

export default function RelocateInventory() {
  const [scanValue, setScanValue] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [warehouses, setWarehouses] = useState([]);
  const [racks, setRacks] = useState([]);
  const [rackLocations, setRackLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [relocating, setRelocating] = useState(false);
  const [error, setError] = useState('');
  
  // Relocation form
  const [relocationData, setRelocationData] = useState({
    newWarehouseId: '',
    newRackId: '',
    newRackLocationId: '',
    reason: '',
    notes: ''
  });

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const inputRef = useRef(null);

  const reasonOptions = [
    { value: 'rack_full', label: 'Rack Full - Moving to available space' },
    { value: 'reorganization', label: 'Reorganization - Optimizing storage' },
    { value: 'maintenance', label: 'Maintenance - Rack needs repair' },
    { value: 'damage', label: 'Damage - Moving away from damaged area' },
    { value: 'optimization', label: 'Optimization - Improving efficiency' },
    { value: 'other', label: 'Other - See notes' }
  ];

  const handleScan = async (e) => {
    e.preventDefault();
    if (!scanValue.trim()) {
      setError('Please enter a barcode value');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/warehouse/scan/${encodeURIComponent(scanValue.trim())}`);

      if (data?.success && data?.inventory_unit) {
        setCurrentItem(data.inventory_unit);
        
        // Load warehouses for relocation
        const whResponse = await api.get('/warehouses');
        setWarehouses(whResponse.data.warehouses || []);
      } else {
        setError('Barcode not found in system');
        setCurrentItem(null);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.error || 'Failed to scan barcode');
      setCurrentItem(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRacks = async (warehouseId, productCategory) => {
    try {
      const { data } = await api.get(`/racks?warehouse_id=${warehouseId}&size_category=${productCategory || 'General'}`);
      setRacks(data.racks || []);
    } catch (err) {
      console.error('Error loading racks:', err);
      setRacks([]);
    }
  };

  const loadRackLocations = async (rackId) => {
    try {
      const { data } = await api.get(`/rack-locations?rack_id=${rackId}&status=available`);
      setRackLocations(data.locations || []);
    } catch (err) {
      console.error('Error loading rack locations:', err);
      setRackLocations([]);
    }
  };

  const handleWarehouseChange = (warehouseId) => {
    setRelocationData({
      ...relocationData,
      newWarehouseId: warehouseId,
      newRackId: '',
      newRackLocationId: ''
    });
    setRacks([]);
    setRackLocations([]);
    
    if (warehouseId && currentItem?.product) {
      loadRacks(warehouseId, currentItem.product.category);
    }
  };

  const handleRackChange = (rackId) => {
    setRelocationData({
      ...relocationData,
      newRackId: rackId,
      newRackLocationId: ''
    });
    setRackLocations([]);
    
    if (rackId) {
      loadRackLocations(rackId);
    }
  };

  const handleRelocate = async () => {
    if (!relocationData.newRackLocationId) {
      setModalMessage('Please select a new position for this tire');
      setShowErrorModal(true);
      return;
    }

    if (!relocationData.reason) {
      setModalMessage('Please select a reason for relocation');
      setShowErrorModal(true);
      return;
    }

    setRelocating(true);

    try {
      const response = await api.post('/inventory/relocate', {
        inventory_unit_id: currentItem.inventory_unit_id,
        new_rack_location_id: relocationData.newRackLocationId,
        reason: relocationData.reason,
        notes: relocationData.notes
      });

      if (response.data?.success) {
        setModalMessage(`Successfully relocated tire from ${currentItem.warehouse_location?.position_code} to new location!`);
        setShowSuccessModal(true);
        
        // Reset form
        setCurrentItem(null);
        setScanValue('');
        setRelocationData({
          newWarehouseId: '',
          newRackId: '',
          newRackLocationId: '',
          reason: '',
          notes: ''
        });
        setRacks([]);
        setRackLocations([]);
      }
    } catch (err) {
      console.error('Relocation error:', err);
      setModalMessage(err.response?.data?.error || 'Failed to relocate inventory. Please try again.');
      setShowErrorModal(true);
    } finally {
      setRelocating(false);
    }
  };

  const clearForm = () => {
    setCurrentItem(null);
    setScanValue('');
    setRelocationData({
      newWarehouseId: '',
      newRackId: '',
      newRackLocationId: '',
      reason: '',
      notes: ''
    });
    setRacks([]);
    setRackLocations([]);
    setError('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -m-6 p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 mb-2">
          <MoveRight className="w-3 h-3" />
          OPERATIONAL STAFF & MANAGER
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent tracking-tight">
          Relocate Inventory
        </h1>
        <p className="text-slate-600 text-sm">Move tires to new locations when racks are full</p>
      </div>

      {/* Modals */}
      <PremiumModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        title="Relocation Successful"
        message={modalMessage}
      />

      <PremiumModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        type="error"
        title="Relocation Failed"
        message={modalMessage}
      />

      <div className="max-w-5xl mx-auto">
        {/* Step 1: Scan Barcode */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <ScanBarcode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Scan Tire to Relocate</h2>
              <p className="text-xs text-slate-600">Scan the barcode of the tire you want to move</p>
            </div>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="text"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                placeholder="Scan or enter barcode (e.g., RIC000000000001)"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-mono"
                disabled={loading || currentItem}
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || !scanValue.trim() || currentItem}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <ScanBarcode className="w-5 h-5" />
                    Scan Barcode
                  </>
                )}
              </button>

              {currentItem && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  Clear
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Step 2: Current Location (only show when scanned) */}
        <AnimatePresence>
          {currentItem && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Current Location */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-300 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Current Location</h2>
                    <p className="text-xs text-slate-600">This tire is currently stored here</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-xs font-semibold text-slate-600 mb-1">Product</div>
                    <div className="text-sm font-bold text-slate-900">
                      {currentItem.product?.brand} {currentItem.product?.model}
                    </div>
                    <div className="text-xs font-mono text-slate-600 mt-1">
                      SKU: {currentItem.product?.sku}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-xs font-semibold text-amber-900 mb-1">Current Position</div>
                    <div className="text-lg font-bold font-mono text-amber-900">
                      {currentItem.warehouse_location?.position_code || 'Not Assigned'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Select New Location */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-emerald-300 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <MoveRight className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Step 2: Select New Location</h2>
                    <p className="text-xs text-slate-600">Choose where to move this tire</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Warehouse Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Warehouse *
                    </label>
                    <select
                      value={relocationData.newWarehouseId}
                      onChange={(e) => handleWarehouseChange(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                    >
                      <option value="">Select warehouse...</option>
                      {warehouses.map(wh => (
                        <option key={wh.id} value={wh.id}>
                          {wh.name} ({wh.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rack Selector */}
                  {relocationData.newWarehouseId && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Rack *
                      </label>
                      <select
                        value={relocationData.newRackId}
                        onChange={(e) => handleRackChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      >
                        <option value="">Select rack...</option>
                        {racks.map(rack => (
                          <option key={rack.id} value={rack.id}>
                            {rack.rack_code} - {rack.designated_size} ({rack.total_capacity - rack.current_count} spaces available)
                          </option>
                        ))}
                      </select>
                      {racks.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          No racks available for this product size
                        </p>
                      )}
                    </div>
                  )}

                  {/* Position Selector */}
                  {relocationData.newRackId && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Position *
                      </label>
                      <select
                        value={relocationData.newRackLocationId}
                        onChange={(e) => setRelocationData({ ...relocationData, newRackLocationId: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                      >
                        <option value="">Select position...</option>
                        {rackLocations.map(loc => (
                          <option key={loc.id} value={loc.id}>
                            {loc.position_code} - {loc.available_space} spaces available
                          </option>
                        ))}
                      </select>
                      {rackLocations.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          No available positions in this rack
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reason for Relocation *
                    </label>
                    <select
                      value={relocationData.reason}
                      onChange={(e) => setRelocationData({ ...relocationData, reason: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none"
                    >
                      <option value="">Select reason...</option>
                      {reasonOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={relocationData.notes}
                      onChange={(e) => setRelocationData({ ...relocationData, notes: e.target.value })}
                      placeholder="Add any additional details about this relocation..."
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none resize-none"
                    />
                  </div>

                  {/* Relocate Button */}
                  <button
                    onClick={handleRelocate}
                    disabled={relocating || !relocationData.newRackLocationId || !relocationData.reason}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {relocating ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Relocating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Complete Relocation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
