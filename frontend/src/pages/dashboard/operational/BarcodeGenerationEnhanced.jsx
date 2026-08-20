import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode, Barcode, Package, Printer, Download, QrCode,
  CheckCircle2, AlertTriangle, RefreshCw, Boxes, Search,
  Eye, ExternalLink, Layers, Calendar, Hash, ShoppingCart
} from 'lucide-react';
import { 
  fetchBatches, 
  fetchProducts,
  fetchShipments 
} from '../../../services/api';

export default function BarcodeGenerationEnhanced() {
  // State
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [format, setFormat] = useState('both'); // 'barcode', 'qr', 'both'
  const [generatedBarcodes, setGeneratedBarcodes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [batchesData, productsData, shipmentsData] = await Promise.all([
        fetchBatches({ status: 'ACTIVE', limit: 100 }),
        fetchProducts({ status: 'active', limit: 100 }),
        fetchShipments({ status: 'RECEIVED', limit: 100 })
      ]);

      setBatches(batchesData.batches || []);
      setProducts(productsData.products || []);
      setShipments(shipmentsData.shipments || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBarcodes = async () => {
    if (!selectedBatch) {
      setError('Please select a batch first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (quantity < 1 || quantity > 1000) {
      setError('Quantity must be between 1 and 1000');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the barcode generation
      const mockBarcodes = Array.from({ length: quantity }, (_, i) => ({
        id: `mock-${Date.now()}-${i}`,
        barcode_number: `RIC${String(Date.now() + i).padStart(12, '0').slice(-12)}`,
        batch_id: selectedBatch.id,
        batch_number: selectedBatch.batch_number,
        product: selectedBatch.products,
        format: format,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      }));

      setGeneratedBarcodes(prev => [...mockBarcodes, ...prev]);
      setSuccess(`Successfully generated ${quantity} barcode${quantity > 1 ? 's' : ''}!`);
      setTimeout(() => setSuccess(''), 5000);
      
      // Reset form
      setQuantity(1);
    } catch (err) {
      console.error('Error generating barcodes:', err);
      setError(err.message || 'Failed to generate barcodes');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (barcode) => {
    // Open print dialog with barcode
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${barcode.barcode_number}</title>
          <style>
            @page { size: 4in 2in; margin: 0.25in; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .label {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              border: 2px solid #000;
              padding: 10px;
            }
            .header { font-size: 10px; font-weight: bold; margin-bottom: 10px; }
            .barcode { 
              font-family: 'Libre Barcode 128', monospace; 
              font-size: 48px; 
              margin: 10px 0;
            }
            .barcode-text { 
              font-family: monospace; 
              font-size: 14px; 
              letter-spacing: 2px;
              margin-bottom: 10px;
            }
            .info { font-size: 8px; text-align: center; line-height: 1.3; }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">RED INDIAN CUSTOMS</div>
            <div class="barcode">${barcode.barcode_number}</div>
            <div class="barcode-text">${barcode.barcode_number}</div>
            <div class="info">
              ${barcode.product ? `${barcode.product.brand} ${barcode.product.model}` : ''}<br>
              SKU: ${barcode.product?.sku || 'N/A'} | Batch: ${barcode.batch_number}
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
  };

  const handlePrintAll = () => {
    if (generatedBarcodes.length === 0) return;

    const printWindow = window.open('', '_blank');
    const labels = generatedBarcodes.map(barcode => `
      <div class="label">
        <div class="header">RED INDIAN CUSTOMS</div>
        <div class="barcode">${barcode.barcode_number}</div>
        <div class="barcode-text">${barcode.barcode_number}</div>
        <div class="info">
          ${barcode.product ? `${barcode.product.brand} ${barcode.product.model}` : ''}<br>
          SKU: ${barcode.product?.sku || 'N/A'} | Batch: ${barcode.batch_number}
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print All Barcodes (${generatedBarcodes.length})</title>
          <style>
            @page { size: 4in 2in; margin: 0.25in; }
            body { font-family: Arial, sans-serif; margin: 0; }
            .label {
              width: 4in;
              height: 2in;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              border: 2px solid #000;
              padding: 10px;
              page-break-after: always;
            }
            .header { font-size: 10px; font-weight: bold; margin-bottom: 10px; }
            .barcode { 
              font-family: 'Libre Barcode 128', monospace; 
              font-size: 48px; 
              margin: 10px 0;
            }
            .barcode-text { 
              font-family: monospace; 
              font-size: 14px; 
              letter-spacing: 2px;
              margin-bottom: 10px;
            }
            .info { font-size: 8px; text-align: center; line-height: 1.3; }
          </style>
        </head>
        <body>
          ${labels}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
  };

  const handleExportCSV = () => {
    if (generatedBarcodes.length === 0) return;

    const csv = [
      ['Barcode Number', 'Batch', 'Product', 'SKU', 'Format', 'Generated At'].join(','),
      ...generatedBarcodes.map(b => [
        b.barcode_number,
        b.batch_number,
        b.product ? `"${b.product.brand} ${b.product.model}"` : 'N/A',
        b.product?.sku || 'N/A',
        b.format,
        new Date(b.created_at).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcodes-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredBatches = batches.filter(batch => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (batch.batch_number || '').toLowerCase().includes(searchLower) ||
      (batch.products?.sku || '').toLowerCase().includes(searchLower) ||
      (batch.products?.brand || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg mb-2">
              <ScanBarcode size={14} />
              OPERATIONAL STAFF
            </div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl">
                <Barcode className="text-white" size={24} />
              </div>
              Barcode & QR Generation
            </h1>
            <p className="text-slate-600 mt-2">
              Generate unique barcodes with QR codes for full traceability
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-3 rounded-xl bg-white border-2 border-slate-200 hover:border-blue-400 transition-all shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={20} className="text-slate-700" />
          </button>
        </div>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 flex items-center gap-3 shadow-md"
          >
            <CheckCircle2 size={20} className="text-green-600" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3 shadow-md"
          >
            <AlertTriangle size={20} className="text-red-600" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Batch Selection & Generation */}
        <div className="space-y-4">
          {/* Batch Selector Card */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <Layers className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Select Batch</h2>
                <p className="text-sm text-slate-600">Choose a batch to generate barcodes</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search batches..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
              />
            </div>

            {/* Batch List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
                  <p className="text-slate-600">Loading batches...</p>
                </div>
              ) : filteredBatches.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium mb-2">No batches found</p>
                  <p className="text-sm text-slate-500">
                    {batches.length === 0 
                      ? 'Create a batch in Batch Management first' 
                      : 'Try a different search term'}
                  </p>
                </div>
              ) : (
                filteredBatches.map(batch => (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedBatch?.id === batch.id
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-slate-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-slate-900">{batch.batch_number}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {batch.status}
                          </span>
                        </div>
                        
                        {batch.products && (
                          <div className="space-y-1">
                            <p className="text-sm text-slate-600 flex items-center gap-2">
                              <Package size={14} />
                              {batch.products.brand} {batch.products.model}
                            </p>
                            <p className="text-xs text-slate-500 font-mono">
                              SKU: {batch.products.sku}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {batch.batch_month}/{batch.batch_year}
                          </span>
                          {batch.shipments && (
                            <span className="flex items-center gap-1">
                              <ShoppingCart size={12} />
                              {batch.shipments.shipment_number}
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedBatch?.id === batch.id && (
                        <CheckCircle2 size={20} className="text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Generation Controls */}
          {selectedBatch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ScanBarcode size={20} className="text-indigo-600" />
                Generation Settings
              </h3>

              {/* Format Selection */}
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Barcode Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFormat('barcode')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      format === 'barcode'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <Barcode className="mx-auto mb-1" size={20} />
                    <span className="text-xs font-bold">CODE128</span>
                  </button>
                  <button
                    onClick={() => setFormat('qr')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      format === 'qr'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <QrCode className="mx-auto mb-1" size={20} />
                    <span className="text-xs font-bold">QR Code</span>
                  </button>
                  <button
                    onClick={() => setFormat('both')}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      format === 'both'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <Boxes className="mx-auto mb-1" size={20} />
                    <span className="text-xs font-bold">Both</span>
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xl"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                    className="flex-1 text-center text-2xl font-bold py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(1000, quantity + 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-xl"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Maximum: 1000 barcodes per batch
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateBarcodes}
                disabled={loading || !selectedBatch}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Generate {quantity} Barcode{quantity > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Right: Generated Barcodes */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Generated Barcodes</h2>
                <p className="text-sm text-slate-600">{generatedBarcodes.length} items</p>
              </div>
            </div>

            {generatedBarcodes.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all"
                  title="Export CSV"
                >
                  <Download size={18} className="text-slate-700" />
                </button>
                <button
                  onClick={handlePrintAll}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
                >
                  <Printer size={16} />
                  Print All
                </button>
              </div>
            )}
          </div>

          {/* Barcodes List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {generatedBarcodes.length === 0 ? (
              <div className="text-center py-12">
                <ScanBarcode className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-medium mb-2">No barcodes generated yet</p>
                <p className="text-sm text-slate-500">
                  Select a batch and click "Generate" to create barcodes
                </p>
              </div>
            ) : (
              generatedBarcodes.map(barcode => (
                <div
                  key={barcode.id}
                  className="p-4 rounded-xl border border-slate-200 hover:shadow-md transition-all bg-gradient-to-br from-white to-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash size={16} className="text-slate-400" />
                        <span className="font-mono font-bold text-slate-900">
                          {barcode.barcode_number}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          {barcode.status}
                        </span>
                      </div>

                      {barcode.product && (
                        <div className="text-sm text-slate-600 mb-1">
                          {barcode.product.brand} {barcode.product.model}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Boxes size={12} />
                          {barcode.batch_number}
                        </span>
                        <span>
                          {barcode.format === 'both' ? 'Barcode + QR' : barcode.format}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => window.open(`/trace/${barcode.barcode_number}`, '_blank')}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-all"
                        title="View Traceability"
                      >
                        <Eye size={16} className="text-blue-700" />
                      </button>
                      <button
                        onClick={() => handlePrint(barcode)}
                        className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-all"
                        title="Print"
                      >
                        <Printer size={16} className="text-emerald-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
