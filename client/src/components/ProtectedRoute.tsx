import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useReduxAuth from '../store/hooks/useReduxAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'owner' | 'customer';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, isLoading, user } = useReduxAuth();
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const location = useLocation();

  // Check if user has the required role if specified
  const hasRequiredRole = !requiredRole || user?.role === requiredRole;

  // Add a small delay to prevent flash of login page
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialCheckComplete(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking auth
  if (isLoading || !initialCheckComplete) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has the required role
  if (!hasRequiredRole) {
    // Redirect to dashboard or home if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
