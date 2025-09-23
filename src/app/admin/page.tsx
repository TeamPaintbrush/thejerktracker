'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/order';
import { UserRole } from '@/types/api';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import MigrationPanel from '@/components/MigrationPanel';
import { RoleGuard } from '@/hooks/useRoleAccess';
import { AdminHeader } from '@/components/AdminHeader';
import { OrderForm } from '@/components/OrderForm';
import { OrderFilters } from '@/components/OrderFilters';
import { OrderList } from '@/components/OrderList';
import { StatusUpdateModal } from '@/components/StatusUpdateModal';
import { PrintReceiptModal } from '@/components/PrintReceiptModal';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToast();
  
  const [orderNumber, setOrderNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMigrationPanel, setShowMigrationPanel] = useState(false);
  const [showPrintReceipt, setShowPrintReceipt] = useState(false);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          // Filter out duplicate orders by ID
          const uniqueOrders = (data.orders || []).filter((order: Order, index: number, arr: Order[]) => 
            arr.findIndex(o => o.id === order.id) === index
          );
          setOrders(uniqueOrders);
        } else {
          console.error('Failed to fetch orders - HTTP', response.status);
          // Don't show toast on initial load failure to prevent spam
        }
        setOrdersLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        // Only show toast if we're not in loading state (to prevent spam on initial load)
        if (!ordersLoading) {
          showToast({
            type: 'error',
            title: 'Failed to load orders',
            message: 'There was an error loading the orders. Please refresh the page.',
          });
        }
        setOrdersLoading(false);
      }
    };
    
    // Only fetch if authenticated
    if (session) {
      fetchOrders();
    }
  }, [session]); // Only depend on session, not showToast

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/orders');
        if (response.ok) {
          const data = await response.json();
          // Filter out duplicate orders by ID
          const uniqueOrders = (data.orders || []).filter((order: Order, index: number, arr: Order[]) => 
            arr.findIndex(o => o.id === order.id) === index
          );
          setOrders(uniqueOrders);
        }
      } catch (error) {
        console.error('Error refreshing orders:', error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Sign out error:', error);
      showToast({
        type: 'error',
        title: 'Sign Out Failed',
        message: 'There was an error signing out. Please try again.',
      });
    }
  };

  const handleExportToCSV = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      const ordersToExport = data.orders || [];
      
      // Generate CSV content
      const headers = ['Order Number', 'Customer Name', 'Customer Email', 'Order Details', 'Status', 'Created At'];
      const csvRows = [
        headers.join(','),
        ...ordersToExport.map((order: Order) => [
          order.orderNumber,
          order.customerName || '',
          order.customerEmail || '',
          order.orderDetails || '',
          order.status,
          order.createdAt
        ].join(','))
      ];
      const csvContent = csvRows.join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.csv';
      a.click();
      URL.revokeObjectURL(url);
      
      showToast({
        type: 'success',
        title: 'Export successful',
        message: 'Orders have been exported to CSV.',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showToast({
        type: 'error',
        title: 'Export failed',
        message: 'There was an error exporting the orders.',
      });
    }
  };

  const handleManualRefresh = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      // Filter out duplicate orders by ID
      const uniqueOrders = (data.orders || []).filter((order: Order, index: number, arr: Order[]) => 
        arr.findIndex(o => o.id === order.id) === index
      );
      setOrders(uniqueOrders);
      
      showToast({
        type: 'success',
        title: 'Refreshed',
        message: 'Orders list has been updated.',
      });
    } catch (error) {
      console.error('Error refreshing orders:', error);
      showToast({
        type: 'error',
        title: 'Refresh failed',
        message: 'Could not refresh the orders list.',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Order Number is required.',
      });
      return;
    }
    if (orderNumber.length < 3) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Order Number must be at least 3 characters.',
      });
      return;
    }
    setLoading(true);
    try {
      const url = `${window.location.origin}/order`;
      const orderData = {
        orderNumber,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        orderDetails: orderDetails || undefined,
        status: 'Pending',
        qrUrl: url,
        createdAt: new Date(),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) throw new Error('Failed to create order');

      const data = await response.json();
      const newOrder = data.order;
      
      const fullUrl = `${url}?id=${newOrder.id}`;
      setQrUrl(fullUrl);
      
      showToast({
        type: 'success',
        title: 'Order Created',
        message: `Order ${orderNumber} has been created successfully.`,
      });
      
      // Reset form
      setOrderNumber('');
      setCustomerName('');
      setCustomerEmail('');
      setOrderDetails('');
      
      // Refresh orders
      const refreshResponse = await fetch('/api/orders');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        // Filter out duplicate orders by ID
        const uniqueOrders = (refreshData.orders || []).filter((order: Order, index: number, arr: Order[]) => 
          arr.findIndex(o => o.id === order.id) === index
        );
        setOrders(uniqueOrders);
      }
    } catch (error) {
      console.error('Error adding order:', error);
      showToast({
        type: 'error',
        title: 'Order Creation Failed',
        message: 'There was an error creating the order. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = (updatedOrder: Order) => {
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder);
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedOrder(null);
  };

  const filteredOrders = orders.filter(order => {
    // Text search (order number, customer name, email)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesOrderNumber = order.orderNumber.toLowerCase().includes(searchLower);
      const matchesCustomerName = order.customerName?.toLowerCase().includes(searchLower) || false;
      const matchesCustomerEmail = order.customerEmail?.toLowerCase().includes(searchLower) || false;
      
      if (!matchesOrderNumber && !matchesCustomerName && !matchesCustomerEmail) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      const orderDate = order.createdAt.toDateString();
      const startDate = new Date(dateRange.start).toDateString();
      const endDate = new Date(dateRange.end).toDateString();
      
      if (orderDate < startDate || orderDate > endDate) {
        return false;
      }
    } else if (filterDate) {
      // Single date filter (legacy)
      const orderDate = order.createdAt.toDateString();
      const filterDateObj = new Date(filterDate).toDateString();
      if (orderDate !== filterDateObj) {
        return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setFilterDate('');
    setDateRange({ start: '', end: '' });
  };

  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    switch (preset) {
      case 'today':
        const todayStr = formatDate(today);
        setDateRange({ start: todayStr, end: todayStr });
        setFilterDate('');
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = formatDate(yesterday);
        setDateRange({ start: yesterdayStr, end: yesterdayStr });
        setFilterDate('');
        break;
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(today.getDate() - 7);
        setDateRange({ start: formatDate(last7Days), end: formatDate(today) });
        setFilterDate('');
        break;
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(today.getDate() - 30);
        setDateRange({ start: formatDate(last30Days), end: formatDate(today) });
        setFilterDate('');
        break;
      case 'thisWeek':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setDateRange({ start: formatDate(startOfWeek), end: formatDate(today) });
        setFilterDate('');
        break;
      case 'thisMonth':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({ start: formatDate(startOfMonth), end: formatDate(today) });
        setFilterDate('');
        break;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
        <div className="max-w-6xl mx-auto">
          <AdminHeader
            autoRefresh={autoRefresh}
            setAutoRefresh={setAutoRefresh}
            onManualRefresh={handleManualRefresh}
            onSignOut={handleSignOut}
          />

          <OrderForm
            orderNumber={orderNumber}
            setOrderNumber={setOrderNumber}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            orderDetails={orderDetails}
            setOrderDetails={setOrderDetails}
            qrUrl={qrUrl}
            loading={loading}
            onSubmit={handleSubmit}
            onPrintReceipt={(order) => {
              setPrintOrder(order);
              setShowPrintReceipt(true);
            }}
            latestOrder={orders[0]}
          />
        </div>

        {/* Admin-only Migration Panel */}
        <RoleGuard roles={UserRole.ADMIN}>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Data Migration</h2>
              <button
                onClick={() => setShowMigrationPanel(!showMigrationPanel)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                {showMigrationPanel ? 'Hide Migration Panel' : 'Show Migration Panel'}
              </button>
            </div>
            
            {showMigrationPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MigrationPanel />
              </motion.div>
            )}
          </div>
        </RoleGuard>

          <OrderFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateRange={dateRange}
            setDateRange={setDateRange}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onClearFilters={clearFilters}
            onDateRangePreset={setDateRangePreset}
            totalOrders={orders.length}
            filteredOrdersCount={filteredOrders.length}
          />

          <OrderList
            orders={filteredOrders}
            ordersLoading={ordersLoading}
            onOrderSelect={handleOrderSelect}
            onExportToCSV={handleExportToCSV}
          />
        </div>

        <StatusUpdateModal
          selectedOrder={selectedOrder}
          showStatusModal={showStatusModal}
          onClose={handleCloseModal}
          onUpdate={handleStatusUpdate}
        />

        <PrintReceiptModal
          printOrder={printOrder}
          showPrintReceipt={showPrintReceipt}
          onClose={() => {
            setShowPrintReceipt(false);
            setPrintOrder(null);
          }}
        />
    </ErrorBoundary>
  );
}