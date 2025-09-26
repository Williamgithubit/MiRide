import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../shared/Sidebar';
import TopNavbar from '../shared/TopNavbar';
import CustomerOverview from '../dashboard-components/customer-components/CustomerOverview';
import BrowseCars from '../dashboard-components/customer-components/BrowseCars';
import CustomerBookings from '../dashboard-components/customer-components/CustomerBookings';
import CustomerPayments from '../dashboard-components/customer-components/CustomerPayments';
import CustomerProfile from '../dashboard-components/customer-components/CustomerProfile';
import BookingStatus from '../dashboard-components/customer-components/BookingStatus';
import MyReviews from '../dashboard-components/customer-components/MyReviews';
import Notifications from '../dashboard-components/customer-components/Notifications';
import AuthErrorMessage from '../dashboard-components/customer-components/AuthErrorMessage';
import { useCustomerData } from '../dashboard-components/customer-components/useCustomerData';
import useReduxAuth from '../../../store/hooks/useReduxAuth';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [selectedCar, setSelectedCar] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { logout } = useReduxAuth();
  const { 
    isLoading, 
    statsError, 
    customerError, 
    hasValidUserId, 
    isAuthenticated 
  } = useCustomerData();

  // Handle authentication errors
  const handleLogin = () => {
    navigate('/login');
  };

  const handleRetry = () => {
    // Clear any cached data and reload
    logout();
    navigate('/login');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar role="customer" activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 flex flex-col md:ml-64">
          <TopNavbar title="Customer Dashboard" />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Authentication/Error state - show error message if there are auth issues
  if (!hasValidUserId || !isAuthenticated || customerError || statsError) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar role="customer" activeSection={activeSection} onSectionChange={setActiveSection} />
        <div className="flex-1 flex flex-col md:ml-64">
          <TopNavbar title="Customer Dashboard" />
          <main className="flex-1 overflow-y-auto p-6">
            <AuthErrorMessage
              hasValidUserId={hasValidUserId}
              isAuthenticated={isAuthenticated}
              customerError={customerError || statsError}
              onRetry={handleRetry}
              onLogin={handleLogin}
            />
          </main>
        </div>
      </div>
    );
  }


  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <CustomerOverview onSectionChange={setActiveSection} />;

      case 'browse-cars':
        return (
          <BrowseCars
            selectedCar={selectedCar}
            setSelectedCar={setSelectedCar}
            showBookingModal={showBookingModal}
            setShowBookingModal={setShowBookingModal}
          />
        );

      case 'bookings':
        return <CustomerBookings />;

      case 'booking-status':
        return <BookingStatus />;

      case 'payments':
        return <CustomerPayments />;

      case 'reviews':
        return <MyReviews />;

      case 'notifications':
        return <Notifications />;

      case 'profile':
        return <CustomerProfile />;

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Select a section from the sidebar.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar role="customer" activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <div className="flex-1 flex flex-col md:ml-64">
        <TopNavbar title="Customer Dashboard" />
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>

    </div>
  );
};

export default CustomerDashboard;
