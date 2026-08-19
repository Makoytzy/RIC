import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode, Barcode, Package, Printer, Download, QrCode,
  CheckCircle2, AlertTriangle, RefreshCw, Plus, X, Search,
  PackageCheck, Boxes, Copy, Eye, Settings, Edit, Trash2, ExternalLink
} from 'lucide-react';
import api from '../../../services/api.js';

export default function BarcodeGeneration() {
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [generatedBarcodes, setGeneratedBarcodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState(1);
  const [labelFormat, setLabelFormat] = useState('4x2');
  const [editingBarcode, setEditingBarcode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load barcode configuration
  useEffect(() => {
    loadConfig();
    loadProducts();
    loadGeneratedBarcodes();
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await api.get('/barcodes/config');
      if (data?.config) {
        setConfig(data.config);
        setLabelFormat(data.config.label_size || '4x2');
      }
    } catch (err) {
      console.warn('Using default barcode config');
      setConfig({
        format: 'CODE128',
        prefix: '',
        include_date_stamp: false,
        include_checksum: true,
        serial_length: 12,
        label_size: '4x2',
        printer_dpi: 300
      });
    }
  };

  const loadProducts = async () => {
    try {
      const { data } = await api.get('/products');
      
      if (!data?.products || data.products.length === 0) {
        console.warn('Using fallback product data');
        const fallbackProducts = [
          { id: '1', sku: 'SAW-15-130/90', brand: 'Red Indian Customs', model: 'Classic Sawtooth', dimensions: '130/90-15', category: 'Sawtooth' },
          { id: '2', sku: 'SAW-15-170/80', brand: 'Red Indian Customs', model: 'Classic Sawtooth', dimensions: '170/80-15', category: 'Sawtooth' },
          { id: '3', sku: 'END-17-70/90', brand: 'Red Indian Customs', model: 'Enduro Trail', dimensions: '70/90-17', category: 'Enduro' },
          { id: '4', sku: 'STD-17-90/90', brand: 'Red Indian Customs', model: 'ST Dual Sport', dimensions: '90/90-17', category: 'Dual Sport' },
        ];
        setProducts(fallbackProducts);
        return;
      }
      
      setProducts(data.products);
    } catch (err) {
      console.error('Product load error:', err);
      setError('Failed to load products');
      setTimeout(() => setError(''), 5000);
    }
  };

  const loadGeneratedBarcodes = async () => {
    try {
      const { data } = await api.get('/barcodes?limit=50');
      if (data?.barcodes) {
        setGeneratedBarcodes(data.barcodes);
      }
    } catch (err) {
      console.warn('Could not load existing barcodes:', err);
    }
  };

  const handleGenerateSingle = async (product) => {
    setLoading(true);
    try {
      const { data } = await api.post('/barcodes', {
        productId: product.id,
        batchId: null,
      });

      if (data?.barcode) {
        setGeneratedBarcodes(prev => [data.barcode, ...prev]);
        setSuccess(`Barcode generated: ${data.barcode.barcode_value}`);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Generate error:', err);
      setError(err.response?.data?.error || 'Failed to generate barcode');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBatch = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const results = [];
      for (const product of selectedProducts) {
        const { data } = await api.post('/barcodes', {
          productId: product.id,
          quantity: batchQuantity,
        });
        if (data?.barcodes) {
          results.push(...data.barcodes);
        } else if (data?.barcode) {
          // Handle single barcode response
          for (let i = 0; i < batchQuantity; i++) {
            const { data: singleData } = await api.post('/barcodes', {
              productId: product.id,
            });
            if (singleData?.barcode) results.push(singleData.barcode);
          }
        }
      }

      setGeneratedBarcodes(prev => [...results, ...prev]);
      setSuccess(`Generated ${results.length} barcodes successfully`);
      setSelectedProducts([]);
      setBatchMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Batch generate error:', err);
      setError(err.response?.data?.error || 'Failed to generate batch');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarcode = async (barcodeId) => {
    try {
      await api.delete(`/barcodes/${barcodeId}`);
      setGeneratedBarcodes(prev => prev.filter(b => b.id !== barcodeId));
      setSuccess('Barcode deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete barcode');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handlePrintBarcode = (barcode) => {
    const printWindow = window.open('', '_blank');
    const product = barcode.products;
    const productName = product ? `${product.brand || ''} ${product.model || ''}`.trim() : 'Product';
    const sku = product?.sku || 'N/A';
    const batch = barcode.batches?.batch_number || 'N/A';

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${barcode.barcode_value}</title>
          <style>
            @page { margin: 0; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .label { 
              border: 2px dashed #ccc; 
              padding: 20px; 
              width: 4in; 
              margin: 0 auto;
              page-break-after: always;
            }
            .header { font-size: 10px; font-weight: bold; margin-bottom: 10px; text-align: center; }
            .content { display: flex; gap: 15px; align-items: center; }
            .barcode-section { flex: 1; }
            .barcode { 
              font-family: 'Courier New', monospace; 
              font-size: 14px; 
              font-weight: bold; 
              letter-spacing: 2px; 
              text-align: center; 
              margin: 10px 0;
            }
            .bars { 
              height: 60px; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              gap: 1px;
              background: white;
              padding: 5px;
            }
            .bar { background: black; height: 100%; width: 2px; }
            .bar.wide { width: 4px; }
            .qr-section { flex: 0 0 80px; text-align: center; }
            .qr-section img { width: 80px; height: 80px; }
            .qr-label { font-size: 7px; margin-top: 3px; }
            .info { font-size: 9px; margin-top: 10px; line-height: 1.4; }
            @media print { 
              body { margin: 0; padding: 10px; } 
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">RED INDIAN CUSTOMS - TIRE REGISTRY</div>
            <div class="content">
              <div class="barcode-section">
                <div class="bars">
                  ${Array.from({ length: 40 }, (_, i) => 
                    `<div class="bar ${Math.random() > 0.5 ? 'wide' : ''}"></div>`
                  ).join('')}
                </div>
                <div class="barcode">${barcode.barcode_value}</div>
              </div>
              ${barcode.qr_code_data ? `
                <div class="qr-section">
                  <img src="${barcode.qr_code_data}" alt="QR Code" />
                  <div class="qr-label">Scan to Trace</div>
                </div>
              ` : ''}
            </div>
            <div class="info">
              <strong>Product:</strong> ${productName}<br>
              <strong>SKU:</strong> ${sku}<br>
              <strong>Batch:</strong> ${batch}<br>
              <strong>Generated:</strong> ${new Date(barcode.created_at).toLocaleString()}
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
  };

  const handlePrintAll = () => {
    if (generatedBarcodes.length === 0) return;
    
    const printWindow = window.open('', '_blank');
    const labels = generatedBarcodes.map(barcode => {
      const product = barcode.products;
      const productName = product ? `${product.brand || ''} ${product.model || ''}`.trim() : 'Product';
      const sku = product?.sku || 'N/A';
      const batch = barcode.batches?.batch_number || 'N/A';

      return `
        <div class="label">
          <div class="header">RED INDIAN CUSTOMS</div>
          <div class="content">
            <div class="barcode-section">
              <div class="bars">
                ${Array.from({ length: 30 }, () => 
                  `<div class="bar ${Math.random() > 0.5 ? 'wide' : ''}"></div>`
                ).join('')}
              </div>
              <div class="barcode">${barcode.barcode_value}</div>
            </div>
            ${barcode.qr_code_data ? `
              <div class="qr-section">
                <img src="${barcode.qr_code_data}" alt="QR" />
                <div class="qr-label">Trace</div>
              </div>
            ` : ''}
          </div>
          <div class="info">
            <strong>${productName}</strong> | SKU: ${sku} | Batch: ${batch}
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Print All Barcodes (${generatedBarcodes.length})</title>
          <style>
            @page { margin: 0; }
            body { font-family: Arial, sans-serif; margin: 10px; }
            .label { 
              border: 1px dashed #ccc; 
              padding: 15px; 
              width: 3.5in; 
              margin-bottom: 10px; 
              page-break-inside: avoid;
            }
            .header { font-size: 9px; font-weight: bold; margin-bottom: 8px; text-align: center; }
            .content { display: flex; gap: 10px; align-items: center; }
            .barcode-section { flex: 1; }
            .barcode { 
              font-family: 'Courier New', monospace; 
              font-size: 12px; 
              font-weight: bold; 
              letter-spacing: 1.5px; 
              text-align: center; 
              margin: 8px 0;
            }
            .bars { height: 50px; display: flex; align-items: center; justify-content: center; gap: 1px; }
            .bar { background: black; height: 100%; width: 2px; }
            .bar.wide { width: 3px; }
            .qr-section { flex: 0 0 60px; text-align: center; }
            .qr-section img { width: 60px; height: 60px; }
            .qr-label { font-size: 6px; margin-top: 2px; }
            .info { font-size: 8px; margin-top: 8px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${labels}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
  };

  const handleExport = () => {
    const csv = [
      ['Barcode', 'Product Name', 'SKU', 'Batch', 'Format', 'Status', 'Generated At'].join(','),
      ...generatedBarcodes.map(b => {
        const product = b.products;
        const productName = product ? `${product.brand || ''} ${product.model || ''}`.trim() : 'N/A';
        return [
          b.barcode_value,
          `"${productName}"`,
          b.products?.sku || 'N/A',
          b.batches?.batch_number || 'N/A',
          b.barcode_type,
          b.status,
          new Date(b.created_at).toLocaleString()
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcodes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.filter(p => p.id !== product.id) : [...prev, product];
    });
  };

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const productName = p.model && p.brand ? `${p.brand} ${p.model}` : (p.name || p.product_name || '');
    return productName.toLowerCase().includes(searchLower) ||
           (p.sku || '').toLowerCase().includes(searchLower) ||
           (p.dimensions || '').toLowerCase().includes(searchLower);
  });

  const viewTraceability = (barcode) => {
    window.open(`/trace/${barcode.barcode_value}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
            <ScanBarcode className="w-3.5 h-3.5" />
            Operational Staff
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Barcode & QR Generation</h1>
          <p className="text-slate-500 text-sm mt-0.5">Generate unique barcodes with QR codes for full traceability</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBatchMode(!batchMode)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              batchMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Boxes className="w-4 h-4" />
            {batchMode ? 'Batch Mode: ON' : 'Batch Mode'}
          </button>
          <button
            onClick={loadGeneratedBarcodes}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
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
            className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Product Selection */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Select Products
              </h2>
              {batchMode && selectedProducts.length > 0 && (
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {selectedProducts.length} selected
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-blue-500 outline-none"
              />
            </div>

            {/* Batch Controls */}
            {batchMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Quantity per Product:</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBatchQuantity(Math.max(1, batchQuantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={batchQuantity}
                      onChange={(e) => setBatchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center px-2 py-1 rounded-lg border border-slate-200 font-semibold"
                    />
                    <button
                      onClick={() => setBatchQuantity(batchQuantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleGenerateBatch}
                  disabled={loading || selectedProducts.length === 0}
                  className="w-full mt-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-sm font-semibold shadow-md disabled:opacity-50 transition-all"
                >
                  Generate {selectedProducts.length * batchQuantity} Barcodes
                </button>
              </motion.div>
            )}

            {/* Product List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No products found
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`p-3 rounded-xl border transition-all ${
                      batchMode && selectedProducts.find(p => p.id === product.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex items-start gap-2">
                        {batchMode && (
                          <input
                            type="checkbox"
                            checked={selectedProducts.some(p => p.id === product.id)}
                            onChange={() => toggleProductSelection(product)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        )}
                        <div>
                          <span className="text-sm font-semibold text-slate-900 block">
                            {product.brand && product.model ? `${product.brand} ${product.model}` : (product.name || product.product_name)}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            SKU: {product.sku} {product.dimensions && `• ${product.dimensions}`}
                          </p>
                        </div>
                      </div>
                      {!batchMode && (
                        <button
                          onClick={() => handleGenerateSingle(product)}
                          disabled={loading}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all disabled:opacity-50"
                        >
                          Generate
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Generated Barcodes */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-emerald-600" />
                Generated Barcodes ({generatedBarcodes.length})
              </h2>
              {generatedBarcodes.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                  >
                    <Download className="w-3.5 h-3.5 inline mr-1" />
                    Export CSV
                  </button>
                  <button
                    onClick={handlePrintAll}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
                  >
                    <Printer className="w-3.5 h-3.5 inline mr-1" />
                    Print All
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {generatedBarcodes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
                  <ScanBarcode className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No barcodes generated yet</p>
                  <p className="text-xs mt-1">Select a product to generate a barcode</p>
                </div>
              ) : (
                generatedBarcodes.map(barcode => {
                  const product = barcode.products;
                  const productName = product ? `${product.brand || ''} ${product.model || ''}`.trim() : 'Unknown Product';

                  return (
                    <div key={barcode.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{productName}</p>
                          <p className="text-xs text-slate-500">SKU: {product?.sku || 'N/A'}</p>
                          {barcode.batches?.batch_number && (
                            <p className="text-xs text-slate-500">Batch: {barcode.batches.batch_number}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            {barcode.barcode_type}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            barcode.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {barcode.status}
                          </span>
                        </div>
                      </div>

                      {/* Barcode + QR Display */}
                      <div className="p-3 rounded-lg bg-white border border-slate-200 mb-3">
                        <div className="flex gap-3 items-center">
                          {/* CODE128 Barcode Visual */}
                          <div className="flex-1">
                            <div className="h-12 flex items-center justify-center gap-0.5 mb-2">
                              {Array.from({ length: 32 }, (_, i) => (
                                <div
                                  key={i}
                                  className="bg-slate-950 h-full"
                                  style={{ width: `${[2, 3, 1, 4, 2][i % 5]}px` }}
                                />
                              ))}
                            </div>
                            <p className="font-mono text-xs font-bold text-center tracking-wider text-slate-900">
                              {barcode.barcode_value}
                            </p>
                          </div>

                          {/* QR Code */}
                          {barcode.qr_code_data && (
                            <div className="flex-shrink-0 text-center">
                              <img 
                                src={barcode.qr_code_data} 
                                alt="QR Code" 
                                className="w-16 h-16 border border-slate-200 rounded"
                              />
                              <p className="text-[9px] text-slate-500 mt-1">Scan to Trace</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePrintBarcode(barcode)}
                          className="flex-1 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 inline mr-1" />
                          Print
                        </button>
                        <button
                          onClick={() => viewTraceability(barcode)}
                          className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold transition-all"
                          title="View Traceability"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(barcode.barcode_value);
                            setSuccess('Barcode copied to clipboard!');
                            setTimeout(() => setSuccess(''), 2000);
                          }}
                          className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                          title="Copy"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(barcode.id)}
                          className="px-3 py-2 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-semibold transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Current Config Info */}
          {config && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1">
                <Settings className="w-3.5 h-3.5" />
                Current Configuration
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Format:</span>
                  <span className="ml-2 font-semibold text-slate-900">{config.format}</span>
                </div>
                <div>
                  <span className="text-slate-500">Prefix:</span>
                  <span className="ml-2 font-semibold text-slate-900">{config.prefix || 'None'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Checksum:</span>
                  <span className="ml-2 font-semibold text-slate-900">
                    {config.include_checksum ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">QR Codes:</span>
                  <span className="ml-2 font-semibold text-emerald-700">Enabled</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Delete Barcode?</h3>
                  <p className="text-sm text-slate-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBarcode(deleteConfirm)}
                  className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
