/**
 * ============================================================================
 * SCAN PRODUCTS PAGE - WAREHOUSE STAFF
 * ============================================================================
 * Read-only scanning page for warehouse staff to verify tire locations
 * Staff can scan barcode and see where the tire should be placed
 * ============================================================================
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode,
  Package,
  MapPin,
  Box,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  Warehouse,
  Layers,
  Grid3x3,
  Hash,
  RefreshCw,
  Camera,
  Keyboard
} from 'lucide-react';
import api from '../../../services/api.js';

export default function ScanProducts() {
  const [scanValue, setScanValue] = useState('');
  const [scanMode, setScanMode] = useState('manual'); // 'manual' or 'camera'
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    // Auto-focus input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleScan = async (value) => {
    if (!value || !value.trim()) {
      setError('Please enter a barcode value');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await api.get(`/warehouse/scan/${encodeURIComponent(value.trim())}`);

      if (data?.success && data?.inventory_unit) {
        setScannedData(data.inventory_unit);
        setScanHistory(prev => [
          { 
            barcode: value.trim(), 
            timestamp: new Date().toISOString(),
            data: data.inventory_unit 
          },
          ...prev.slice(0, 9) // Keep last 10 scans
        ]);
        setScanValue('');
      } else {
        setError('Barcode not found in system');
        setScannedData(null);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.error || 'Failed to scan barcode. Please try again.');
      setScannedData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    handleScan(scanValue);
  };

  const handleKeyPress = (e) => {
    // Support barcode scanner that sends Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan(scanValue);
    }
  };

  const handleRescan = (barcode) => {
    setScanValue(barcode);
    handleScan(barcode);
  };

  const clearResults = () => {
    setScannedData(null);
    setError('');
    setScanValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -m-6 p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-2">
          <Warehouse className="w-3 h-3" />
          WAREHOUSE STAFF
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent tracking-tight">
          Scan Products
        </h1>
        <p className="text-slate-600 text-sm">Scan barcode to view tire location (Read-Only)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scanner */}
        <div className="space-y-4">
          {/* Scan Input Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Scan Barcode</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScanMode('manual')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    scanMode === 'manual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5 inline mr-1" />
                  Manual
                </button>
                <button
                  onClick={() => setScanMode('camera')}
                  disabled
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                  title="Camera scanning coming soon"
                >
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  Camera
                </button>
              </div>
            </div>

            {/* Manual Input */}
            {scanMode === 'manual' && (
              <form onSubmit={handleManualScan} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Enter Barcode Value
                  </label>
                  <div className="relative">
                    <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={scanValue}
                      onChange={(e) => setScanValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Scan or type barcode (e.g., RIC000000000001)"
                      className="w-full pl-11 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    💡 Tip: Use handheld scanner or type manually
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !scanValue.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ScanBarcode className="w-5 h-5" />
                      Scan Product
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Scan History */}
          {scanHistory.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Recent Scans</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {scanHistory.map((scan, index) => (
                  <button
                    key={index}
                    onClick={() => handleRescan(scan.barcode)}
                    className="w-full p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-mono font-semibold text-slate-900 truncate">
                        {scan.barcode}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(scan.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Scanned Results */}
        <div>
          <AnimatePresence mode="wait">
            {scannedData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-4"
              >
                {/* Success Header */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Product Found!</h2>
                      <p className="text-emerald-100 text-sm">Location details below</p>
                    </div>
                  </div>
                  <div className="font-mono text-lg font-bold bg-white/20 px-4 py-2 rounded-lg mt-3">
                    {scannedData.barcode_value}
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Product Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-semibold text-slate-600">Product:</span>
                      <span className="text-sm font-bold text-slate-900">
                        {scannedData.product?.brand} {scannedData.product?.model}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-semibold text-slate-600">SKU:</span>
                      <span className="text-sm font-mono font-bold text-blue-600">
                        {scannedData.product?.sku}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-semibold text-slate-600">Batch:</span>
                      <span className="text-sm font-mono font-bold text-purple-600">
                        {scannedData.batch?.batch_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Warehouse Location */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-amber-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Warehouse Location</h3>
                  </div>

                  {scannedData.warehouse_location?.position_code && scannedData.warehouse_location.position_code !== 'Not assigned' ? (
                    <div className="space-y-4">
                      {/* Position Code - Large Display */}
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-amber-300">
                        <div className="text-xs font-semibold text-amber-900 mb-1">POSITION CODE</div>
                        <div className="text-2xl font-bold font-mono text-amber-900 tracking-wide">
                          {scannedData.warehouse_location.position_code}
                        </div>
                      </div>

                      {/* Location Breakdown */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Warehouse className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-600">Rack</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {scannedData.warehouse_location.rack_code || 'N/A'}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-600">Shelf</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {scannedData.warehouse_location.shelf || 'N/A'}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Grid3x3 className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-600">Section</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {scannedData.warehouse_location.section || 'N/A'}
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="w-4 h-4 text-slate-600" />
                            <span className="text-xs font-semibold text-slate-600">Subsection</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">
                            {scannedData.warehouse_location.subsection || 'N/A'}
                          </div>
                        </div>
                      </div>

                      {/* Navigation Instructions */}
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Navigation className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-sm font-bold text-blue-900 mb-1">
                              How to Find This Tire:
                            </div>
                            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                              <li>Go to <strong>{scannedData.warehouse_location.rack_code}</strong></li>
                              <li>Find Shelf <strong>{scannedData.warehouse_location.shelf}</strong></li>
                              <li>Locate Section <strong>{scannedData.warehouse_location.section}</strong></li>
                              <li>Look in Subsection <strong>{scannedData.warehouse_location.subsection}</strong></li>
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="text-sm font-bold text-amber-900">Location Not Assigned</div>
                          <div className="text-xs text-amber-700 mt-1">
                            This tire has not been assigned to a warehouse location yet. Contact operational staff.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={clearResults}
                    className="flex-1 py-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
                  >
                    Scan Another
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ScanBarcode className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Ready to Scan</h3>
                <p className="text-sm text-slate-600">
                  Use your scanner or enter a barcode manually to view tire location
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
