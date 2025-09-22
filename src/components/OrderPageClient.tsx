'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order } from '@/types/order';
import { getOrder, updateOrderStatus } from '@/lib/dataStore';
import { useToast } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function OrderPageClient() {
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverName, setDriverName] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchOrder = () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      
      try {
        const order = getOrder(orderId);
        setOrder(order);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order:', error);
        showToast({
          type: 'error',
          title: 'Failed to load order',
          message: 'There was an error loading the order details.',
        });
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, showToast]);

  // Auto-refresh order status every 5 seconds
  useEffect(() => {
    if (!orderId || submitted || order?.status === 'Picked Up') return;

    const interval = setInterval(() => {
      try {
        const updatedOrder = getOrder(orderId);
        if (updatedOrder && updatedOrder.status !== order?.status) {
          setOrder(updatedOrder);
        }
      } catch (error) {
        console.error('Error auto-refreshing order:', error);
        showToast({
          type: 'warning',
          title: 'Auto-refresh failed',
          message: 'Could not refresh order status automatically.',
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [orderId, submitted, order?.status, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !orderId) return;

    try {
      updateOrderStatus(orderId, 'Picked Up', {
        driverName: driverName || undefined,
        deliveryCompany: deliveryCompany || undefined,
      });
      setSubmitted(true);
      showToast({
        type: 'success',
        title: 'Order Updated',
        message: 'Order has been marked as picked up successfully.',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: 'There was an error updating the order status.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading order...</div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Order</h1>
          <p>No order ID provided in the URL.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p>The order you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  if (submitted || order.status === 'Picked Up') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
        <div className="text-center p-6 sm:p-8 bg-white rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-600 mb-4">✓ Order Confirmed</h1>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">Order #{order.orderNumber} has been picked up!</p>
          <div className="text-xs sm:text-sm text-gray-500 space-y-1">
            <p>Picked up at: {order.pickedUpAt?.toLocaleString()}</p>
            {order.driverName && <p>Driver: {order.driverName}</p>}
            {order.deliveryCompany && <p>Company: {order.deliveryCompany}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-4 px-4 sm:py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">Order Pickup</h1>
        
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Order Details</h2>
          <div className="space-y-1 text-sm sm:text-base">
            <p><strong>Order #:</strong> {order.orderNumber}</p>
            {order.customerName && <p><strong>Customer:</strong> {order.customerName}</p>}
            {order.orderDetails && <p><strong>Details:</strong> {order.orderDetails}</p>}
            <p><strong>Status:</strong> <span className="text-yellow-600">{order.status}</span></p>
            <p><strong>Created:</strong> {order.createdAt.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="driverName" className="block text-sm font-medium text-gray-700 mb-1">
              Driver Name (optional)
            </label>
            <input
              type="text"
              id="driverName"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter driver name"
            />
          </div>

          <div>
            <label htmlFor="deliveryCompany" className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Company (optional)
            </label>
            <input
              type="text"
              id="deliveryCompany"
              value={deliveryCompany}
              onChange={(e) => setDeliveryCompany(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Enter delivery company"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 sm:py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-base sm:text-sm mt-6 transition-colors"
          >
            Confirm Pickup
          </button>
        </form>
      </div>
      </div>
    </ErrorBoundary>
  );
}