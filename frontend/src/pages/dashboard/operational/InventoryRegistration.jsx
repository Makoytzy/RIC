import { useState, useEffect } from 'react';
import { PackageCheck, Truck, CheckCircle, AlertCircle, Calendar, User } from 'lucide-react';
import { fetchShipments, receiveShipment } from '../../../services/api';

export default function InventoryRegistration() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [receivingShipment, setReceivingShipment] = useState(null);

  const [receiveFormData, setReceiveFormData] = useState({
    actual_quantity: '',
    notes: ''
  });

  useEffect(() => {
    loadPendingShipments();
  }, []);

  const loadPendingShipments = async () => {
    try {
      setLoading(true);
      // Load shipments that are pending or in transit (not yet received)
      const data = await fetchShipments({ status: 'PENDING' });
      const data2 = await fetchShipments({ status: 'IN_TRANSIT' });
      
      const allShipments = [
        ...(data.shipments || []),
        ...(data2.shipments || [])
      ];
      
      setShipments(allShipments);
      setError(null);
    } catch (err) {
      console.error('Error loading shipments:', err);
      setError('Failed to load shipments');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReceiving = (shipment) => {
    setReceivingShipment(shipment);
    setReceiveFormData({
      actual_quantity: shipment.expected_quantity || '',
      notes: ''
    });
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await receiveShipment(receivingShipment.id, {
        actual_quantity: parseInt(receiveFormData.actual_quantity) || 0,
        notes: receiveFormData.notes
      });

      setSuccess(`Shipment ${receivingShipment.shipment_number} received successfully!`);
      
      // Reset and reload
      setReceivingShipment(null);
      setReceiveFormData({ actual_quantity: '', notes: '' });
      await loadPendingShipments();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error receiving shipment:', err);
      setError(err.response?.data?.error || 'Failed to receive shipment');
    } finally {
      setLoading(false);
    }
  };

  const cancelReceiving = () => {
    setReceivingShipment(null);
    setReceiveFormData({ actual_quantity: '', notes: '' });
  };

  if (loading && shipments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading shipments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventory Registration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Receive and register incoming shipments into inventory
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Receiving Modal/Form */}
      {receivingShipment && (
        <div className="bg-white shadow rounded-lg p-6 border-2 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Receive Shipment: {receivingShipment.shipment_number}
            </h2>
            <button
              onClick={cancelReceiving}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Container Number:</span>
                <span className="ml-2 font-semibold">{receivingShipment.container_number}</span>
              </div>
              <div>
                <span className="text-gray-600">BL Number:</span>
                <span className="ml-2 font-semibold">{receivingShipment.bl_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Supplier:</span>
                <span className="ml-2 font-semibold">{receivingShipment.suppliers?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Expected Quantity:</span>
                <span className="ml-2 font-semibold">{receivingShipment.expected_quantity || 0} units</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleReceiveSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Quantity Received *
              </label>
              <input
                type="number"
                value={receiveFormData.actual_quantity}
                onChange={(e) => setReceiveFormData({ ...receiveFormData, actual_quantity: e.target.value })}
                required
                min="0"
                placeholder="Enter actual quantity received"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Verify the actual quantity received against expected: {receivingShipment.expected_quantity}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receiving Notes
              </label>
              <textarea
                value={receiveFormData.notes}
                onChange={(e) => setReceiveFormData({ ...receiveFormData, notes: e.target.value })}
                rows="3"
                placeholder="Any notes about condition, discrepancies, or observations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={cancelReceiving}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <PackageCheck className="h-4 w-4 mr-2" />
                {loading ? 'Receiving...' : 'Confirm Receipt'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pending Shipments List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Pending Shipments ({shipments.length})
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Shipments awaiting receipt and inventory registration
          </p>
        </div>

        {shipments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Truck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium">No pending shipments</p>
            <p className="mt-1 text-sm">All shipments have been received</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Truck className="h-6 w-6 text-blue-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {shipment.shipment_number}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Container: {shipment.container_number}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        shipment.status === 'PENDING' 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <div>
                          <span className="text-gray-500">Supplier:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {shipment.suppliers?.name || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <PackageCheck className="h-4 w-4 mr-2" />
                        <div>
                          <span className="text-gray-500">Expected Qty:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {shipment.expected_quantity || 0} units
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <div>
                          <span className="text-gray-500">Expected:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {shipment.expected_arrival_date
                              ? new Date(shipment.expected_arrival_date).toLocaleDateString()
                              : 'Not set'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {shipment.bl_number && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">BL Number:</span> {shipment.bl_number}
                      </div>
                    )}

                    {shipment.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Notes:</span> {shipment.notes}
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <button
                      onClick={() => handleStartReceiving(shipment)}
                      disabled={receivingShipment !== null}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PackageCheck className="h-4 w-4 mr-2" />
                      Receive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Receiving Process</h4>
        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click "Receive" on a pending shipment</li>
          <li>Verify and enter the actual quantity received</li>
          <li>Add any notes about the shipment condition</li>
          <li>Confirm receipt to register inventory</li>
          <li>After receiving, create batches in Batch Management</li>
          <li>Generate barcodes for the batch in Barcode Generation</li>
        </ol>
      </div>
    </div>
  );
}
