import React from 'react';
import { 
  FaHourglassHalf, 
  FaCheckCircle, 
  FaMoneyBillWave, 
  FaTimesCircle,
  FaQuestionCircle 
} from 'react-icons/fa';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  size?: 'sm' | 'md' | 'lg';
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Payment Pending',
          icon: FaHourglassHalf,
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        };
      case 'paid':
        return {
          label: 'Paid',
          icon: FaCheckCircle,
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
      case 'refunded':
        return {
          label: 'Refunded',
          icon: FaMoneyBillWave,
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        };
      case 'failed':
        return {
          label: 'Payment Failed',
          icon: FaTimesCircle,
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

export default PaymentStatusBadge;
