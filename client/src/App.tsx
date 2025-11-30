import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
// Use the custom auth hook instead of direct Redux access
import useReduxAuth from './store/hooks/useReduxAuth';
import Header from './components/Header';
import { DarkModeProvider } from './contexts/DarkModeContext';
import ScrollToTop from './components/common/ScrollToTop';
import SplashScreen from './components/SplashScreen';
import ModernLoader from './components/common/ModernLoader';

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
const SearchResults = lazy(() => import('./pages/SearchResults'));

// Lazy load dashboard components
const NewDashboardRouter = lazy(() => import('./components/dashboards/DashboardRouter'));

// Modern Loading component
const LoadingFallback = () => {
  console.log('LoadingFallback component rendering - Suspense is active');
  return <ModernLoader message="Loading component" />;
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
        <Route path="/search-results" element={<SearchResults />} />
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
  const [showSplash, setShowSplash] = useState(true);
  
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
  
  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  // Show loading state only for protected routes or initial auth check
  const currentPath = location.pathname;
  const isProtectedRoute = currentPath.startsWith('/dashboard');
  
  // Only show loading for protected routes or during initial auth check with token
  if (isLoading && isProtectedRoute) {
    return <ModernLoader message="Loading application" />;
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
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen 
          onLoadingComplete={handleSplashComplete}
          minDisplayTime={2500}
        />
      )}
      
      {/* Main App Content */}
      <div className="app-container" style={{ padding: '0', width: '100%' }}>
        {!isAuthPage && !isDashboardPage && <Header />}
        <AppContent />
        <ScrollToTop />
      </div>
    </DarkModeProvider>
  );
};

export default App;
