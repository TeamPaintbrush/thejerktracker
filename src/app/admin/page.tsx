'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Order } from '@/types/order';
import { getAllOrders, addOrder, exportToCSV, getStatusColor } from '@/lib/dataStore';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Download, RefreshCw, ToggleLeft, ToggleRight, Search, Filter, Edit3, LogOut, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import StatusUpdate from '@/components/StatusUpdate';
import MigrationPanel from '@/components/MigrationPanel';

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
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showMigrationPanel, setShowMigrationPanel] = useState(false);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchOrders = () => {
      try {
        const ordersData = getAllOrders();
        setOrders(ordersData);
        setOrdersLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        showToast({
          type: 'error',
          title: 'Failed to load orders',
          message: 'There was an error loading the orders. Please refresh the page.',
        });
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [showToast]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      try {
        const updatedOrders = getAllOrders();
        setOrders(updatedOrders);
      } catch (error) {
        console.error('Error auto-refreshing orders:', error);
        showToast({
          type: 'warning',
          title: 'Auto-refresh failed',
          message: 'Could not refresh orders automatically.',
        });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, showToast]);

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

  const handleExportToCSV = () => {
    try {
      const csvContent = exportToCSV();
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

  const handleManualRefresh = () => {
    try {
      const updatedOrders = getAllOrders();
      setOrders(updatedOrders);
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
      const newOrder = addOrder({
        orderNumber,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        orderDetails: orderDetails || undefined,
        status: 'Pending',
        qrUrl: url,
        createdAt: new Date(),
      });
      
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
      const updatedOrders = getAllOrders();
      setOrders(updatedOrders);
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

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Admin Dashboard</h1>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Welcome, {session.user?.name || session.user?.email}</span>
                {session.user?.role && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                    {session.user.role}
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          
          {/* Create Order Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6 sm:mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              </div>
            </motion.div>
          )}
        </div>

        {/* Data Migration Panel */}
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

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">All Orders</h2>
            <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
              {/* Auto-refresh toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Auto-refresh:</span>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
                >
                  {autoRefresh ? <ToggleRight className="w-5 h-5 sm:w-6 sm:h-6" /> : <ToggleLeft className="w-5 h-5 sm:w-6 sm:h-6" />}
                </button>
              </div>
              
              {/* Manual refresh button */}
              <button
                onClick={handleManualRefresh}
                className="bg-blue-500 text-white px-2 sm:px-3 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              {/* Export button */}
              <button
                onClick={handleExportToCSV}
                className="bg-green-500 text-white px-2 sm:px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Enhanced Search and Filter Controls */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
              {/* Search input */}
              <div className="flex-1 min-w-0 sm:min-w-64">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Clear filters button */}
              <button
                onClick={clearFilters}
                className="w-full sm:w-auto bg-gray-500 text-white px-3 py-3 sm:py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
              >
                Clear Filters
              </button>
            </div>

            {/* Date range filters */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Date Range:</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="hidden sm:inline text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="hidden sm:block text-sm text-gray-500">OR</div>
              
              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-600">Single Date:</span>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            
            {/* Results summary */}
            <div className="text-xs sm:text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
              {(searchTerm || statusFilter !== 'all' || filterDate || dateRange.start || dateRange.end) && 
                <span className="text-orange-600 ml-1">(filtered)</span>
              }
            </div>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filterDate ? 'No orders found for the selected date.' : 'No orders yet.'}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block sm:hidden space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-gray-800">#{order.orderNumber}</div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <button
                          onClick={() => handleOrderSelect(order)}
                          className="bg-orange-600 text-white p-1.5 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          title="Update Status"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      {order.customerName && <div><strong>Customer:</strong> {order.customerName}</div>}
                      {order.customerEmail && <div><strong>Email:</strong> {order.customerEmail}</div>}
                      {order.orderDetails && <div><strong>Details:</strong> {order.orderDetails}</div>}
                      <div><strong>Created:</strong> {order.createdAt.toLocaleString()}</div>
                      {order.updatedAt && order.updatedAt.getTime() !== order.createdAt.getTime() && (
                        <div><strong>Last Updated:</strong> {order.updatedAt.toLocaleString()}</div>
                      )}
                      {order.driverName && <div><strong>Driver:</strong> {order.driverName}</div>}
                      {order.deliveryCompany && <div><strong>Company:</strong> {order.deliveryCompany}</div>}
                      {order.notes && <div><strong>Notes:</strong> {order.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Order #</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Details</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Created</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Last Updated</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Driver</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{order.orderNumber}</td>
                        <td className="border border-gray-300 px-4 py-2">{order.customerName || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2">{order.customerEmail || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2">{order.orderDetails || '-'}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {order.createdAt.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {order.updatedAt?.toLocaleString() || order.createdAt.toLocaleString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {order.driverName || '-'}
                          {order.deliveryCompany && <br />}
                          {order.deliveryCompany && (
                            <span className="text-sm text-gray-500">{order.deliveryCompany}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <button
                            onClick={() => handleOrderSelect(order)}
                            className="bg-orange-600 text-white p-2 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            title="Update Status"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  ×
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-1 text-sm">
                  {selectedOrder.customerName && <div><strong>Customer:</strong> {selectedOrder.customerName}</div>}
                  {selectedOrder.customerEmail && <div><strong>Email:</strong> {selectedOrder.customerEmail}</div>}
                  {selectedOrder.orderDetails && <div><strong>Details:</strong> {selectedOrder.orderDetails}</div>}
                  {selectedOrder.driverName && <div><strong>Driver:</strong> {selectedOrder.driverName}</div>}
                  {selectedOrder.deliveryCompany && <div><strong>Company:</strong> {selectedOrder.deliveryCompany}</div>}
                </div>
              </div>

              <StatusUpdate 
                order={selectedOrder} 
                onUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}