import React from 'react';
import { 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaPlayCircle, 
  FaStopCircle, 
  FaBan,
  FaQuestionCircle 
} from 'react-icons/fa';

interface BookingStatusBadgeProps {
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return {
          label: 'Pending Approval',
          icon: FaClock,
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        };
      case 'approved':
        return {
          label: 'Approved',
          icon: FaCheckCircle,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          icon: FaTimesCircle,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
      case 'active':
        return {
          label: 'Active',
          icon: FaPlayCircle,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'completed':
        return {
          label: 'Completed',
          icon: FaStopCircle,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          icon: FaBan,
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        };
      default:
        return {
          label: 'Unknown',
          icon: FaQuestionCircle,
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2 text-sm';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full ${config.className} ${sizeClasses}`}>
      <config.icon className="text-xs" />
      {config.label}
    </span>
  );
};

export default BookingStatusBadge;
