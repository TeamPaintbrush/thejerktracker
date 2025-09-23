import React from 'react';
import { Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Order } from '@/types/order';

interface OrderFormProps {
  orderNumber: string;
  setOrderNumber: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerEmail: string;
  setCustomerEmail: (value: string) => void;
  orderDetails: string;
  setOrderDetails: (value: string) => void;
  qrUrl: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onPrintReceipt: (order: Order) => void;
  latestOrder?: Order;
}

export const OrderForm: React.FC<OrderFormProps> = ({
  orderNumber,
  setOrderNumber,
  customerName,
  setCustomerName,
  customerEmail,
  setCustomerEmail,
  orderDetails,
  setOrderDetails,
  qrUrl,
  loading,
  onSubmit,
  onPrintReceipt,
  latestOrder,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Create New Order</h2>

      <form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Order Number *
            </label>
            <input
              type="text"
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter order number"
              required
            />
          </div>

          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter customer name"
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              id="customerEmail"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter customer email"
            />
          </div>

          <div>
            <label htmlFor="orderDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Order Details
            </label>
            <input
              type="text"
              id="orderDetails"
              value={orderDetails}
              onChange={(e) => setOrderDetails(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter order details"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-orange-500 text-white px-6 py-3 sm:py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 flex items-center justify-center gap-2 text-base sm:text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>

      {/* QR Code Display */}
      {qrUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-100 p-4 rounded-lg mb-4 sm:mb-6"
        >
          <h3 className="text-base sm:text-lg font-semibold mb-4">Order Created Successfully!</h3>
          <div className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={qrUrl} size={120} />
            </div>
            <div className="text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-2">QR Code URL:</p>
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:underline text-xs sm:text-sm break-all"
              >
                {qrUrl}
              </a>
            </div>
            {latestOrder && (
              <button
                onClick={() => onPrintReceipt(latestOrder)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm flex items-center gap-2"
              >
                🖨️ Print Receipt
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};