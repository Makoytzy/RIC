import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, Eye, Check, X, Search, Filter, AlertCircle, 
  CheckCircle2, XCircle, Clock, TrendingUp, Package, 
  User, FileText, DollarSign, Edit, AlertTriangle, Tag, Box
} from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

export default function Returns() {
  const { hasRole } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [alert, setAlert] = useState(null);
  const [actionMode, setActionMode] = useState(null);

  useEffect(() => {
    loadReturns();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), alert.type === 'success' ? 3000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const loadReturns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/returns');
      setReturns(response.data.returns || []);
    } catch (error) {
      // Fall back to mock data
      setReturns([
        {
          id: 1,
          returnNumber: 'RET-2024-001',
          orderNumber: 'ORD-2024-015',
          customerName: 'Sarah Wilson',
          productName: 'Michelin Pilot Sport 4S - 245/45 R19',
          quantity: 2,
          reason: 'Defective - Not working properly',
          status: 'pending',
          createdAt: new Date().toISOString(),
          notes: 'Customer reported vibration issues'
        },
        {
          id: 2,
          returnNumber: 'RET-2024-002',
          orderNumber: 'ORD-2024-018',
          customerName: 'Mike Johnson',
          productName: 'Bridgestone Dueler - 265/70 R17',
          quantity: 4,
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
          productName: 'Continental ExtremeContact - 225/45 R18',
          quantity: 2,
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
          productName: 'Goodyear Wrangler - 285/65 R18',
          quantity: 4,
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
      setAlert({ type: 'success', message: `Return ${newStatus} successfully!` });
      loadReturns();
      setShowDetailModal(false);
      setActionMode(null);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to update return status' });
    }
  };

  const handleActionClick = (returnId, action) => {
    setActionMode(actionMode === `${returnId}-${action}` ? null : `${returnId}-${action}`);
  };

  const handleViewDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  const filteredReturns = returns.filter(ret => {
    const matchesSearch = 
      ret.returnNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ret.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ret.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const returnStats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    completed: returns.filter(r => r.status === 'completed').length
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': { 
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50', 
        text: 'text-yellow-700',
        icon: Clock,
        border: 'border-yellow-200'
      },
      'approved': { 
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50', 
        text: 'text-green-700',
        icon: CheckCircle2,
        border: 'border-green-200'
      },
      'rejected': { 
        bg: 'bg-gradient-to-r from-red-50 to-rose-50', 
        text: 'text-red-700',
        icon: XCircle,
        border: 'border-red-200'
      },
      'completed': { 
        bg: 'bg-gradient-to-r from-purple-50 to-indigo-50', 
        text: 'text-purple-700',
        icon: CheckCircle2,
        border: 'border-purple-200'
      }
    };
    return configs[status] || { 
      bg: 'bg-gray-50', 
      text: 'text-gray-700', 
      icon: Package,
      border: 'border-gray-200'
    };
  };

  const getReasonColor = (reason) => {
    if (reason?.toLowerCase().includes('defective') || reason?.toLowerCase().includes('damaged')) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    if (reason?.toLowerCase().includes('wrong')) {
      return 'text-amber-600 bg-amber-50 border-amber-200';
    }
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Alert */}
        <AnimatePresence>
          {alert && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`${
                alert.type === 'success'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
                  : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
              } border-2 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {alert.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <span className="font-medium">{alert.message}</span>
                </div>
                <button onClick={() => setAlert(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Returns Management
          </h1>
          <p className="mt-2 text-slate-600">Process and track customer returns</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Returns</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-1">
                  {returnStats.total}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <RotateCcw className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-yellow-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent mt-1">
                  {returnStats.pending}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Approved</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-1">
                  {returnStats.approved}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-purple-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completed</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-1">
                  {returnStats.completed}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 border border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search returns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Returns Grid */}
        {filteredReturns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-slate-200"
          >
            <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <RotateCcw className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No returns found</h3>
            <p className="text-slate-600">No product returns match your filters</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {filteredReturns.map((returnItem, index) => {
                const statusConfig = getStatusConfig(returnItem.status);
                const StatusIcon = statusConfig.icon;
                const isApproving = actionMode === `${returnItem.id}-approve`;
                const isRejecting = actionMode === `${returnItem.id}-reject`;
                const isCompleting = actionMode === `${returnItem.id}-complete`;

                return (
                  <motion.div
                    key={returnItem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <RotateCcw className="h-5 w-5 text-purple-100" />
                            <h3 className="text-lg font-bold text-white">
                              {returnItem.returnNumber}
                            </h3>
                          </div>
                          <p className="text-sm text-purple-100">
                            Order: {returnItem.orderNumber}
                          </p>
                        </div>
                        <div className={`px-3 py-1.5 ${statusConfig.bg} ${statusConfig.text} rounded-lg border ${statusConfig.border} flex items-center space-x-1.5`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="text-xs font-semibold capitalize">{returnItem.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      {/* Customer & Product */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">Customer:</span>
                          <span className="text-sm font-semibold text-slate-800">{returnItem.customerName}</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Box className="h-4 w-4 text-slate-400 mt-0.5" />
                          <div>
                            <span className="text-sm text-slate-600">Product:</span>
                            <p className="text-sm font-semibold text-slate-800 mt-1">{returnItem.productName}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Quantity: {returnItem.quantity}</p>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className={`p-3 rounded-xl border ${getReasonColor(returnItem.reason)}`}>
                        <p className="text-xs font-medium mb-1">Return Reason:</p>
                        <p className="text-sm font-semibold">{returnItem.reason}</p>
                      </div>

                      {/* Date */}
                      <div className="flex items-center space-x-2 p-2 bg-slate-50 rounded-lg">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-xs text-slate-600">Submitted:</span>
                        <span className="text-sm font-medium text-slate-800">
                          {new Date(returnItem.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleViewDetails(returnItem)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </motion.button>

                        {hasRole('operational_staff', 'sales_staff', 'manager') && returnItem.status === 'pending' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleActionClick(returnItem.id, 'approve')}
                              className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium ${
                                isApproving
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                                  : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100'
                              }`}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleActionClick(returnItem.id, 'reject')}
                              className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium ${
                                isRejecting
                                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white'
                                  : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100'
                              }`}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Reject
                            </motion.button>
                          </>
                        )}

                        {hasRole('operational_staff', 'warehouse_staff') && returnItem.status === 'approved' && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleActionClick(returnItem.id, 'complete')}
                            className={`flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium ${
                              isCompleting
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                                : 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 hover:from-purple-100 hover:to-indigo-100'
                            }`}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Complete
                          </motion.button>
                        )}
                      </div>

                      {/* Action Confirmations */}
                      <AnimatePresence>
                        {isApproving && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-start space-x-3">
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-green-800">Approve Return</p>
                                  <p className="text-xs text-green-600 mt-1">
                                    This will approve the return and allow processing.
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(returnItem.id, 'approved')}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                                >
                                  Confirm Approval
                                </button>
                                <button
                                  onClick={() => setActionMode(null)}
                                  className="flex-1 px-3 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-300 hover:bg-slate-50 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {isRejecting && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-start space-x-3">
                                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-red-800">Reject Return</p>
                                  <p className="text-xs text-red-600 mt-1">
                                    This will reject the return request.
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(returnItem.id, 'rejected')}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                                >
                                  Confirm Rejection
                                </button>
                                <button
                                  onClick={() => setActionMode(null)}
                                  className="flex-1 px-3 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-300 hover:bg-slate-50 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {isCompleting && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 space-y-3">
                              <div className="flex items-start space-x-3">
                                <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-purple-800">Complete Return</p>
                                  <p className="text-xs text-purple-600 mt-1">
                                    Mark this return as completed and processed.
                                  </p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStatusUpdate(returnItem.id, 'completed')}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all"
                                >
                                  Mark Complete
                                </button>
                                <button
                                  onClick={() => setActionMode(null)}
                                  className="flex-1 px-3 py-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-300 hover:bg-slate-50 transition-all"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedReturn && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        <RotateCcw className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Return Details</h3>
                        <p className="text-purple-100 text-sm mt-1">{selectedReturn.returnNumber}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Return Number</p>
                      <p className="font-semibold text-slate-800">{selectedReturn.returnNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Order Number</p>
                      <p className="font-semibold text-blue-600">{selectedReturn.orderNumber}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Customer</p>
                      <p className="font-semibold text-slate-800">{selectedReturn.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Status</p>
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-semibold ${getStatusConfig(selectedReturn.status).bg} ${getStatusConfig(selectedReturn.status).text}`}>
                        <span className="capitalize">{selectedReturn.status}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-2">Product</p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="font-semibold text-slate-800">{selectedReturn.productName}</p>
                      <p className="text-sm text-slate-600 mt-1">Quantity: {selectedReturn.quantity}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500 mb-2">Return Reason</p>
                    <div className={`p-4 rounded-xl border ${getReasonColor(selectedReturn.reason)}`}>
                      <p className="text-sm font-semibold">{selectedReturn.reason}</p>
                    </div>
                  </div>

                  {selectedReturn.notes && (
                    <div>
                      <p className="text-sm text-slate-500 mb-2">Notes</p>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700">
                        {selectedReturn.notes}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <p className="text-sm text-slate-500 mb-1">Submitted</p>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(selectedReturn.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 px-8 py-5 flex justify-end space-x-3 border-t border-slate-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
