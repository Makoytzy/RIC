import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode, Barcode, Package, Printer, Download, QrCode,
  CheckCircle2, AlertTriangle, RefreshCw, Plus, X, Search,
  PackageCheck, Boxes, Copy, Eye, Settings, Edit, Trash2, ExternalLink
} from 'lucide-react';
import api from '../../../services/api.js';
import BarcodeLabel from '../../../components/barcode/BarcodeLabel';

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
        console.info('📦 Using demo product catalog (database products not available)');
        // Demo products with complete data structure
        const fallbackProducts = [
          { 
            id: '1', 
            sku: 'SAW-15-130/90', 
            brand: 'Red Indian Customs', 
            model: 'Classic Sawtooth', 
            product_name: 'Classic Sawtooth Tire',
            dimensions: '130/90-15', 
            category: 'Sawtooth',
            status: 'active'
          },
          { 
            id: '2', 
            sku: 'SAW-15-170/80', 
            brand: 'Red Indian Customs', 
            model: 'Classic Sawtooth', 
            product_name: 'Classic Sawtooth Tire',
            dimensions: '170/80-15', 
            category: 'Sawtooth',
            status: 'active'
          },
          { 
            id: '3', 
            sku: 'END-17-70/90', 
            brand: 'Red Indian Customs', 
            model: 'Enduro Trail', 
            product_name: 'Enduro Trail Tire',
            dimensions: '70/90-17', 
            category: 'Enduro',
            status: 'active'
          },
          { 
            id: '4', 
            sku: 'STD-17-90/90', 
            brand: 'Red Indian Customs', 
            model: 'ST Dual Sport', 
            product_name: 'ST Dual Sport Tire',
            dimensions: '90/90-17', 
            category: 'Dual Sport',
            status: 'active'
          },
          { 
            id: '5', 
            sku: 'MX-18-80/100', 
            brand: 'Red Indian Customs', 
            model: 'MX Motocross', 
            product_name: 'MX Motocross Tire',
            dimensions: '80/100-18', 
            category: 'Motocross',
            status: 'active'
          },
          { 
            id: '6', 
            sku: 'TRL-17-110/80', 
            brand: 'Red Indian Customs', 
            model: 'Trail Master', 
            product_name: 'Trail Master Tire',
            dimensions: '110/80-17', 
            category: 'Trail',
            status: 'active'
          },
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
        productData: {
          sku: product.sku,
          brand: product.brand,
          model: product.model,
          name: product.product_name || product.name,
          dimensions: product.dimensions,
          category: product.category
        }
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
          productData: {
            sku: product.sku,
            brand: product.brand,
            model: product.model,
            name: product.product_name || product.name,
            dimensions: product.dimensions,
            category: product.category
          }
        });
        if (data?.barcodes) {
          results.push(...data.barcodes);
        } else if (data?.barcode) {
          // Handle single barcode response - generate multiple
          for (let i = 0; i < batchQuantity; i++) {
            const { data: singleData } = await api.post('/barcodes', {
              productId: product.id,
              productData: {
                sku: product.sku,
                brand: product.brand,
                model: product.model,
                name: product.product_name || product.name,
                dimensions: product.dimensions,
                category: product.category
              }
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
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -m-6 p-4">
      {/* Compact Premium Header */}
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 mb-2">
              <ScanBarcode className="w-3 h-3" />
              OPERATIONAL STAFF
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent tracking-tight">
              Barcode & QR Generation
            </h1>
            <div className="text-slate-600 text-xs flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
              Generate unique barcodes with QR codes for full traceability
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setBatchMode(!batchMode)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                batchMode
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/40'
                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-amber-400'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              {batchMode ? 'Batch: ON' : 'Batch'}
            </button>
            <button
              onClick={loadGeneratedBarcodes}
              className="p-1.5 rounded-lg bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 transition-all duration-300"
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Compact Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 shadow-md"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Product Selection - Compact Card */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Package className="w-4 h-4 text-white" />
                </div>
                Select Products
              </h2>
              {batchMode && selectedProducts.length > 0 && (
                <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                  {selectedProducts.length}
                </span>
              )}
            </div>

            {/* Compact Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all bg-slate-50/50"
              />
            </div>

            {/* Compact Batch Controls */}
            {batchMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Boxes className="w-3 h-3" />
                    Quantity:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setBatchQuantity(Math.max(1, batchQuantity - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-amber-200 hover:bg-amber-50 flex items-center justify-center font-bold text-amber-700 text-sm"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={batchQuantity}
                      onChange={(e) => setBatchQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-14 text-center px-1 py-1 rounded-lg border border-amber-200 font-bold text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                    <button
                      onClick={() => setBatchQuantity(batchQuantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-amber-200 hover:bg-amber-50 flex items-center justify-center font-bold text-amber-700 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleGenerateBatch}
                  disabled={loading || selectedProducts.length === 0}
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all"
                >
                  Generate {selectedProducts.length * batchQuantity} Barcodes
                </button>
              </motion.div>
            )}

            {/* Compact Product List */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold">No products found</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                      batchMode && selectedProducts.find(p => p.id === product.id)
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 flex items-start gap-2">
                        {batchMode && (
                          <input
                            type="checkbox"
                            checked={selectedProducts.some(p => p.id === product.id)}
                            onChange={() => toggleProductSelection(product)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {product.brand && product.model ? `${product.brand} ${product.model}` : (product.name || product.product_name)}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-semibold text-[10px]">
                              {product.sku}
                            </span>
                            {product.dimensions && (
                              <span className="text-[10px]">{product.dimensions}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!batchMode && (
                        <button
                          onClick={() => handleGenerateSingle(product)}
                          disabled={loading}
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[10px] font-bold transition-all disabled:opacity-50 shadow-sm flex-shrink-0"
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

        {/* Right: Generated Barcodes - Compact Card */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                  <Barcode className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold">Generated Barcodes</div>
                  <div className="text-[10px] text-slate-500">{generatedBarcodes.length} items</div>
                </div>
              </div>
              {generatedBarcodes.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExport}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all"
                  >
                    <Download className="w-3 h-3 inline mr-1" />
                    Export
                  </button>
                  <button
                    onClick={handlePrintAll}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[10px] font-bold transition-all shadow-sm"
                  >
                    <Printer className="w-3 h-3 inline mr-1" />
                    Print
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {generatedBarcodes.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  <ScanBarcode className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-bold text-slate-700">No barcodes yet</p>
                  <p className="text-[10px]">Generate a barcode to get started</p>
                </div>
              ) : (
                generatedBarcodes.map((barcode) => {
                  const product = barcode.products;
                  const productName = product ? `${product.brand || ''} ${product.model || ''}`.trim() : 'Unknown Product';

                  return (
                    <div 
                      key={barcode.id}
                      className="p-3 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{productName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] mt-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono font-bold">
                              {product?.sku || 'N/A'}
                            </span>
                            {barcode.batches?.batch_number && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold">
                                {barcode.batches.batch_number}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className="text-[9px] font-mono font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                            {barcode.barcode_type}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            barcode.status === 'active' 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {barcode.status}
                          </span>
                        </div>
                      </div>

                      {/* Compact Barcode + QR Display */}
                      <div className="p-2 rounded-lg bg-white border border-slate-200 mb-2">
                        <BarcodeLabel
                          barcode={barcode}
                          product={barcode.products}
                          batch={barcode.batches}
                          inventoryUnit={barcode.inventory_units}
                          shipment={barcode.batches?.shipments}
                        />
                      </div>

                      {/* Compact Actions */}
                      <div className="grid grid-cols-4 gap-1">
                        <button
                          onClick={() => handlePrintBarcode(barcode)}
                          className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold transition-all shadow-sm hover:shadow-md"
                        >
                          <Printer className="w-3 h-3 mx-auto" />
                        </button>
                        <button
                          onClick={() => viewTraceability(barcode)}
                          className="px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-[10px] font-bold transition-all hover:bg-blue-200"
                        >
                          <ExternalLink className="w-3 h-3 mx-auto" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(barcode.barcode_value);
                            setSuccess('Copied!');
                            setTimeout(() => setSuccess(''), 2000);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold transition-all hover:bg-slate-200"
                        >
                          <Copy className="w-3 h-3 mx-auto" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(barcode.id)}
                          className="px-2 py-1.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-bold transition-all hover:bg-rose-200"
                        >
                          <Trash2 className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Compact Premium Config Card */}
          {config && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-3 border-2 border-slate-700 shadow-xl shadow-slate-900/50"
            >
              <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                <Settings className="w-3 h-3" />
                Configuration
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-slate-300 block mb-0.5">Format</span>
                  <span className="font-bold text-white">{config.format}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-slate-300 block mb-0.5">Prefix</span>
                  <span className="font-bold text-white">{config.prefix || 'None'}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                  <span className="text-slate-300 block mb-0.5">Checksum</span>
                  <span className="font-bold text-white">
                    {config.include_checksum ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-400/30">
                  <span className="text-emerald-300 block mb-0.5">QR Codes</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Enabled
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Compact Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border-2 border-slate-200"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/40">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-1">Delete Barcode?</h3>
                  <p className="text-xs text-slate-600">This action cannot be undone. The barcode will be permanently removed.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteBarcode(deleteConfirm)}
                  className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 text-white text-sm font-bold hover:from-rose-700 hover:to-red-700 transition-all duration-300 shadow-lg shadow-rose-500/40"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(241 245 249);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, rgb(59 130 246), rgb(79 70 229));
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, rgb(37 99 235), rgb(67 56 202));
        }
      `}</style>
    </div>
  );
}
