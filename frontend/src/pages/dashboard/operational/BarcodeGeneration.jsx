import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ScanBarcode, Barcode, Package, Printer, Download, QrCode,
  CheckCircle2, AlertTriangle, RefreshCw, Plus, X, Search,
  PackageCheck, Boxes, Copy, Eye, Settings, Edit, Trash2, ExternalLink,
  ChevronDown, ChevronRight
} from 'lucide-react';
import api from '../../../services/api.js';

export default function BarcodeGeneration() {
  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [generatedBarcodes, setGeneratedBarcodes] = useState([]);
  const [selectedBarcodes, setSelectedBarcodes] = useState([]); // NEW: For bulk delete
  const [expandedFolders, setExpandedFolders] = useState([]); // NEW: Track expanded folders
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState(1);
  const [labelFormat, setLabelFormat] = useState('4x2');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form data for barcode generation
  const [formData, setFormData] = useState({
    batchId: '',
    productId: '',
    shipmentId: ''
  });

  // Load barcode configuration
  useEffect(() => {
    loadConfig();
    loadProducts();
    loadBatches();
    loadShipments();
    loadGeneratedBarcodes();
    // Auto-enable batch mode for easier workflow
    setBatchMode(true);
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
        prefix: 'RIC',
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
        const fallbackProducts = [
          { id: '1', sku: 'SAW-15-130/90', brand: 'Red Indian Customs', model: 'Classic Sawtooth', product_name: 'Classic Sawtooth Tire', dimensions: '130/90-15', category: 'Sawtooth', status: 'active' },
          { id: '2', sku: 'SAW-15-170/80', brand: 'Red Indian Customs', model: 'Classic Sawtooth', product_name: 'Classic Sawtooth Tire', dimensions: '170/80-15', category: 'Sawtooth', status: 'active' },
          { id: '3', sku: 'END-17-70/90', brand: 'Red Indian Customs', model: 'Enduro Trail', product_name: 'Enduro Trail Tire', dimensions: '70/90-17', category: 'Enduro', status: 'active' },
          { id: '4', sku: 'STD-17-90/90', brand: 'Red Indian Customs', model: 'ST Dual Sport', product_name: 'ST Dual Sport Tire', dimensions: '90/90-17', category: 'Dual Sport', status: 'active' },
          { id: '5', sku: 'MX-18-80/100', brand: 'Red Indian Customs', model: 'MX Motocross', product_name: 'MX Motocross Tire', dimensions: '80/100-18', category: 'Motocross', status: 'active' },
          { id: '6', sku: 'TRL-17-110/80', brand: 'Red Indian Customs', model: 'Trail Master', product_name: 'Trail Master Tire', dimensions: '110/80-17', category: 'Trail', status: 'active' },
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

  const loadBatches = async () => {
    try {
      const { data } = await api.get('/batches');
      console.log('📦 Loaded batches:', data);
      setBatches(data.batches || []);
      if (data.batches && data.batches.length > 0) {
        console.log(`✅ Successfully loaded ${data.batches.length} batches`);
      } else {
        console.warn('⚠️ No batches found in database');
      }
    } catch (err) {
      console.error('❌ Error loading batches:', err);
      setBatches([]);
    }
  };

  const loadShipments = async () => {
    try {
      const { data} = await api.get('/shipments?status=RECEIVED');
      setShipments(data.shipments || []);
    } catch (err) {
      console.warn('Could not load shipments:', err);
      setShipments([]);
    }
  };

  const loadGeneratedBarcodes = async () => {
    try {
      // Backend already returns nested data from RPC function
      const { data } = await api.get('/barcodes?limit=50');
      console.log('🏷️ Loaded barcodes:', data);
      if (data?.barcodes) {
        setGeneratedBarcodes(data.barcodes);
        console.log('📊 Total barcodes loaded:', data.barcodes.length);
        console.log('📊 First barcode sample:', data.barcodes[0]);
        if (data.barcodes[0]) {
          console.log('📊 First barcode structure check:', {
            has_products_key: !!data.barcodes[0].products,
            has_product_key: !!data.barcodes[0].product,
            has_batches_key: !!data.barcodes[0].batches,
            has_batch_key: !!data.barcodes[0].batch,
            product_id: data.barcodes[0].product_id,
            batch_id: data.barcodes[0].batch_id,
            keys: Object.keys(data.barcodes[0])
          });
        }
      }
    } catch (err) {
      console.error('❌ Failed to load barcodes:', err);
    }
  };

  const handleGenerateSingle = async (product) => {
    setError('Please enable Batch Mode and select a batch from the dropdown to generate barcodes');
    setTimeout(() => setError(''), 5000);
  };

  const handleGenerateBatch = async () => {
    if (!formData.batchId) {
      setError('Please select a batch first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!formData.productId) {
      setError('Please select a product first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!batchQuantity || batchQuantity < 1) {
      setError('Please enter a valid quantity');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/barcodes', {
        productId: formData.productId,
        batchId: formData.batchId,
        shipmentId: formData.shipmentId,
        quantity: batchQuantity
      });

      if (data?.barcodes) {
        setGeneratedBarcodes(prev => [...data.barcodes, ...prev]);
        setSuccess(`Generated ${data.barcodes.length} barcodes successfully`);
        setBatchQuantity(1);
        setTimeout(() => setSuccess(''), 3000);
        await loadGeneratedBarcodes();
      }
    } catch (err) {
      console.error('Batch generate error:', err);
      setError(err.response?.data?.error || 'Failed to generate barcodes');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Bulk delete handler
  const handleBulkDelete = async () => {
    if (selectedBarcodes.length === 0) {
      setError('Please select barcodes to delete');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!confirm(`Delete ${selectedBarcodes.length} barcode${selectedBarcodes.length > 1 ? 's' : ''}?`)) {
      return;
    }

    setLoading(true);
    try {
      // Delete all selected barcodes
      await Promise.all(
        selectedBarcodes.map(id => api.delete(`/barcodes/${id}`))
      );
      
      setGeneratedBarcodes(prev => prev.filter(b => !selectedBarcodes.includes(b.id)));
      setSelectedBarcodes([]);
      setSuccess(`Deleted ${selectedBarcodes.length} barcode${selectedBarcodes.length > 1 ? 's' : ''} successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete some barcodes');
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

  // NEW: Toggle barcode selection
  const toggleBarcodeSelection = (barcodeId) => {
    setSelectedBarcodes(prev => {
      if (prev.includes(barcodeId)) {
        return prev.filter(id => id !== barcodeId);
      } else {
        return [...prev, barcodeId];
      }
    });
  };

  // NEW: Select/deselect all barcodes
  const toggleSelectAll = () => {
    if (selectedBarcodes.length === generatedBarcodes.length) {
      setSelectedBarcodes([]);
    } else {
      setSelectedBarcodes(generatedBarcodes.map(b => b.id));
    }
  };

  // NEW: Toggle folder expand/collapse
  const toggleFolder = (groupKey) => {
    setExpandedFolders(prev => {
      if (prev.includes(groupKey)) {
        return prev.filter(key => key !== groupKey);
      } else {
        return [...prev, groupKey];
      }
    });
  };

  const handlePrintBarcode = (barcode) => {
    const product = barcode.products || {};
    const productName = `${product.brand || 'Unknown'} ${product.model || 'Product'}`.trim();
    const sku = product.sku || 'N/A';
    const batch = barcode.batches?.batch_number || 'N/A';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcode - ${barcode.barcode_value}</title>
          <style>
            @page { margin: 0; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .label { border: 2px dashed #ccc; padding: 20px; width: 4in; margin: 0 auto; page-break-after: always; }
            .header { font-size: 10px; font-weight: bold; margin-bottom: 10px; text-align: center; }
            .content { display: flex; gap: 15px; align-items: center; }
            .barcode-section { flex: 1; }
            .barcode { font-family: 'Courier New', monospace; font-size: 14px; font-weight: bold; letter-spacing: 2px; text-align: center; margin: 10px 0; }
            .bars { height: 60px; display: flex; align-items: center; justify-content: center; gap: 1px; background: white; padding: 5px; }
            .bar { background: black; height: 100%; width: 2px; }
            .bar.wide { width: 4px; }
            .qr-section { flex: 0 0 80px; text-align: center; }
            .qr-section img { width: 80px; height: 80px; }
            .qr-label { font-size: 7px; margin-top: 3px; }
            .info { font-size: 9px; margin-top: 10px; line-height: 1.4; }
            @media print { body { margin: 0; padding: 10px; } .label { border: none; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">RED INDIAN CUSTOMS - TIRE REGISTRY</div>
            <div class="content">
              <div class="barcode-section">
                <div class="bars">
                  ${Array.from({ length: 40 }, (_, i) => `<div class="bar ${Math.random() > 0.5 ? 'wide' : ''}"></div>`).join('')}
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
    const labels = generatedBarcodes.map((barcode, index) => {
      const product = barcode.products || {};
      const productName = `${product.brand || 'Unknown'} ${product.model || 'Product'}`.trim();
      const sku = product.sku || 'N/A';
      const batch = barcode.batches?.batch_number || 'N/A';

      return `
        <div class="label" key="${index}">
          <div class="header">RED INDIAN CUSTOMS</div>
          <div class="content">
            <div class="barcode-section">
              <div class="bars">
                ${Array.from({ length: 30 }, () => `<div class="bar ${Math.random() > 0.5 ? 'wide' : ''}"></div>`).join('')}
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
            .label { border: 1px dashed #ccc; padding: 15px; width: 3.5in; margin-bottom: 10px; page-break-inside: avoid; }
            .header { font-size: 9px; font-weight: bold; margin-bottom: 8px; text-align: center; }
            .content { display: flex; gap: 10px; align-items: center; }
            .barcode-section { flex: 1; }
            .barcode { font-family: 'Courier New', monospace; font-size: 12px; font-weight: bold; letter-spacing: 1.5px; text-align: center; margin: 8px 0; }
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
        const product = b.products || {};
        const productName = `${product.brand || 'Unknown'} ${product.model || 'Product'}`.trim();
        return [
          b.barcode_value,
          `"${productName}"`,
          product.sku || 'N/A',
          b.batches?.batch_number || 'N/A',
          b.barcode_type || 'CODE128',
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

  // NEW: Group barcodes by product for better organization
  const groupedBarcodes = generatedBarcodes.reduce((acc, barcode) => {
    // Handle both nested object and null values from backend
    const product = barcode.products || {};
    const batch = barcode.batches || {};
    
    // Debug logging (can be removed after verification)
    if (generatedBarcodes.indexOf(barcode) === 0) {
      console.log('🔍 First barcode structure:', {
        id: barcode.id,
        product_id: barcode.product_id,
        batch_id: barcode.batch_id,
        products: barcode.products,
        batches: barcode.batches
      });
    }
    
    // Create a unique key for each product-batch combination
    const productId = product.id || barcode.product_id || 'unknown';
    const batchId = batch.id || barcode.batch_id || 'unknown';
    const groupKey = `${productId}_${batchId}`;
    
    // Generate proper group name with all required fields
    const brandName = product.brand || 'Unknown Brand';
    const modelName = product.model || 'Unknown Model';
    const skuValue = product.sku || 'N/A';
    const batchNumber = batch.batch_number || 'N/A';
    
    const groupName = productId !== 'unknown'
      ? `${brandName} ${modelName} - SKU: ${skuValue} | Batch: ${batchNumber}`
      : 'Unassigned Barcodes';
    
    if (!acc[groupKey]) {
      acc[groupKey] = {
        key: groupKey, // NEW: Store the key for folder toggling
        name: groupName,
        product: product,
        batch: batch,
        barcodes: []
      };
    }
    
    acc[groupKey].barcodes.push(barcode);
    return acc;
  }, {});

  const groupedBarcodesArray = Object.values(groupedBarcodes);
  
  // Console log for debugging (can be removed after verification)
  console.log('📁 Grouped barcodes:', {
    totalBarcodes: generatedBarcodes.length,
    groupCount: groupedBarcodesArray.length,
    groups: groupedBarcodesArray.map(g => ({ 
      name: g.name, 
      count: g.barcodes.length,
      hasProduct: !!g.product.id,
      hasBatch: !!g.batch.id
    }))
  });

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -m-6 p-4">
      {/* Header */}
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

      {/* Alerts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-md"
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
            className="mb-3 p-2.5 rounded-xl bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 shadow-md"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Product Selection */}
        <div className="space-y-3">
          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Package className="w-4 h-4 text-white" />
                </div>
                Select Products
              </h2>
            </div>

            {/* Search */}
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

            {/* Batch Controls */}
            {batchMode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 p-3 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm space-y-3"
              >
                {/* Batch Selector */}
                <div>
                  <label className="text-xs font-bold text-amber-900 block mb-1.5">
                    Select Batch *
                  </label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => {
                      const batch = batches.find(b => b.id === e.target.value);
                      setFormData({
                        ...formData,
                        batchId: e.target.value,
                        productId: batch?.product_id || '',
                        shipmentId: batch?.shipment_id || ''
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-amber-200 text-xs focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  >
                    <option value="">Choose a batch...</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batch_number} - {batch.products?.brand || 'Unknown'} {batch.products?.model || 'Product'} ({batch.batch_month}/{batch.batch_year})
                      </option>
                    ))}
                  </select>
                  {batches.length === 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      No active batches. Create a batch in Batch Management first.
                    </p>
                  )}
                </div>

                {/* Product Display */}
                {formData.batchId && (
                  <div>
                    <label className="text-xs font-bold text-amber-900 block mb-1.5">
                      Product (from batch)
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-white border border-amber-200 text-xs text-slate-700">
                      {(() => {
                        const batch = batches.find(b => b.id === formData.batchId);
                        const product = batch?.products;
                        return product 
                          ? `${product.sku} - ${product.brand} ${product.model} (${product.dimensions})`
                          : 'N/A';
                      })()}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Boxes className="w-3 h-3" />
                    Quantity:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
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
                      type="button"
                      onClick={() => setBatchQuantity(batchQuantity + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-amber-200 hover:bg-amber-50 flex items-center justify-center font-bold text-amber-700 text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateBatch}
                  disabled={loading || !formData.batchId || batchQuantity < 1}
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? 'Generating...' : `Generate ${batchQuantity} Barcode${batchQuantity > 1 ? 's' : ''}`}
                </button>
              </motion.div>
            )}

            {/* Product List */}
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
                    className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
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
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Generated Barcodes */}
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

              <div className="flex items-center gap-1">
                {/* NEW: Bulk Actions */}
                {selectedBarcodes.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-all text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete ({selectedBarcodes.length})
                  </button>
                )}
                <button onClick={handlePrintAll} className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100" title="Print All">
                  <Printer className="w-3 h-3" />
                </button>
                <button onClick={handleExport} className="p-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 hover:bg-green-100" title="Export CSV">
                  <Download className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* NEW: Select All Checkbox */}
            {generatedBarcodes.length > 0 && (
              <div className="mb-2 pb-2 border-b border-slate-200">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={selectedBarcodes.length === generatedBarcodes.length}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                  />
                  <span className="font-medium">Select All ({generatedBarcodes.length})</span>
                </label>
              </div>
            )}

            {/* Barcode List - Grouped by Product (Folder Style) */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {generatedBarcodes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <QrCode className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-semibold">No barcodes generated yet</p>
                  <p className="text-[10px] mt-1">Select a batch and generate barcodes</p>
                </div>
              ) : (
                groupedBarcodesArray.map((group, groupIndex) => {
                  const allSelected = group.barcodes.every(b => selectedBarcodes.includes(b.id));
                  const someSelected = group.barcodes.some(b => selectedBarcodes.includes(b.id));
                  const isExpanded = expandedFolders.includes(group.key);
                  
                  return (
                    <div key={`group-${groupIndex}`} className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
                      {/* Folder Header - Clickable - ENHANCED: Show full text */}
                      <div 
                        className="p-3 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-start justify-between cursor-pointer hover:from-slate-150 hover:to-slate-100 transition-colors"
                        onClick={() => toggleFolder(group.key)}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          {/* Expand/Collapse Icon */}
                          <button 
                            className="p-0.5 hover:bg-slate-200 rounded transition-colors mt-0.5 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFolder(group.key);
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                          
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={input => {
                              if (input) input.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={(e) => {
                              e.stopPropagation();
                              if (allSelected) {
                                // Deselect all in this group
                                setSelectedBarcodes(prev => prev.filter(id => !group.barcodes.find(b => b.id === id)));
                              } else {
                                // Select all in this group
                                setSelectedBarcodes(prev => [...new Set([...prev, ...group.barcodes.map(b => b.id)])]);
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer mt-0.5 flex-shrink-0"
                            title={allSelected ? "Deselect all in folder" : "Select all in folder"}
                          />
                          <Package className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            {/* Multi-line folder name - NO truncation */}
                            <div className="text-xs font-bold text-slate-900 break-words">{group.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{group.barcodes.length} barcode{group.barcodes.length > 1 ? 's' : ''}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-1 ml-2 flex-shrink-0 mt-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                            {group.barcodes.length}
                          </span>
                        </div>
                      </div>

                      {/* Barcodes in this folder - Only show when expanded */}
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="divide-y divide-slate-100"
                        >
                        {group.barcodes.map((barcode) => {
                          const product = barcode.products || group.product || {};
                          const batch = barcode.batches || group.batch || {};
                          const productName = `${product.brand || 'Unknown'} ${product.model || 'Product'}`.trim();
                          const sku = product.sku || 'N/A';
                          const batchNumber = batch.batch_number || 'N/A';

                          return (
                            <div
                              key={barcode.id}
                              className={`p-2 transition-all ${
                                selectedBarcodes.includes(barcode.id)
                                  ? 'bg-blue-50'
                                  : 'bg-white hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedBarcodes.includes(barcode.id)}
                                  onChange={() => toggleBarcodeSelection(barcode.id)}
                                  className="mt-1 h-3.5 w-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                                />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-bold text-slate-900 font-mono truncate">{barcode.barcode_value}</div>
                                      <div className="text-[10px] text-slate-600 truncate">{productName}</div>
                                    </div>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                      barcode.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {barcode.status}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 mb-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-semibold text-slate-700">SKU: {sku}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-[9px] font-semibold text-blue-700">Batch: {batchNumber}</span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handlePrintBarcode(barcode)}
                                      className="p-1 rounded bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-all"
                                      title="Print"
                                    >
                                      <Printer className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => viewTraceability(barcode)}
                                      className="p-1 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all"
                                      title="View Traceability"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(barcode.barcode_value);
                                        setSuccess('Copied!');
                                        setTimeout(() => setSuccess(''), 2000);
                                      }}
                                      className="p-1 rounded bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-all"
                                      title="Copy"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBarcode(barcode.id)}
                                      className="p-1 rounded bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 transition-all ml-auto"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        </motion.div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
