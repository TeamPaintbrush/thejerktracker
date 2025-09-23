import React from 'react';
import { Order } from '@/types/order';
import { PrintableReceipt } from '@/components/PrintableReceipt';

interface PrintReceiptModalProps {
  printOrder: Order | null;
  showPrintReceipt: boolean;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  printOrder,
  showPrintReceipt,
  onClose,
}) => {
  if (!printOrder || !showPrintReceipt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Print Receipt</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              ×
            </button>
          </div>

          <PrintableReceipt
            order={printOrder}
            qrUrl={`${window.location.origin}/order?id=${printOrder.id}`}
          />
        </div>
      </div>
    </div>
  );
};