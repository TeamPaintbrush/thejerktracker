export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  orderDetails?: string;
  status: 'Pending' | 'Preparing' | 'Ready' | 'Out for Delivery' | 'Picked Up' | 'Cancelled';
  qrUrl: string;
  createdAt: Date;
  updatedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  outForDeliveryAt?: Date;
  pickedUpAt?: Date;
  cancelledAt?: Date;
  driverName?: string;
  deliveryCompany?: string;
  notes?: string;
}