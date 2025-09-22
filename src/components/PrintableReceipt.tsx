import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Order } from '@/types/order';

interface PrintableReceiptProps {
  order: Order;
  qrUrl: string;
  restaurantName?: string;
  restaurantAddress?: string;
  restaurantPhone?: string;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  order,
  qrUrl,
  restaurantName = "The JERK Tracker Restaurant",
  restaurantAddress = "123 Main Street, City, State 12345",
  restaurantPhone = "(555) 123-4567"
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-md mx-auto bg-white">
      {/* Print Button - Only visible on screen */}
      <div className="no-print mb-4 text-center">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          🖨️ Print Receipt
        </button>
      </div>

      {/* Receipt Content */}
      <div className="receipt-content p-6 border border-gray-200 rounded-lg">
        {/* Restaurant Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-2">{restaurantName}</h1>
          <p className="text-sm text-gray-600">{restaurantAddress}</p>
          <p className="text-sm text-gray-600">{restaurantPhone}</p>
          <div className="border-b border-gray-300 mt-3 mb-3"></div>
        </div>

        {/* Order Information */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Order Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Order #:</span>
              <span>{order.orderNumber}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span className="font-medium">Customer:</span>
                <span>{order.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`font-medium ${
                order.status === 'Picked Up' ? 'text-green-600' : 
                order.status === 'Ready' ? 'text-orange-600' : 'text-gray-600'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Created:</span>
              <span>{order.createdAt.toLocaleString()}</span>
            </div>
            {order.pickedUpAt && (
              <div className="flex justify-between">
                <span className="font-medium">Picked Up:</span>
                <span>{order.pickedUpAt.toLocaleString()}</span>
              </div>
            )}
            {order.driverName && (
              <div className="flex justify-between">
                <span className="font-medium">Driver:</span>
                <span>{order.driverName}</span>
              </div>
            )}
            {order.deliveryCompany && (
              <div className="flex justify-between">
                <span className="font-medium">Delivery Company:</span>
                <span>{order.deliveryCompany}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Details */}
        {order.orderDetails && (
          <div className="mb-6">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Order Items</h3>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
              {order.orderDetails}
            </p>
          </div>
        )}

        {/* QR Code Section */}
        <div className="text-center mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-3">Order Tracking QR Code</h3>
          <div className="flex justify-center mb-3">
            <QRCodeSVG value={qrUrl} size={150} />
          </div>
          <p className="text-xs text-gray-600 break-all">{qrUrl}</p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-3">
          <p>Thank you for your order!</p>
          <p>Scan the QR code above to track your order status</p>
          <p className="mt-2">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .receipt-content {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 20px !important;
            max-width: none !important;
          }
          
          body {
            font-size: 12px !important;
            line-height: 1.4 !important;
          }
          
          h1 {
            font-size: 18px !important;
            margin-bottom: 10px !important;
          }
          
          h2 {
            font-size: 16px !important;
            margin-bottom: 8px !important;
          }
          
          h3 {
            font-size: 14px !important;
            margin-bottom: 6px !important;
          }
          
          .text-sm {
            font-size: 11px !important;
          }
          
          .text-xs {
            font-size: 10px !important;
          }
          
          /* Ensure QR code prints clearly */
          svg {
            max-width: 120px !important;
            height: auto !important;
          }
          
          /* Remove unnecessary spacing for print */
          .mb-6 {
            margin-bottom: 15px !important;
          }
          
          .mb-3 {
            margin-bottom: 8px !important;
          }
          
          .mb-2 {
            margin-bottom: 5px !important;
          }
          
          .p-6 {
            padding: 15px !important;
          }
          
          .p-3 {
            padding: 8px !important;
          }
          
          .pt-3 {
            padding-top: 8px !important;
          }
          
          /* Ensure colors print well */
          .text-green-600 {
            color: #16a34a !important;
          }
          
          .text-orange-600 {
            color: #ea580c !important;
          }
          
          .text-gray-600 {
            color: #4b5563 !important;
          }
          
          .text-gray-700 {
            color: #374151 !important;
          }
          
          .text-gray-800 {
            color: #1f2937 !important;
          }
          
          .bg-gray-50 {
            background-color: #f9fafb !important;
          }
          
          /* Force page break after receipt if needed */
          .receipt-content {
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableReceipt;