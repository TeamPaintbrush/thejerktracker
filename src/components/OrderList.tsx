import React from 'react';
import { Order } from '@/types/order';
import { getStatusColor } from '@/lib/dataStore';
import { Edit3, Download } from 'lucide-react';

interface OrderListProps {
  orders: Order[];
  ordersLoading: boolean;
  onOrderSelect: (order: Order) => void;
  onExportToCSV: () => void;
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  ordersLoading,
  onOrderSelect,
  onExportToCSV,
}) => {
  if (ordersLoading) {
    return (
      <div className="text-center py-8">Loading orders...</div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders yet.
      </div>
    );
  }

  return (
    <>
      {/* Export Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={onExportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export to CSV
        </button>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {orders.map((order, index) => (
          <div key={`${order.id}-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div className="font-semibold text-gray-800">#{order.orderNumber}</div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <button
                  onClick={() => onOrderSelect(order)}
                  className="text-orange-600 hover:text-orange-800 p-1"
                  title="Update Status"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600">
              {order.customerName && <div><strong>Customer:</strong> {order.customerName}</div>}
              {order.customerEmail && <div><strong>Email:</strong> {order.customerEmail}</div>}
              {order.orderDetails && <div><strong>Details:</strong> {order.orderDetails}</div>}
              <div><strong>Created:</strong> {order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}</div>
              {order.status === 'Picked Up' && order.pickedUpAt && (
                <div><strong>Picked Up:</strong> {order.pickedUpAt.toLocaleDateString()} {order.pickedUpAt.toLocaleTimeString()}</div>
              )}
              {order.driverName && <div><strong>Driver:</strong> {order.driverName}</div>}
              {order.deliveryCompany && <div><strong>Company:</strong> {order.deliveryCompany}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, index) => (
              <tr key={`${order.id}-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.orderNumber}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {order.customerName && <div className="font-medium text-gray-900">{order.customerName}</div>}
                    {order.customerEmail && <div className="text-gray-500">{order.customerEmail}</div>}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {order.orderDetails || '-'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{order.createdAt.toLocaleDateString()}</div>
                  <div className="text-xs">{order.createdAt.toLocaleTimeString()}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onOrderSelect(order)}
                    className="text-orange-600 hover:text-orange-900 flex items-center gap-1"
                  >
                    <Edit3 className="w-4 h-4" />
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};