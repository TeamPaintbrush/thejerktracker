import React from 'react';
import { Edit3, Trash2, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  restaurantId: string | null;
  restaurant: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface UserTableProps {
  users: User[];
  loading: boolean;
  deleteConfirm: string | null;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  deleteConfirm,
  onEditUser,
  onDeleteUser,
}) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'STAFF': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading users...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No users found.
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-4">
        {users.map((user, index) => (
          <div key={`${user.id}-${index}`} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-gray-800">{user.name || 'No Name'}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            </div>
            
            <div className="space-y-1 text-sm text-gray-600 mb-3">
              {user.restaurant && (
                <div><strong>Restaurant:</strong> {user.restaurant.name}</div>
              )}
              <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onEditUser(user)}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onDeleteUser(user.id)}
                className={`flex-1 px-3 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors text-sm flex items-center justify-center gap-2 ${
                  deleteConfirm === user.id
                    ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                    : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
                }`}
              >
                {deleteConfirm === user.id ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={`${user.id}-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.name || 'No Name'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.restaurant?.name || 'No Restaurant'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteUser(user.id)}
                      className={`flex items-center gap-1 ${
                        deleteConfirm === user.id
                          ? 'text-red-800 hover:text-red-900'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                    >
                      {deleteConfirm === user.id ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};