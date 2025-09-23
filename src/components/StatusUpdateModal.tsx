import React from 'react';
import { Order } from '@/types/order';
import StatusUpdate from '@/components/StatusUpdate';

interface StatusUpdateModalProps {
  selectedOrder: Order | null;
  showStatusModal: boolean;
  onClose: () => void;
  onUpdate: (updatedOrder: Order) => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  selectedOrder,
  showStatusModal,
  onClose,
  onUpdate,
}) => {
  if (!selectedOrder || !showStatusModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Update Order Status</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="space-y-1 text-sm">
              <div><strong>Order:</strong> #{selectedOrder.orderNumber}</div>
              {selectedOrder.customerName && <div><strong>Customer:</strong> {selectedOrder.customerName}</div>}
              {selectedOrder.customerEmail && <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>}
              {selectedOrder.orderDetails && <div><strong>Details:</strong> {selectedOrder.orderDetails}</div>}
              {selectedOrder.driverName && <div><strong>Driver:</strong> {selectedOrder.driverName}</div>}
              {selectedOrder.deliveryCompany && <div><strong>Company:</strong> {selectedOrder.deliveryCompany}</div>}
            </div>
          </div>

          <StatusUpdate
            order={selectedOrder}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
};