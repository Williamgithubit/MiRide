import React from 'react';
import { Car, Calendar, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, PlayCircle, StopCircle, RefreshCw } from 'lucide-react';
import DashboardCard from '../../shared/DashboardCard';
import Table from '../../shared/Table';
import { useCustomerData } from './useCustomerData';

const CustomerBookings: React.FC = () => {
  const { activeRentals, totalBookings, totalSpent, customerRentals, refetchRentals, rentalsLoading } = useCustomerData();
  
  const handleRefresh = () => {
    if (refetchRentals) {
      refetchRentals();
    }
  };

  const rentalColumns = [
    {
      key: 'id',
      label: 'Booking ID',
      render: (value: number) => `#${value.toString().padStart(4, '0')}`
    },
    {
      key: 'car',
      label: 'Car',
      render: (car: any) => car ? `${car.year || ''} ${car.brand || ''} ${car.model || ''}`.trim() || 'N/A' : 'N/A'
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'endDate',
      label: 'End Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      render: (value: number) => `$${(Number(value) || 0).toFixed(2)}`
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (paymentStatus: string) => {
        const status = paymentStatus || 'pending';
        const getPaymentColor = (status: string) => {
          switch (status) {
            case 'paid':
              return 'bg-green-100 text-green-800';
            case 'pending':
              return 'bg-yellow-100 text-yellow-800';
            case 'failed':
              return 'bg-red-100 text-red-800';
            case 'refunded':
              return 'bg-blue-100 text-blue-800';
            default:
              return 'bg-gray-100 text-gray-800';
          }
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentColor(status)}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Booking Status',
      render: (status: string, rental: any) => {
        const bookingStatus = status || rental?.status || 'pending_approval';
        
        const getStatusConfig = (status: string) => {
          switch (status) {
            case 'pending_approval':
              return {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
                icon: Clock,
                label: 'Pending Approval',
                description: 'Waiting for owner approval'
              };
            case 'approved':
              return {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
                icon: CheckCircle,
                label: 'Approved',
                description: 'Ready for pickup'
              };
            case 'rejected':
              return {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                icon: XCircle,
                label: 'Rejected',
                description: 'Booking declined'
              };
            case 'active':
              return {
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
                icon: PlayCircle,
                label: 'Active',
                description: 'Currently renting'
              };
            case 'completed':
              return {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                icon: StopCircle,
                label: 'Completed',
                description: 'Rental finished'
              };
            case 'cancelled':
              return {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
                icon: XCircle,
                label: 'Cancelled',
                description: 'Booking cancelled'
              };
            default:
              return {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
                icon: AlertCircle,
                label: 'Unknown',
                description: 'Status unknown'
              };
          }
        };

        const config = getStatusConfig(bookingStatus);
        const Icon = config.icon;
        
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${config.color}`}>
              <Icon className="w-3 h-3" />
              {config.label}
            </span>
            {/* Show additional info for pending/rejected status */}
            {(bookingStatus === 'pending_approval' || bookingStatus === 'rejected') && (
              <div className="group relative">
                <AlertCircle className="w-4 h-4 text-gray-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {config.description}
                  {bookingStatus === 'rejected' && rental?.rejectionReason && (
                    <div className="mt-1 text-gray-300">
                      Reason: {rental.rejectionReason}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="Active Rentals"
          value={activeRentals}
          icon={Calendar}
        />
        <DashboardCard
          title="Total Bookings"
          value={customerRentals?.length || 0}
          icon={Car}
        />
        <DashboardCard
          title="Total Spent"
          value={`$${(Number(totalSpent) || 0).toFixed(2)}`}
          icon={CreditCard}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Bookings</h3>
          <button
            onClick={handleRefresh}
            disabled={rentalsLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${rentalsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <Table columns={rentalColumns} data={customerRentals || []} searchable />
      </div>
    </div>
  );
};

export default CustomerBookings;
