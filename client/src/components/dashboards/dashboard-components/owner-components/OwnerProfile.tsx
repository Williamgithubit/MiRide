import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store/store';
import {
  fetchOwnerProfile,
  updateOwnerProfile,
  uploadOwnerAvatar,
  clearError,
} from '../../../../store/Owner/ownerProfileSlice';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaMapMarkerAlt, FaCar, FaClock, FaCamera, FaSave, FaEdit, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import useReduxAuth from '../../../../store/hooks/useReduxAuth';
import { loginSuccess } from '../../../../store/Auth/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const OwnerProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useReduxAuth();
  const { owner, loading, updating, error } = useSelector(
    (state: RootState) => state.ownerProfile
  );

  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });

  // Fetch owner profile on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOwnerProfile(user.id));
    }
  }, [dispatch, user?.id]);

  // Update form data when owner profile is loaded
  useEffect(() => {
    if (owner) {
      setFormData({
        name: owner.name || '',
        phone: owner.phone || '',
        address: owner.address || '',
        dateOfBirth: owner.dateOfBirth || '',
      });
    }
  }, [owner]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload avatar immediately
      if (user?.id) {
        try {
          const result = await dispatch(
            uploadOwnerAvatar({ ownerId: user.id, file })
          ).unwrap();
          
          // Update Redux auth state with new avatar
          const token = localStorage.getItem('token');
          if (token && result) {
            dispatch(loginSuccess({ 
              user: { ...user, avatar: result.avatar }, 
              token 
            }));
          }
          
          toast.success('Profile picture updated successfully!');
          dispatch(fetchOwnerProfile(user.id));
        } catch (error: any) {
          console.error('Error uploading avatar:', error);
          toast.error(error || 'Failed to upload profile picture');
          setAvatarPreview(null);
          setAvatarFile(null);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      // Update profile data
      const result = await dispatch(
        updateOwnerProfile({ ownerId: user.id, data: formData })
      ).unwrap();

      // Update Redux auth state with new profile data
      const token = localStorage.getItem('token');
      if (token && result) {
        dispatch(loginSuccess({ 
          user: { 
            ...user, 
            name: result.name,
            phone: result.phone,
            address: result.address,
          }, 
          token 
        }));
      }

      toast.success('Profile updated successfully!');
      setIsEditing(false);

      // Refetch profile to ensure data is in sync
      dispatch(fetchOwnerProfile(user.id));
    } catch (error: any) {
      toast.error(error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (owner) {
      setFormData({
        name: owner.name || '',
        phone: owner.phone || '',
        address: owner.address || '',
        dateOfBirth: owner.dateOfBirth || '',
      });
    }
    setIsEditing(false);
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (owner?.avatar) {
      // Handle both full URLs and relative paths
      if (owner.avatar.startsWith('http')) {
        return owner.avatar;
      }
      return `${API_URL}${owner.avatar.startsWith('/') ? '' : '/'}${owner.avatar}`;
    }
    return null;
  };

  if (loading && !owner) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 relative">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
                {avatarPreview || owner?.avatar ? (
                  <img
                    src={avatarPreview || (owner?.avatar?.startsWith('http') ? owner.avatar : `${API_URL}${owner?.avatar}`)}
                    alt={owner?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                    <FaUser className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group-hover:scale-110 transform duration-200">
                <FaCamera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">{owner?.name || 'Owner Name'}</h2>
              <p className="text-blue-100 mb-4 flex items-center justify-center md:justify-start gap-2">
                <FaEnvelope className="w-4 h-4" />
                {owner?.email || 'owner@example.com'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  Car Owner
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                  Member since {owner?.createdAt ? new Date(owner.createdAt).getFullYear() : '2025'}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 md:relative md:top-0 md:right-0 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 font-medium"
            >
              <FaEdit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <FaUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Personal Information
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your personal details and business information
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FaUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FaEnvelope className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={owner?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-900 dark:text-white"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Phone and Date of Birth Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FaPhone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FaCalendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <FaMapMarkerAlt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Address
              </label>
              <textarea
                rows={3}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all resize-none text-gray-900 dark:text-white"
                placeholder="Enter your complete address"
              />
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FaCar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Registered Cars
                </label>
                <input
                  type="text"
                  value={owner?.carsCount || 0}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-900 dark:text-white font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FaClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Active Bookings
                </label>
                <input
                  type="text"
                  value={owner?.activeBookingsCount || 0}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-900 dark:text-white font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <FaSpinner className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OwnerProfile;
