import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
// Use the custom auth hook instead of direct Redux access
import useReduxAuth from './store/hooks/useReduxAuth';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ScrollToTop from './components/common/ScrollToTop';

// Import Home directly (not lazy) to test
import Home from './pages/Home';

// Lazy load other components
const Login = lazy(() => import('./components/Login'));
const Signup = lazy(() => import('./components/Signup'));
const Dashboard = lazy(() => import('./components/Dashboard'));
// Old DashboardRouter import removed - using NewDashboardRouter instead
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const RoleProtectedRoute = lazy(() => import('./components/RoleProtectedRoute'));
const BrowseCars = lazy(() => import('./components/BrowseCars'));
const CarDetails = lazy(() => import('./components/CarDetails'));
const BookingFlow = lazy(() => import('./components/BookingFlow'));
const RoleTest = lazy(() => import('./components/RoleTest'));
const BookingSuccess = lazy(() => import('./components/pages/BookingSuccess'));
const BookingCancelled = lazy(() => import('./components/pages/BookingCancelled'));

// Lazy load dashboard components
const NewDashboardRouter = lazy(() => import('./components/dashboards/DashboardRouter'));

// Loading component
const LoadingFallback = () => {
  console.log('LoadingFallback component rendering - Suspense is active');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-gray-600">Loading component...</p>
    </div>
  );
};

const AppContent: React.FC = () => {
  // Use the custom auth hook instead of direct Redux access
  const { isAuthenticated } = useReduxAuth();
  const location = useLocation();
  console.log('AppContent rendering', { 
    isAuthenticated, 
    currentPath: location.pathname,
    timestamp: new Date().toISOString()
  });

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* New comprehensive dashboard with role-based routing */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <NewDashboardRouter />
            </ProtectedRoute>
          }
        />
        
        <Route path="/" element={<Home />} />
        <Route path="/browse-cars" element={<BrowseCars />} />
        <Route path="/cars" element={<BrowseCars />} />
        <Route path="/car-details/:carId" element={<CarDetails />} />
        <Route path="/booking/:carId" element={<BookingFlow />} />
        <Route path="/booking-success" element={<BookingSuccess />} />
        <Route path="/booking-cancelled" element={<BookingCancelled />} />
        <Route path="/role-test" element={<ProtectedRoute><RoleTest /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useReduxAuth();
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  // Initialize app
  useEffect(() => {
    console.log('App - Auth state changed:', { 
      isAuthenticated, 
      hasUser: !!user, 
      userRole: user?.role,
      userName: user?.name,
      isLoading,
      currentPath: location.pathname 
    });
    
    // Mark as initialized when auth check is complete
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isAuthenticated, user, isLoading, location.pathname]);
  
  // Show loading state only for protected routes or initial auth check
  const currentPath = location.pathname;
  const isProtectedRoute = currentPath.startsWith('/dashboard');
  
  // Only show loading for protected routes or during initial auth check with token
  if (isLoading && isProtectedRoute) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading application...</p>
      </div>
    );
  }
  
  const currentLocation = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentLocation.pathname);
  const isDashboardPage = currentLocation.pathname.startsWith('/dashboard');
  
  console.log('Rendering App component', { 
    isAuthenticated, 
    user, 
    currentPath,
    isAuthPage,
    isDashboardPage,
    isLoading,
    isProtectedRoute 
  });
  
  return (
    <DarkModeProvider>
      <div className="app-container" style={{ padding: '0', width: '100%' }}>
        {!isAuthPage && !isDashboardPage && <Header />}
        <AppContent />
        <Toaster position="top-center" />
        <ScrollToTop />
      </div>
    </DarkModeProvider>
  );
};

export default App;
