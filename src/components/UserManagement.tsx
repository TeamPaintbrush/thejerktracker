import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  CheckCircle,
} from 'lucide-react';
import { RoleGuard } from '@/hooks/useRoleAccess';
import { UserRole } from '@/types/api';
import { useApiCall } from '@/hooks/useErrorHandler';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { UserTableHeader } from '@/components/UserTableHeader';
import { UserFilters } from '@/components/UserFilters';
import { UserTable } from '@/components/UserTable';
import { UserFormModal } from '@/components/UserFormModal';

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

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  restaurantId: string | null;
}

const UserManagement: React.FC = () => {
  const { callApi, error, isLoading, clearError } = useApiCall();
  
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [restaurantFilter, setRestaurantFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER',
    restaurantId: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    const data = await callApi('/api/users', {}, 'Fetching users') as { users?: User[] } | null;
    if (data?.users) {
      setUsers(data.users);
    }
  }, [callApi]);

  const fetchRestaurants = useCallback(async () => {
    const data = await callApi('/api/restaurants', {}, 'Fetching restaurants') as { restaurants?: Restaurant[] } | null;
    if (data?.restaurants) {
      setRestaurants(data.restaurants);
    }
  }, [callApi]);

  // Fetch users and restaurants
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchUsers(), fetchRestaurants()]);
    };
    loadData();
  }, [fetchUsers, fetchRestaurants]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesRestaurant = restaurantFilter === 'ALL' || user.restaurantId === restaurantFilter;
    
    return matchesSearch && matchesRole && matchesRestaurant;
  });

  const handleCreateUser = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER',
      restaurantId: null,
    });
    setEditingUser(null);
    setShowCreateModal(true);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name || '',
      email: user.email,
      password: '', // Don't pre-fill password for security
      role: user.role,
      restaurantId: user.restaurantId,
    });
    setEditingUser(user);
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const payload = editingUser 
        ? { ...formData, password: formData.password || undefined } // Only include password if provided
        : formData;

      const data = await callApi(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }, editingUser ? 'Updating user' : 'Creating user');

      if (data) {
        setSuccess(editingUser ? 'User updated successfully' : 'User created successfully');
        setShowCreateModal(false);
        setEditingUser(null);
        await fetchUsers(); // Refresh the list
      }
    } catch {
      // Error is handled by useApiCall hook
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      return;
    }

    try {
      const data = await callApi(`/api/users/${userId}`, {
        method: 'DELETE',
      }, 'Deleting user');

      if (data) {
        setSuccess('User deleted successfully');
        setDeleteConfirm(null);
        await fetchUsers();
      }
    } catch {
      // Error is handled by useApiCall hook
    }
  };

  return (
    <RoleGuard roles={UserRole.ADMIN}>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-6 h-6 text-blue-600" />
        </div>

        <UserTableHeader onCreateUser={handleCreateUser} />

        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          restaurantFilter={restaurantFilter}
          setRestaurantFilter={setRestaurantFilter}
          restaurants={restaurants}
          onClearFilters={() => {
            setSearchTerm('');
            setRoleFilter('ALL');
            setRestaurantFilter('ALL');
          }}
          totalUsers={users.length}
          filteredUsersCount={filteredUsers.length}
        />

        {/* Error/Success Messages */}
        <ErrorDisplay 
          error={error} 
          onDismiss={clearError}
          onRetry={() => fetchUsers()}
          showRetry={true}
          className="mb-4"
        />
        
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <UserTable
          users={filteredUsers}
          loading={isLoading}
          deleteConfirm={deleteConfirm}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />

        <UserFormModal
          showCreateModal={showCreateModal}
          editingUser={editingUser}
          formData={formData}
          setFormData={setFormData}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          loading={isLoading}
          restaurants={restaurants}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowCreateModal(false);
            setEditingUser(null);
          }}
        />
      </div>
    </RoleGuard>
  );
};

export default UserManagement;