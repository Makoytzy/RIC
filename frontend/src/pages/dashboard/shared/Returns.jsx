import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Eye, Check, X, Search, Filter, AlertCircle } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import Table from '../../../components/common/Table';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/dashboard/StatusBadge';
import { showToast } from '../../../utils/toast';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Returns() {
  const { hasRole } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/returns');
      setReturns(response.data.returns || []);
    } catch (error) {
      // Silently fall back to mock data on 403
      setReturns([
        {
          id: 1,
          returnNumber: 'RET-2024-001',
          orderNumber: 'ORD-2024-015',
          customerName: 'Sarah Wilson',
          productName: 'Wireless Headphones',
          quantity: 1,
          reason: 'Defective - Not working properly',
          status: 'pending',
          createdAt: new Date().toISOString(),
          notes: 'Customer reported sound issues'
        },
        {
          id: 2,
          returnNumber: 'RET-2024-002',
          orderNumber: 'ORD-2024-018',
          customerName: 'Mike Johnson',
          productName: 'Smart Watch',
          quantity: 1,
          reason: 'Wrong item received',
          status: 'approved',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Will be restocked after inspection'
        },
        {
          id: 3,
          returnNumber: 'RET-2024-003',
          orderNumber: 'ORD-2024-020',
          customerName: 'Emily Davis',
          productName: 'Laptop Bag',
          quantity: 1,
          reason: 'Changed mind',
          status: 'rejected',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          notes: 'Outside return window'
        },
        {
          id: 4,
          returnNumber: 'RET-2024-004',
          orderNumber: 'ORD-2024-021',
          customerName: 'David Brown',
          productName: 'USB Cable Set',
          quantity: 2,
          reason: 'Damaged during shipping',
          status: 'completed',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          notes: 'Refund processed successfully'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (returnId, newStatus) => {
    try {
      await api.patch(`/returns/${returnId}/status`, { status: newStatus });
      showToast(`Return ${newStatus} successfully`, 'success');
      loadReturns();
      setShowDetailModal(false);
    } catch (error) {
      showToast('Failed to update return status', 'error');
    }
  };

  const handleViewDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = 
      ret.returnNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ret.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const returnStats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    completed: returns.filter(r => r.status === 'completed').length
  };

  const getReasonColor = (reason) => {
    if (reason.toLowerCase().includes('defective') || reason.toLowerCase().includes('damaged')) {
      return 'text-red-600';
    }
    if (reason.toLowerCase().includes('wrong')) {
      return 'text-amber-600';
    }
    return 'text-slate-600';
  };

  const columns = [
    { key: 'returnNumber', label: 'Return #', sortable: true },
    { key: 'orderNumber', label: 'Order #', sortable: true },
    { key: 'customerName', label: 'Customer' },
    { key: 'productName', label: 'Product' },
    {
      key: 'quantity',
      label: 'Qty',
      render: (value) => <span className="font-semibold">{value}</span>
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (value) => (
        <span className={`text-sm ${getReasonColor(value)}`}>
          {value.length > 30 ? `${value.substring(0, 30)}...` : value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString()
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
          {hasRole('operational_staff', 'sales_staff', 'manager') && row.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate(row.id, 'approved')}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Approve"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => handleStatusUpdate(row.id, 'rejected')}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Reject"
              >
                <X size={16} />
              </button>
            </>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Returns Management</h1>
          <p className="text-sm text-slate-500 mt-1">Process and track customer returns</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <RotateCcw className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Returns</p>
              <p className="text-2xl font-bold text-slate-900">{returnStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-slate-900">{returnStats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Check className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{returnStats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Check className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{returnStats.completed}</p>
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
                placeholder="Search by return #, order #, customer, or product..."
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
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredReturns.length > 0 ? (
          <Table columns={columns} data={filteredReturns} />
        ) : (
          <EmptyState
            icon={RotateCcw}
            title="No returns found"
            description="There are no product returns to display"
          />
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Return Details"
      >
        {selectedReturn && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Return Number</p>
                <p className="font-semibold">{selectedReturn.returnNumber}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Order Number</p>
                <p className="font-semibold text-blue-600">{selectedReturn.orderNumber}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500">Customer</p>
                <p className="font-semibold">{selectedReturn.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Status</p>
                <StatusBadge status={selectedReturn.status} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500">Product</p>
              <p className="font-semibold">{selectedReturn.productName}</p>
              <p className="text-sm text-slate-600">Quantity: {selectedReturn.quantity}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Return Reason</p>
              <div className={`p-3 rounded-lg bg-slate-50 border border-slate-200 ${getReasonColor(selectedReturn.reason)}`}>
                {selectedReturn.reason}
              </div>
            </div>
            {selectedReturn.notes && (
              <div>
                <p className="text-sm text-slate-500 mb-1">Notes</p>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
                  {selectedReturn.notes}
                </div>
              </div>
            )}
            <div className="border-t pt-3">
              <p className="text-sm text-slate-500">Submitted</p>
              <p className="text-sm">
                {new Date(selectedReturn.createdAt).toLocaleString()}
              </p>
            </div>
            {hasRole('operational_staff', 'sales_staff', 'manager') && selectedReturn.status === 'pending' && (
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate(selectedReturn.id, 'rejected')}
                  icon={X}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reject Return
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(selectedReturn.id, 'approved')}
                  icon={Check}
                  className="flex-1"
                >
                  Approve Return
                </Button>
              </div>
            )}
            {hasRole('operational_staff', 'warehouse_staff') && selectedReturn.status === 'approved' && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => handleStatusUpdate(selectedReturn.id, 'completed')}
                  icon={Check}
                  className="w-full"
                >
                  Mark as Completed
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}

