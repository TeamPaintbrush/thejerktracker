import React from 'react';
import { Search, Filter } from 'lucide-react';

interface OrderFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
  filterDate: string;
  setFilterDate: (value: string) => void;
  onClearFilters: () => void;
  onDateRangePreset: (preset: string) => void;
  totalOrders: number;
  filteredOrdersCount: number;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateRange,
  setDateRange,
  filterDate,
  setFilterDate,
  onClearFilters,
  onDateRangePreset,
  totalOrders,
  filteredOrdersCount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Orders
        </h2>
        <button
          onClick={onClearFilters}
          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
        >
          Clear Filters
        </button>
      </div>

      <div className="space-y-4">
        {/* Search and Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="space-y-3">
          {/* Quick date presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs sm:text-sm text-gray-600 self-center">Quick filters:</span>
            <button
              onClick={() => onDateRangePreset('today')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => onDateRangePreset('yesterday')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={() => onDateRangePreset('thisWeek')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => onDateRangePreset('last7days')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => onDateRangePreset('thisMonth')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => onDateRangePreset('last30days')}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Last 30 Days
            </button>
          </div>

          {/* Custom date range */}
          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
            <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-2">
              <span className="text-xs sm:text-sm text-gray-600">Custom Range:</span>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Start date"
              />
              <span className="hidden sm:inline text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-3 sm:py-2 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="End date"
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
        </div>

        {/* Results summary */}
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {filteredOrdersCount} of {totalOrders} orders
          {(searchTerm || statusFilter !== 'all' || filterDate || dateRange.start || dateRange.end) &&
            <span className="text-orange-600 ml-1">(filtered)</span>
          }
        </div>
      </div>
    </div>
  );
};