'use client';

import { useState } from 'react';
import { Order } from '@/types/order';
import { updateOrderStatus, getStatusColor, getNextStatuses } from '@/lib/dataStore';
import { useToast } from '@/components/Toast';
import { Check, Clock, Truck, Package, Ban } from 'lucide-react';

interface StatusUpdateProps {
  order: Order;
  onUpdate: (updatedOrder: Order) => void;
}

export default function StatusUpdate({ order, onUpdate }: StatusUpdateProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState(order.notes || '');

  const statusIcons = {
    'Pending': Clock,
    'Preparing': Package,
    'Ready': Check,
    'Out for Delivery': Truck,
    'Picked Up': Check,
    'Cancelled': Ban,
  };

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    setLoading(true);
    try {
      const updatedOrder = updateOrderStatus(order.id, newStatus, { notes });
      if (updatedOrder) {
        onUpdate(updatedOrder);
        showToast({
          type: 'success',
          title: 'Status Updated',
          message: `Order ${order.orderNumber} status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'Could not update the order status.',
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStatuses = getNextStatuses(order.status);
  const StatusIcon = statusIcons[order.status];

  return (
    <div className="space-y-4">
      {/* Current Status */}
      <div className="flex items-center gap-3">
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${getStatusColor(order.status)}`}>
          <StatusIcon className="w-4 h-4" />
          {order.status}
        </div>
        {order.updatedAt && (
          <span className="text-xs text-gray-500">
            Updated: {order.updatedAt.toLocaleString()}
          </span>
        )}
      </div>

      {/* Status History */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Status History:</h4>
        <div className="space-y-1 text-xs text-gray-600">
          <div>Created: {order.createdAt.toLocaleString()}</div>
          {order.preparingAt && <div>Started Preparing: {order.preparingAt.toLocaleString()}</div>}
          {order.readyAt && <div>Ready: {order.readyAt.toLocaleString()}</div>}
          {order.outForDeliveryAt && <div>Out for Delivery: {order.outForDeliveryAt.toLocaleString()}</div>}
          {order.pickedUpAt && <div>Picked Up: {order.pickedUpAt.toLocaleString()}</div>}
          {order.cancelledAt && <div>Cancelled: {order.cancelledAt.toLocaleString()}</div>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes:
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this order..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          rows={2}
        />
      </div>

      {/* Next Status Buttons */}
      {nextStatuses.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Update Status:</h4>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => {
              const StatusIconNext = statusIcons[status];
              return (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={loading}
                  className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    status === 'Cancelled'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  <StatusIconNext className="w-4 h-4" />
                  {status}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {nextStatuses.length === 0 && (
        <div className="text-sm text-gray-500 italic">
          This order has reached its final status.
        </div>
      )}
    </div>
  );
}