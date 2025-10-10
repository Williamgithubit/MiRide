import { useGetCustomerStatsQuery } from '../../../../store/Dashboard/dashboardApi';
import { useGetCarsQuery } from '../../../../store/Car/carApi';
import { useGetCustomerRentalsQuery, useGetActiveRentalsQuery } from '../../../../store/Rental/rentalApi';
import { useGetCustomerByIdQuery } from '../../../../store/Customer/customerApi';
import useReduxAuth from '../../../../store/hooks/useReduxAuth';

export const useCustomerData = () => {
  const { user, isAuthenticated, token } = useReduxAuth();
  const customerId = user?.id;
  
  // Debug logging only in development
  if (process.env.NODE_ENV === 'development' && !customerId) {
    console.warn('useCustomerData - No customer ID available:', {
      isAuthenticated,
      hasToken: !!token
    });
  }
  
  // Validate user ID - must be a valid UUID format
  const isValidUUID = (id: string | undefined): boolean => {
    if (!id || typeof id !== 'string') return false;
    
    // Check for invalid values
    if (id === '0' || id === '' || id === 'undefined' || id === 'null') return false;
    
    // Basic UUID format check (36 characters with hyphens)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id) || id.length > 10; // Allow non-standard UUIDs but ensure reasonable length
  };

  const hasValidUserId = isValidUUID(customerId);
  
  // Add extra safety checks to prevent invalid API calls
  const shouldSkipCustomerQuery = !hasValidUserId || !isAuthenticated || !customerId || customerId === '0';
  
  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('useCustomerData - Debug Info:', {
      customerId,
      hasValidUserId,
      isAuthenticated,
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      shouldSkipCustomerQuery,
      skipReasons: {
        invalidUserId: !hasValidUserId,
        notAuthenticated: !isAuthenticated,
        noCustomerId: !customerId,
        customerIdIsZero: customerId === '0'
      }
    });
  }

  // Fetch real-time data from API
  const { data: customerStats, isLoading: statsLoading, error: statsError } = useGetCustomerStatsQuery();
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery();
  const { data: customerRentals, isLoading: rentalsLoading } = useGetCustomerRentalsQuery();
  const { data: activeRentalsData, isLoading: activeRentalsLoading } = useGetActiveRentalsQuery();
  
  // Only make the API call if we have a valid UUID and user is authenticated
  // Use a stable value to prevent RTK Query hook errors
  const queryArg = hasValidUserId && customerId ? customerId : '';
  const { data: customer, isLoading: customerLoading, error: customerError } = useGetCustomerByIdQuery(
    queryArg,
    {
      skip: !hasValidUserId || !customerId
    }
  );

  // Extract data from API responses
  const availableCars = carsData?.filter(car => car.isAvailable) || [];
  const activeRentals = Number(customerStats?.activeRentals) || 0;
  const totalSpent = Number(customerStats?.totalSpent) || 0;
  const totalBookings = Number(customerStats?.totalBookings) || 0;
  const recentBookings = customerStats?.recentBookings || [];

  // Debug logging for car data (can be removed in production)
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('useCustomerData - Car Debug Info:', {
  //     totalCarsFromAPI: carsData?.length || 0,
  //     availableCarsCount: availableCars.length,
  //     carsData: carsData?.slice(0, 2),
  //     availableCars: availableCars.slice(0, 2)
  //   });
  // }

  // Loading state
  const isLoading = statsLoading || carsLoading || rentalsLoading || activeRentalsLoading || customerLoading;

  return {
    // Data
    customerStats,
    availableCars,
    carsData: carsData || [], // All cars (available and unavailable)
    customerRentals: customerRentals || [],
    activeRentalsData: activeRentalsData || [],
    customer: customer || user, // Fallback to user from auth if customer data not available
    activeRentals,
    totalSpent,
    totalBookings,
    recentBookings,
    customerId,
    
    // Validation states
    hasValidUserId,
    isAuthenticated,
    
    // Loading states
    isLoading,
    statsLoading,
    carsLoading,
    rentalsLoading,
    activeRentalsLoading,
    customerLoading,
    
    // Error states
    statsError,
    customerError
  };
};
