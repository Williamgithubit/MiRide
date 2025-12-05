import React from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle,
  User as UserIcon,
  FileText,
  CreditCard,
  Clock,
  Activity
} from 'lucide-react';
import type { User } from '../../../../store/User/userManagementApi';

interface UserDetailsModalProps {
  user: User;
  onClose: () => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ user, onClose }) => {
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'owner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'customer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl max-w-4xl w-full shadow-2xl border border-gray-200/20 dark:border-gray-700/20 my-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Profile Picture */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
              )}
              {user.isActive ? (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-red-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
              <p className="text-green-100 text-sm mb-2">{user.email}</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                  {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Personal Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email Address</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user.address}</p>
                    </div>
                  </div>
                )}

                {user.dateOfBirth && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Date of Birth</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Account Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-mono">{user.id}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Member Since</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Login</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user.lastLogin)}</p>
                    </div>
                  </div>
                )}

                {user.updatedAt && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(user.updatedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents & Verification (for customers) */}
            {user.role === 'customer' && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Documents & Verification
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Driver's License */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Driver's License</p>
                      {user.driverLicense ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    {user.driverLicense ? (
                      <a
                        href={user.driverLicense}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View Document
                      </a>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Not uploaded</p>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Payment Method
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.stripeCustomerId ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Information */}
            {user.role === 'owner' && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Owner Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Stripe Connect */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Stripe Connect</p>
                      {user.stripeAccountId ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.stripeAccountId ? 'Connected' : 'Not connected'}
                    </p>
                  </div>

                  {/* Business Info */}
                  {user.businessName && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Business Name</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.businessName}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Terms Acceptance */}
            {(user.termsAccepted !== undefined || user.termsAcceptedAt) && (
              <div className="md:col-span-2">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Terms & Conditions</p>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {user.termsAccepted ? (
                      <>
                        Accepted on {user.termsAcceptedAt ? formatDate(user.termsAcceptedAt) : 'N/A'}
                      </>
                    ) : (
                      'Not accepted yet'
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200/30 dark:border-gray-700/30 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
