import React from 'react';
import { Plus } from 'lucide-react';

interface UserTableHeaderProps {
  onCreateUser: () => void;
}

export const UserTableHeader: React.FC<UserTableHeaderProps> = ({ onCreateUser }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h2>
      </div>
      <button
        onClick={onCreateUser}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Create User
      </button>
    </div>
  );
};