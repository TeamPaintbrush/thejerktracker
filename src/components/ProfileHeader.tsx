import React from 'react';
import { User, Edit3 } from 'lucide-react';

interface ProfileHeaderProps {
  isEditing: boolean;
  onEditClick: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isEditing,
  onEditClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
      <div className="flex items-center gap-2 mb-4 sm:mb-0">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">My Profile</h2>
      </div>
      {!isEditing && (
        <button
          onClick={onEditClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Edit Profile
        </button>
      )}
    </div>
  );
};