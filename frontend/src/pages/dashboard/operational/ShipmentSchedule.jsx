import { useState, useEffect } from 'react';
import { Calendar, Truck, Package, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { fetchShipments } from '../../../services/api';

export default function ShipmentSchedule() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    loadShipments();
  }, []);

  const loadShipments = async () => {
    try {
      setLoading(true);
      const data = await fetchShipments({ limit: 100 });
      setShipments(data.shipments || []);
      setError(null);
    } catch (err) {
      console.error('Error loading shipments:', err);
      setError('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      IN_TRANSIT: 'bg-blue-100 text-blue-800 border-blue-300',
      RECEIVED: 'bg-green-100 text-green-800 border-green-300',
      CANCELLED: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'IN_TRANSIT':
        return <Truck className="h-4 w-4" />;
      case 'RECEIVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELLED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getDaysUntilArrival = (arrivalDate) => {
    if (!arrivalDate) return null;
    const today = new Date();
    const arrival = new Date(arrivalDate);
    const diffTime = arrival - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getArrivalStatus = (shipment) => {
    if (shipment.status === 'RECEIVED') return 'Received';
    if (shipment.status === 'CANCELLED') return 'Cancelled';
    
    const daysUntil = getDaysUntilArrival(shipment.expected_arrival_date);
    if (daysUntil === null) return 'Date not set';
    if (daysUntil < 0) return `Overdue by ${Math.abs(daysUntil)} days`;
    if (daysUntil === 0) return 'Arriving today';
    if (daysUntil === 1) return 'Arriving tomorrow';
    return `${daysUntil} days away`;
  };

  // Group shipments by status for dashboard cards
  const statusCounts = {
    PENDING: shipments.filter(s => s.status === 'PENDING').length,
    IN_TRANSIT: shipments.filter(s => s.status === 'IN_TRANSIT').length,
    RECEIVED: shipments.filter(s => s.status === 'RECEIVED').length
  };

  // Sort shipments by arrival date
  const sortedShipments = [...shipments].sort((a, b) => {
    if (!a.expected_arrival_date) return 1;
    if (!b.expected_arrival_date) return -1;
    return new Date(a.expected_arrival_date) - new Date(b.expected_arrival_date);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading shipment schedule...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipment Schedule</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track expected arrival dates and shipment status
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Calendar View
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Status Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-800 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-900">{statusCounts.PENDING}</p>
            </div>
            <Clock className="h-10 w-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800 font-medium">In Transit</p>
              <p className="text-3xl font-bold text-blue-900">{statusCounts.IN_TRANSIT}</p>
            </div>
            <Truck className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-800 font-medium">Received</p>
              <p className="text-3xl font-bold text-green-900">{statusCounts.RECEIVED}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">
            Upcoming & Active Shipments
          </h2>
        </div>

        {sortedShipments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No shipments scheduled</p>
            <p className="mt-1 text-sm">Create a shipment to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedShipments.map((shipment) => {
              const daysUntil = getDaysUntilArrival(shipment.expected_arrival_date);
              const isOverdue = daysUntil !== null && daysUntil < 0 && shipment.status !== 'RECEIVED';

              return (
                <div
                  key={shipment.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isOverdue ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(shipment.status)}`}>
                          {getStatusIcon(shipment.status)}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {shipment.shipment_number}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {shipment.suppliers?.name || 'Unknown Supplier'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Container:</span>
                          <p className="font-semibold text-gray-900">{shipment.container_number}</p>
                        </div>

                        <div>
                          <span className="text-gray-500">Expected Quantity:</span>
                          <p className="font-semibold text-gray-900">{shipment.expected_quantity || 0} units</p>
                        </div>

                        <div>
                          <span className="text-gray-500">Expected Arrival:</span>
                          <p className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                            {shipment.expected_arrival_date
                              ? new Date(shipment.expected_arrival_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })
                              : 'Not set'}
                          </p>
                        </div>

                        <div>
                          <span className="text-gray-500">Status:</span>
                          <p className={`font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-900'}`}>
                            {getArrivalStatus(shipment)}
                            {isOverdue && ' ⚠️'}
                          </p>
                        </div>
                      </div>

                      {shipment.received_date && (
                        <div className="mt-3 text-sm text-green-700">
                          <CheckCircle className="h-4 w-4 inline mr-1" />
                          Received on {new Date(shipment.received_date).toLocaleDateString()}
                          {shipment.actual_quantity && ` - ${shipment.actual_quantity} units`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Timeline View (Simplified) */}
      {viewMode === 'calendar' && sortedShipments.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline View</h3>
          <div className="space-y-4">
            {sortedShipments
              .filter(s => s.expected_arrival_date && s.status !== 'RECEIVED' && s.status !== 'CANCELLED')
              .map((shipment, index) => {
                const daysUntil = getDaysUntilArrival(shipment.expected_arrival_date);
                const isOverdue = daysUntil < 0;

                return (
                  <div key={shipment.id} className="flex items-center space-x-4">
                    <div className={`w-24 text-right text-sm font-semibold ${isOverdue ? 'text-red-700' : 'text-gray-700'}`}>
                      {new Date(shipment.expected_arrival_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-blue-500'} border-4 border-white shadow`} />
                      {index < sortedShipments.length - 1 && (
                        <div className="absolute top-4 left-1.5 w-0.5 h-8 bg-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{shipment.shipment_number}</p>
                          <p className="text-sm text-gray-600">{shipment.container_number}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                          {getArrivalStatus(shipment)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Shipment Schedule Guide</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• <strong>Pending:</strong> Shipment registered but not yet in transit</li>
          <li>• <strong>In Transit:</strong> Shipment on the way to warehouse</li>
          <li>• <strong>Received:</strong> Shipment received and registered in inventory</li>
          <li>• Overdue shipments are highlighted in red</li>
          <li>• Use Inventory Registration to mark shipments as received</li>
        </ul>
      </div>
    </div>
  );
}
