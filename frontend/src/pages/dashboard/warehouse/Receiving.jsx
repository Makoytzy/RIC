import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PackageCheck, Plus, Check, Eye, Search, Filter, Truck, Package, Calendar } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Select from '../../../components/common/Select';
import Table from '../../../components/common/Table';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/dashboard/StatusBadge';
import { showToast } from '../../../utils/toast';
import api from '../../../services/api';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Receiving() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [receiveForm, setReceiveForm] = useState({
    actualQuantity: '',
    condition: 'good',
    notes: '',
    location: ''
  });

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/warehouse/receiving');
      setShipments(response.data.shipments || []);
    } catch (error) {
      showToast('Failed to load shipments', 'error');
      // Mock data for development
      setShipments([
        {
          id: 1,
          shipmentNumber: 'SHP-2024-001',
          supplier: 'Tech Solutions Inc',
          expectedDate: new Date().toISOString(),
          expectedQuantity: 100,
          productName: 'Wireless Mouse',
          status: 'pending',
          poNumber: 'PO-2024-015',
          carrier: 'FedEx'
        },
        {
          id: 2,
          shipmentNumber: 'SHP-2024-002',
          supplier: 'Global Supplies Co',
          expectedDate: new Date(Date.now() + 86400000).toISOString(),
          expectedQuantity: 50,
          productName: 'USB Cables Pack',
          status: 'pending',
          poNumber: 'PO-2024-016',
          carrier: 'UPS'
        },
        {
          id: 3,
          shipmentNumber: 'SHP-2024-003',
          supplier: 'Quality Parts Ltd',
          expectedDate: new Date(Date.now() - 86400000).toISOString(),
          expectedQuantity: 75,
          productName: 'Laptop Chargers',
          status: 'received',
          poNumber: 'PO-2024-014',
          carrier: 'DHL',
          receivedDate: new Date(Date.now() - 43200000).toISOString(),
          actualQuantity: 75,
          condition: 'good'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveShipment = (shipment) => {
    setSelectedShipment(shipment);
    setReceiveForm({
      actualQuantity: shipment.expectedQuantity.toString(),
      condition: 'good',
      notes: '',
      location: ''
    });
    setShowReceiveModal(true);
  };

  const handleSubmitReceive = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/warehouse/receiving/${selectedShipment.id}/receive`, receiveForm);
      showToast('Shipment received successfully', 'success');
      setShowReceiveModal(false);
      setSelectedShipment(null);
      loadShipments();
    } catch (error) {
      showToast('Failed to receive shipment', 'error');
    }
  };

  const handleViewDetails = (shipment) => {
    setSelectedShipment(shipment);
    setShowDetailModal(true);
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.shipmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: shipments.filter(s => s.status === 'pending').length,
    received: shipments.filter(s => s.status === 'received').length,
    total: shipments.length
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'good': return 'bg-green-100 text-green-700';
      case 'damaged': return 'bg-red-100 text-red-700';
      case 'partial': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const columns = [
    { key: 'shipmentNumber', label: 'Shipment #', sortable: true },
    { key: 'poNumber', label: 'PO #' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'productName', label: 'Product' },
    {
      key: 'expectedQuantity',
      label: 'Expected Qty',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'expectedDate',
      label: 'Expected Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { key: 'carrier', label: 'Carrier' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.status === 'pending' && (
            <button
              onClick={() => handleReceiveShipment(row)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Receive"
            >
              <Check size={16} />
          </button>
          )}
        </div>
      )
    }
  ];

  if (loading) return <Loading />;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Receiving</h1>
        <p className="text-sm text-slate-500 mt-1">Log and process incoming shipments at the dock</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Truck className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Shipments</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Package className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <PackageCheck className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Received</p>
              <p className="text-2xl font-bold text-slate-900">{stats.received}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by shipment #, supplier, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="received">Received</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredShipments.length > 0 ? (
          <Table columns={columns} data={filteredShipments} />
        ) : (
          <EmptyState
            icon={PackageCheck}
            title="No shipments found"
            description="There are no incoming shipments to receive"
          />
        )}
      </div>

      {/* Receive Shipment Modal */}
      <Modal
        isOpen={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        title="Receive Shipment"
      >
        {selectedShipment && (
          <form onSubmit={handleSubmitReceive} className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Shipment #</span>
                <span className="font-semibold">{selectedShipment.shipmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Product</span>
                <span className="font-semibold">{selectedShipment.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Expected Quantity</span>
                <span className="font-semibold">{selectedShipment.expectedQuantity}</span>
              </div>
            </div>
            <Input
              label="Actual Quantity Received"
              type="number"
              value={receiveForm.actualQuantity}
              onChange={(e) => setReceiveForm({ ...receiveForm, actualQuantity: e.target.value })}
              placeholder="Enter actual quantity"
              required
            />
            <Select
              label="Condition"
              value={receiveForm.condition}
              onChange={(e) => setReceiveForm({ ...receiveForm, condition: e.target.value })}
              options={[
                { value: 'good', label: 'Good Condition' },
                { value: 'damaged', label: 'Damaged' },
                { value: 'partial', label: 'Partial Damage' }
              ]}
              required
            />
            <Input
              label="Storage Location"
              value={receiveForm.location}
              onChange={(e) => setReceiveForm({ ...receiveForm, location: e.target.value })}
              placeholder="e.g., A-01-01-01"
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={receiveForm.notes}
                onChange={(e) => setReceiveForm({ ...receiveForm, notes: e.target.value })}
                placeholder="Add any observations or issues..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setShowReceiveModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" icon={Check} className="flex-1">
                Confirm Receipt
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Shipment Details"
      >
        {selectedShipment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Shipment Number</p>
                <p className="font-semibold">{selectedShipment.shipmentNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">PO Number</p>
                <p className="font-semibold text-blue-600">{selectedShipment.poNumber}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Supplier</p>
              <p className="font-semibold">{selectedShipment.supplier}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Product</p>
              <p className="font-semibold">{selectedShipment.productName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Expected Quantity</p>
                <p className="text-lg font-bold text-blue-600">{selectedShipment.expectedQuantity}</p>
              </div>
              {selectedShipment.actualQuantity && (
                <div>
                  <p className="text-sm text-slate-500">Actual Quantity</p>
                  <p className="text-lg font-bold text-green-600">{selectedShipment.actualQuantity}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Expected Date</p>
                <p>{new Date(selectedShipment.expectedDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Carrier</p>
                <p>{selectedShipment.carrier}</p>
              </div>
            </div>
            {selectedShipment.condition && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Condition</p>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getConditionColor(selectedShipment.condition)}`}>
                  {selectedShipment.condition.charAt(0).toUpperCase() + selectedShipment.condition.slice(1)}
                </span>
              </div>
            )}
            {selectedShipment.receivedDate && (
              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500">Received On</p>
                <p>{new Date(selectedShipment.receivedDate).toLocaleString()}</p>
              </div>
            )}
            {selectedShipment.status === 'pending' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleReceiveShipment(selectedShipment);
                  }}
                  icon={Check}
                  className="w-full"
                >
                  Receive Shipment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
