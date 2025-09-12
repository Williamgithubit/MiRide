import React from 'react';
import { Navigate } from 'react-router-dom';
import useReduxAuth from '../../store/hooks/useReduxAuth';
import OwnerDashboard from './owner/OwnerDashboard';
import AdminDashboard from './admin/AdminDashboard';
import CustomerDashboard from './customer/CustomerDashboard';

const DashboardRouter: React.FC = () => {
  const { user, isAuthenticated } = useReduxAuth();

  console.log('DashboardRouter rendering:', {
    isAuthenticated,
    user,
    userRole: user?.role,
    timestamp: new Date().toISOString()
  });

  if (!isAuthenticated || !user) {
    console.log('DashboardRouter: Not authenticated or no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('DashboardRouter: User authenticated, role:', user.role);

  switch (user.role) {
    case 'owner':
      console.log('DashboardRouter: Rendering OwnerDashboard');
      return <OwnerDashboard />;
    case 'admin':
      console.log('DashboardRouter: Rendering AdminDashboard');
      return <AdminDashboard />;
    case 'customer':
      console.log('DashboardRouter: Rendering CustomerDashboard');
      return <CustomerDashboard />;
    default:
      console.log('DashboardRouter: Unknown role, redirecting to login. Role:', user.role);
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter;
