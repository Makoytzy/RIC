import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Barcode, QrCode, Truck, MapPin, Calendar, User,
  CheckCircle2, AlertTriangle, Clock, ArrowRight, Box,
  Layers, ShoppingCart, RotateCcw, Activity, Eye, ChevronDown,
  ChevronUp, ExternalLink, Home, ScanBarcode
} from 'lucide-react';
import api from '../../services/api.js';

export default function TraceabilityView() {
  const { barcode } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('details'); // 'details' or 'timeline'
  const [expandedSections, setExpandedSections] = useState({
    product: true,
    batch: true,
    shipment: false,
    inventory: false,
    orders: false,
    returns: false,
  });

  useEffect(() => {
    loadTraceability();
  }, [barcode]);

  const loadTraceability = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [detailsRes, timelineRes] = await Promise.all([
        api.get(`/traceability/${barcode}`),
        api.get(`/traceability/${barcode}/timeline`)
      ]);

      if (detailsRes.data?.data) {
        setData(detailsRes.data.data);
      }

      if (timelineRes.data?.data) {
        setTimeline(timelineRes.data.data);
      }
    } catch (err) {
      console.error('Traceability error:', err);
      setError(err.response?.data?.error || 'Failed to load traceability data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      completed: 'bg-blue-100 text-blue-700 border-blue-200',
      deleted: 'bg-rose-100 text-rose-700 border-rose-200',
      cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">Loading traceability data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-rose-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Barcode Not Found</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all"
          >
            <Home className="w-4 h-4 inline mr-2" />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.lifecycleSummary || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ScanBarcode className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">Product Traceability</h1>
              </div>
              <p className="text-slate-500 text-sm">Full lifecycle tracking for barcode {barcode}</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
            >
              <Home className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setViewMode('details')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'details'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Details View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Timeline View
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Status</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <p className={`text-sm font-bold px-3 py-1 rounded-full border inline-block ${getStatusColor(summary.currentStatus)}`}>
              {summary.currentStatus || 'Unknown'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Location</span>
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-slate-900">{summary.currentWarehouse}</p>
            <p className="text-xs text-slate-500">{summary.currentLocation}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Total Scans</span>
              <ScanBarcode className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalScans || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm">Movements</span>
              <Truck className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{summary.totalMovements || 0}</p>
          </div>
        </div>

        {/* Details View */}
        {viewMode === 'details' && (
          <div className="space-y-4">
            {/* Barcode Info */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-blue-600" />
                  Barcode Information
                </h2>
                {data.barcode?.qrCodeUrl && (
                  <a
                    href={data.barcode.qrCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
                  >
                    <QrCode className="w-4 h-4" />
                    View QR
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Barcode Value:</span>
                  <p className="font-mono font-bold text-slate-900 mt-1">{data.barcode.value}</p>
                </div>
                <div>
                  <span className="text-slate-500">Type:</span>
                  <p className="font-semibold text-slate-900 mt-1">{data.barcode.type}</p>
                </div>
                <div>
                  <span className="text-slate-500">Generated:</span>
                  <p className="font-semibold text-slate-900 mt-1">{formatDate(data.barcode.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Product Info */}
            {data.product && (
              <CollapsibleSection
                title="Product Details"
                icon={<Package className="w-5 h-5 text-emerald-600" />}
                isExpanded={expandedSections.product}
                onToggle={() => toggleSection('product')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <InfoField label="SKU" value={data.product.sku} />
                  <InfoField label="Brand" value={data.product.brand} />
                  <InfoField label="Model" value={data.product.model} />
                  <InfoField label="Dimensions" value={data.product.dimensions} />
                  <InfoField label="Category" value={data.product.category} />
                  <InfoField label="Retail Price" value={`$${data.product.retailPrice?.toFixed(2) || '0.00'}`} />
                </div>
              </CollapsibleSection>
            )}

            {/* Batch Info */}
            {data.batch && (
              <CollapsibleSection
                title="Batch Information"
                icon={<Layers className="w-5 h-5 text-purple-600" />}
                isExpanded={expandedSections.batch}
                onToggle={() => toggleSection('batch')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <InfoField label="Batch Number" value={data.batch.batchNumber} />
                  <InfoField label="Container" value={data.batch.containerNumber || 'N/A'} />
                  <InfoField label="BL Number" value={data.batch.blNumber || 'N/A'} />
                  <InfoField label="Quantity" value={data.batch.quantity} />
                </div>
              </CollapsibleSection>
            )}

            {/* Shipment Info */}
            {data.shipment && (
              <CollapsibleSection
                title="Shipment Details"
                icon={<Truck className="w-5 h-5 text-blue-600" />}
                isExpanded={expandedSections.shipment}
                onToggle={() => toggleSection('shipment')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <InfoField label="Shipment Number" value={data.shipment.shipment_number} />
                  <InfoField label="Status" value={data.shipment.status} badge />
                  <InfoField label="Received Date" value={formatDate(data.shipment.received_date)} />
                  {data.shipment.suppliers && (
                    <>
                      <InfoField label="Supplier" value={data.shipment.suppliers.name} />
                      <InfoField label="Contact" value={data.shipment.suppliers.contact_person} />
                    </>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* Orders */}
            {data.orders && data.orders.length > 0 && (
              <CollapsibleSection
                title={`Orders (${data.orders.length})`}
                icon={<ShoppingCart className="w-5 h-5 text-amber-600" />}
                isExpanded={expandedSections.orders}
                onToggle={() => toggleSection('orders')}
              >
                <div className="space-y-3">
                  {data.orders.map((orderItem, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{orderItem.order.order_number}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(orderItem.order.status)}`}>
                          {orderItem.order.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <span className="text-slate-500">Customer: <strong className="text-slate-900">{orderItem.order.customer_name}</strong></span>
                        <span className="text-slate-500">Total: <strong className="text-slate-900">${orderItem.order.total_amount}</strong></span>
                        <span className="text-slate-500">Quantity: <strong className="text-slate-900">{orderItem.quantity}</strong></span>
                        <span className="text-slate-500">Date: <strong className="text-slate-900">{formatDate(orderItem.orderDate)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Returns */}
            {data.returns && data.returns.length > 0 && (
              <CollapsibleSection
                title={`Returns (${data.returns.length})`}
                icon={<RotateCcw className="w-5 h-5 text-rose-600" />}
                isExpanded={expandedSections.returns}
                onToggle={() => toggleSection('returns')}
              >
                <div className="space-y-3">
                  {data.returns.map((returnItem, idx) => (
                    <div key={idx} className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{returnItem.return_number}</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(returnItem.status)}`}>
                          {returnItem.status}
                        </span>
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="text-slate-500">Reason: <strong className="text-slate-900">{returnItem.reason}</strong></p>
                        <p className="text-slate-500">Condition: <strong className="text-slate-900">{returnItem.condition}</strong></p>
                        <p className="text-slate-500">Refund: <strong className="text-slate-900">${returnItem.refund_amount}</strong></p>
                        <p className="text-slate-500">Saleable: <strong className={returnItem.is_saleable ? 'text-emerald-700' : 'text-rose-700'}>{returnItem.is_saleable ? 'Yes' : 'No'}</strong></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && timeline && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Event Timeline ({timeline.totalEvents} events)
            </h2>
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200"></div>

              {/* Timeline Events */}
              <div className="space-y-6">
                {timeline.timeline.map((event, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pl-16 pb-6"
                  >
                    {/* Timeline Dot */}
                    <div className="absolute left-6 w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-md"></div>

                    {/* Event Card */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-blue-600 uppercase">{event.type.replace(/_/g, ' ')}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{event.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function CollapsibleSection({ title, icon, isExpanded, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-slate-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-6 pb-6">
          {children}
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value, badge }) {
  if (badge) {
    const colors = {
      active: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      completed: 'bg-blue-100 text-blue-700',
    };
    const color = colors[value?.toLowerCase()] || 'bg-slate-100 text-slate-700';
    
    return (
      <div>
        <span className="text-slate-500 text-sm">{label}:</span>
        <p className={`font-bold text-sm px-3 py-1 rounded-full inline-block mt-1 ${color}`}>
          {value || 'N/A'}
        </p>
      </div>
    );
  }

  return (
    <div>
      <span className="text-slate-500 text-sm">{label}:</span>
      <p className="font-semibold text-slate-900 mt-1">{value || 'N/A'}</p>
    </div>
  );
}
