import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Building,
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'STAFF' | 'ADMIN';
  restaurantId: string | null;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface ProfileDisplayProps {
  profile: UserProfile;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'STAFF': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Full Name
            </label>
            <p className="text-gray-900 text-lg">{profile.name || 'No name set'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <p className="text-gray-900">{profile.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Shield className="w-4 h-4 inline mr-1" />
              Role
            </label>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(profile.role)}`}>
              {profile.role}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building className="w-4 h-4 inline mr-1" />
              Restaurant
            </label>
            {profile.restaurant ? (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-semibold text-gray-900">{profile.restaurant.name}</p>
                <p className="text-sm text-gray-600">{profile.restaurant.address}</p>
                <p className="text-sm text-gray-600">{profile.restaurant.phone}</p>
                {profile.restaurant.email && (
                  <p className="text-sm text-gray-600">{profile.restaurant.email}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No restaurant assigned</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Member Since
            </label>
            <p className="text-gray-900">
              {new Date(profile.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};