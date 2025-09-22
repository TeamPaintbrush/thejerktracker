import { Order } from '@/types/order';

const STORAGE_KEY = 'jerk-tracker-orders';

// Get all orders from localStorage
export function getAllOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const orders = JSON.parse(stored);
    return orders.map((order: Order) => ({
      ...order,
      createdAt: new Date(order.createdAt),
      updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
      preparingAt: order.preparingAt ? new Date(order.preparingAt) : undefined,
      readyAt: order.readyAt ? new Date(order.readyAt) : undefined,
      outForDeliveryAt: order.outForDeliveryAt ? new Date(order.outForDeliveryAt) : undefined,
      pickedUpAt: order.pickedUpAt ? new Date(order.pickedUpAt) : undefined,
      cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : undefined,
    }));
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
}

// Get a single order by ID
export function getOrder(id: string): Order | null {
  const orders = getAllOrders();
  return orders.find(order => order.id === id) || null;
}

// Save orders to localStorage
function saveOrders(orders: Order[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving orders:', error);
  }
}

// Add a new order
export function addOrder(order: Omit<Order, 'id'>): Order {
  try {
    const orders = getAllOrders();
    const newOrder: Order = {
      ...order,
      id: generateId(),
    };
    
    orders.push(newOrder);
    saveOrders(orders);
    return newOrder;
  } catch (error) {
    console.error('Error adding order:', error);
    throw new Error('Failed to create order');
  }
}

// Update an existing order
export function updateOrder(id: string, updates: Partial<Order>): Order | null {
  try {
    const orders = getAllOrders();
    const index = orders.findIndex(order => order.id === id);
    
    if (index === -1) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    orders[index] = { ...orders[index], ...updates };
    saveOrders(orders);
    return orders[index];
  } catch (error) {
    console.error('Error updating order:', error);
    throw new Error('Failed to update order');
  }
}

// Update order status with automatic timestamp tracking
export function updateOrderStatus(
  id: string, 
  newStatus: Order['status'], 
  additionalData?: Partial<Order>
): Order | null {
  try {
    const now = new Date();
    const updates: Partial<Order> = {
      ...additionalData,
      status: newStatus,
      updatedAt: now,
    };

    // Add timestamp for specific status
    switch (newStatus) {
      case 'Preparing':
        updates.preparingAt = now;
        break;
      case 'Ready':
        updates.readyAt = now;
        break;
      case 'Out for Delivery':
        updates.outForDeliveryAt = now;
        break;
      case 'Picked Up':
        updates.pickedUpAt = now;
        break;
      case 'Cancelled':
        updates.cancelledAt = now;
        break;
    }

    return updateOrder(id, updates);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
}

// Delete an order
export function deleteOrder(id: string): boolean {
  try {
    const orders = getAllOrders();
    const filteredOrders = orders.filter(order => order.id !== id);
    
    if (filteredOrders.length === orders.length) {
      throw new Error(`Order with ID ${id} not found`);
    }
    
    saveOrders(filteredOrders);
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    throw new Error('Failed to delete order');
  }
}

// Generate a unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Export orders to CSV
export function exportToCSV(): string {
  const orders = getAllOrders();
  
  if (orders.length === 0) {
    return 'No orders to export';
  }

  const headers = [
    'Order Number',
    'Customer Name',
    'Customer Email',
    'Order Details',
    'Status',
    'Created At',
    'Picked Up At',
    'Driver Name',
    'Delivery Company'
  ];

  const rows = orders.map(order => [
    order.orderNumber,
    order.customerName || '',
    order.customerEmail || '',
    order.orderDetails || '',
    order.status,
    order.createdAt.toLocaleString(),
    order.pickedUpAt?.toLocaleString() || '',
    order.driverName || '',
    order.deliveryCompany || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  return csvContent;
}

// Helper function to get status color
export function getStatusColor(status: Order['status']): string {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'Preparing':
      return 'bg-blue-100 text-blue-800';
    case 'Ready':
      return 'bg-green-100 text-green-800';
    case 'Out for Delivery':
      return 'bg-purple-100 text-purple-800';
    case 'Picked Up':
      return 'bg-gray-100 text-gray-800';
    case 'Cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get next possible statuses
export function getNextStatuses(currentStatus: Order['status']): Order['status'][] {
  switch (currentStatus) {
    case 'Pending':
      return ['Preparing', 'Cancelled'];
    case 'Preparing':
      return ['Ready', 'Cancelled'];
    case 'Ready':
      return ['Out for Delivery', 'Picked Up', 'Cancelled'];
    case 'Out for Delivery':
      return ['Picked Up', 'Cancelled'];
    case 'Picked Up':
      return []; // Final status
    case 'Cancelled':
      return []; // Final status
    default:
      return [];
  }
}