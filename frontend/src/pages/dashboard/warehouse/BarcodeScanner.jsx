import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode, QrCode, Search, Package, AlertCircle, CheckCircle2,
  MapPin, Calendar, Truck, Box, History, ExternalLink, RefreshCw,
  Camera, Keyboard, X, Info, ArrowRight, Eye, Boxes, Factory
} from 'lucide-react';
import api from '../../../services/api.js';

export default function BarcodeScanner() {
  const [scanMode, setScanMode] = useState('manual'); // 'manual', 'camera', 'keyboard'
  const [scanInput, setScanInput] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);
  const keyboardBufferRef = useRef('');
  const keyboardTimerRef = useRef(null);

  // Keyboard scanner mode - listens for rapid input (like from handheld scanner)
  useEffect(() => {
    if (scanMode !== 'keyboard') return;

    const handleKeyPress = (e) => {
      // Ignore if typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Enter key triggers scan
      if (e.key === 'Enter' && keyboardBufferRef.current) {
        handleScan(keyboardBufferRef.current);
        keyboardBufferRef.current = '';
        return;
      }

      // Build up the barcode string
      if (e.key.length === 1) {
        keyboardBufferRef.current += e.key;

        // Auto-scan after 100ms of no input (typical for scanners)
        clearTimeout(keyboardTimerRef.current);
        keyboardTimerRef.current = setTimeout(() => {
          if (keyboardBufferRef.current.length >= 8) {
            handleScan(keyboardBufferRef.current);
            keyboardBufferRef.current = '';
          }
        }, 100);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      clearTimeout(keyboardTimerRef.current);
    };
  }, [scanMode]);

  // Focus input on manual mode
  useEffect(() => {
    if (scanMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  const handleScan = async (value) => {
    if (!value || value.trim().length === 0) {
      setError('Please enter a barcode value');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setScannedData(null);

    try {
      const { data } = await api.get(`/barcodes/trace/${value.trim()}`);
      
      if (data?.barcode) {
        setScannedData(data.barcode);
        setSuccess(`Barcode ${value} scanned successfully`);
        setScanHistory(prev => [{
          ...data.barcode,
          scannedAt: new Date().toISOString()
        }, ...prev.slice(0, 19)]); // Keep last 20 scans
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Barcode not found in system');
        setTimeout(() => setError(''), 5000);
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.response?.data?.error || 'Failed to scan barcode');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
      setScanInput('');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleScan(scanInput);
  };

  const viewTraceability = (barcodeValue) => {
    window.open(`/trace/${barcodeValue}`, '_blank');
  };

  const rescanBarcode = (barcodeValue) => {
    setScanInput(barcodeValue);
    handleScan(barcodeValue);
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -m-6 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 mb-2">
              <ScanBarcode className="w-3.5 h-3.5" />
              WAREHOUSE STAFF
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
              Barcode & QR Scanner
            </h1>
            <p className="text-slate-600 text-sm flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              Scan barcodes to verify inventory, track shipments, and process orders
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-sm flex items-center gap-2 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 text-sm flex items-center gap-2 shadow-md"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scan Input */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scan Mode Selector */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-lg">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-purple-600" />
              Scan Method
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setScanMode('manual')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scanMode === 'manual'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <Search className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'manual' ? 'text-purple-600' : 'text-slate-400'}`} />
                <div className="text-xs font-bold text-slate-900">Manual Entry</div>
                <div className="text-[10px] text-slate-500 mt-1">Type barcode</div>
              </button>
              <button
                onClick={() => setScanMode('keyboard')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  scanMode === 'keyboard'
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-md'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <Keyboard className={`w-6 h-6 mx-auto mb-2 ${scanMode === 'keyboard' ? 'text-purple-600' : 'text-slate-400'}`} />
                <div className="text-xs font-bold text-slate-900">Handheld Scanner</div>
                <div className="text-[10px] text-slate-500 mt-1">Use scanner gun</div>
              </button>
              <button
                onClick={() => setScanMode('camera')}
                disabled
                className="p-4 rounded-xl border-2 border-slate-200 opacity-50 cursor-not-allowed"
              >
                <Camera className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <div className="text-xs font-bold text-slate-900">Camera</div>
                <div className="text-[10px] text-slate-500 mt-1">Coming soon</div>
              </button>
            </div>
          </div>

          {/* Scan Input */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-lg">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              {scanMode === 'keyboard' ? 'Scan Barcode Now' : 'Enter Barcode'}
            </h2>

            {scanMode === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={scanInput}
                    onChange={(e) => setScanInput(e.target.value)}
                    placeholder="Enter barcode value..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 text-sm font-mono focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !scanInput.trim()}
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold transition-all disabled:opacity-50 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <ScanBarcode className="w-4 h-4" />
                      Scan Barcode
                    </>
                  )}
                </button>
              </form>
            )}

            {scanMode === 'keyboard' && (
              <div className="space-y-4">
                <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center animate-pulse">
                      <Keyboard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Ready to Scan</div>
                      <div className="text-xs text-slate-600">Point scanner at barcode and trigger</div>
                    </div>
                  </div>
                  {loading && (
                    <div className="flex items-center gap-2 text-sm text-purple-700">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing scan...</span>
                    </div>
                  )}
                </div>
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-800">
                      <strong>Tip:</strong> Make sure no input fields are focused. The scanner will automatically detect and process barcodes.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Scanned Data Display */}
          {scannedData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-white to-slate-50 p-5 border-2 border-emerald-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Scan Result
                </h2>
                <button
                  onClick={() => setScannedData(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Barcode Value */}
              <div className="p-4 rounded-lg bg-white border border-slate-200 mb-4">
                <div className="text-xs text-slate-500 mb-1">Barcode</div>
                <div className="font-mono text-lg font-bold text-slate-900">{scannedData.barcode_value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    scannedData.status === 'active'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {scannedData.status}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded">
                    {scannedData.barcode_type}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              {scannedData.products && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <div className="text-xs font-bold text-blue-900">Product Information</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-semibold text-slate-900">
                        {scannedData.products.brand} {scannedData.products.model}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">SKU:</span>
                      <span className="font-mono font-semibold text-slate-900">{scannedData.products.sku}</span>
                    </div>
                    {scannedData.products.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Size:</span>
                        <span className="font-semibold text-slate-900">{scannedData.products.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Batch Info */}
              {scannedData.batches && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Boxes className="w-4 h-4 text-purple-600" />
                    <div className="text-xs font-bold text-purple-900">Batch Information</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Batch #:</span>
                      <span className="font-mono font-semibold text-slate-900">{scannedData.batches.batch_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-semibold text-slate-900 capitalize">{scannedData.batches.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipment Info */}
              {scannedData.batches?.shipments && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <div className="text-xs font-bold text-amber-900">Shipment Information</div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Shipment #:</span>
                      <span className="font-mono font-semibold text-slate-900">{scannedData.batches.shipments.shipment_number}</span>
                    </div>
                    {scannedData.batches.shipments.container_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Container:</span>
                        <span className="font-mono font-semibold text-slate-900">{scannedData.batches.shipments.container_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => viewTraceability(scannedData.barcode_value)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Full Traceability
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column: Scan History */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Recent Scans
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-semibold">
                {scanHistory.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {scanHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <History className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">No scans yet</p>
                  <p className="text-xs">Scan history will appear here</p>
                </div>
              ) : (
                scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs font-bold text-slate-900 truncate">
                          {scan.barcode_value}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(scan.scannedAt).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => rescanBarcode(scan.barcode_value)}
                        className="p-1 rounded hover:bg-purple-50 text-purple-600 transition-all"
                        title="Rescan"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {scan.products && (
                      <div className="text-xs text-slate-600 truncate">
                        {scan.products.brand} {scan.products.model}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-900 to-indigo-900 p-5 border-2 border-purple-700 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <ScanBarcode className="w-4 h-4" />
              Session Stats
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-200">Total Scans</span>
                <span className="text-lg font-bold text-white">{scanHistory.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-200">Active Mode</span>
                <span className="text-xs font-bold text-white capitalize">{scanMode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(241 245 249);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(147 51 234), rgb(79 70 229));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(126 34 206), rgb(67 56 202));
        }
      `}</style>
    </div>
  );
}
