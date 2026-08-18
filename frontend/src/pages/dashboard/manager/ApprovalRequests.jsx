import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, AlertCircle, User, Package,
  FileText, TrendingUp, Search, Filter, RefreshCw, Eye
} from 'lucide-react';
import api from '../../../services/api';
import Button from '../../../components/common/Button';
import Loading from '../../../components/common/Loading';
import EmptyState from '../../../components/common/EmptyState';
import Modal from '../../../components/common/Modal';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ApprovalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadApprovalRequests();
  }, []);

  const loadApprovalRequests = async () => {
    try {
      setLoading(true);
      setError('');

      // In production, this would call: await api.get('/approvals')
      // For now, showing empty state since this feature isn't built yet
      setRequests([]);

    } catch (err) {
      console.warn('Approvals API not available:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      setError('');
      // await api.post(`/approvals/${requestId}/approve`);
      
      setSuccess('Request approved successfully!');
      await loadApprovalRequests();
      setIsDetailModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId, reason) => {
    try {
      setError('');
      // await api.post(`/approvals/${requestId}/reject`, { reason });
      
      setSuccess('Request rejected');
      await loadApprovalRequests();
      setIsDetailModalOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          req.requestedBy?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    total: requests.length
  };

  if (loading) {
    return <Loading message="Loading approval requests..." />;
  }

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
          <h1 className="text-2xl font-bold text-slate-900">Approval Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve pending requests across the workflow
          </p>
        </div>
        <Button onClick={loadApprovalRequests} className="bg-white border border-slate-200">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
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
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Approved</p>
              <p className="text-2xl font-bold text-slate-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Rejected</p>
              <p className="text-2xl font-bold text-slate-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl border border-slate-200">
        {filteredRequests.length === 0 ? (
          <EmptyState
            title="No approval requests"
            description="There are no pending requests at this time. Requests from staff will appear here."
            icon={FileText}
          />
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedRequest(request);
                  setIsDetailModalOpen(true);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        request.status === 'approved' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{request.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {request.requestedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {request.createdAt}
                      </span>
                    </div>
                  </div>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Request Details"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">{selectedRequest.title}</h3>
              <p className="text-sm text-slate-600">{selectedRequest.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Requested by:</span>
                <p className="font-medium">{selectedRequest.requestedBy}</p>
              </div>
              <div>
                <span className="text-slate-500">Date:</span>
                <p className="font-medium">{selectedRequest.createdAt}</p>
              </div>
            </div>

            {selectedRequest.status === 'pending' && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleReject(selectedRequest.id, 'Rejected by manager')}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest.id)}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
