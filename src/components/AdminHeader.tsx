import React from 'react';
import { useSession } from 'next-auth/react';
import { LogOut, User, Shield, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

interface AdminHeaderProps {
  autoRefresh: boolean;
  setAutoRefresh: (value: boolean) => void;
  onManualRefresh: () => void;
  onSignOut: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  autoRefresh,
  setAutoRefresh,
  onManualRefresh,
  onSignOut,
}) => {
  const { data: session } = useSession();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage orders and track pickups</p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{session?.user?.name || session?.user?.email}</span>
              {session?.user?.role === 'ADMIN' && (
                <div title="Admin">
                  <Shield className="w-4 h-4 text-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Auto-refresh:</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Manual refresh */}
            <button
              onClick={onManualRefresh}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>

            {/* Sign out */}
            <button
              onClick={onSignOut}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};