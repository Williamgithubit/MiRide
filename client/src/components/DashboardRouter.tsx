import React from 'react';
import { Navigate } from 'react-router-dom';
import useReduxAuth from '../store/hooks/useReduxAuth';
import CustomerDashboard from './dashboards/CustomerDashboard';
import OwnerDashboard from './dashboards/OwnerDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

interface DashboardRouterProps {
  role?: 'customer' | 'owner' | 'admin';
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ role }) => {
  // Use Redux auth hook instead of context
  const { user, isLoading } = useReduxAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  // If no specific role is requested, show the dashboard based on user's role
  if (!role) {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    switch (user.role) {
      case 'customer':
        return <Navigate to="/dashboard/customer" replace />;
      case 'owner':
        return <Navigate to="/dashboard/owner" replace />;
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  // If a specific role is requested, check if user has that role
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has the required role
  if (user.role !== role) {
    // Redirect to the dashboard matching their actual role
    switch (user.role) {
      case 'customer':
        return <Navigate to="/dashboard/customer" replace />;
      case 'owner':
        return <Navigate to="/dashboard/owner" replace />;
      case 'admin':
        return <Navigate to="/dashboard/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }
  
  // Show the appropriate dashboard based on the requested role
  switch (role) {
    case 'customer':
      return <CustomerDashboard />;
    case 'owner':
      return <OwnerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default DashboardRouter;
