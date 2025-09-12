import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } from '../Auth/authApi';
import { loginStart, loginSuccess, loginFailure, logout } from '../Auth/authSlice';
import { showErrorToast, showSuccessToast } from '../utils/apiUtils';
import { User, CustomerUser, OwnerUser, RegisterData as ImportedRegisterData } from '../User/userTypes';

// Type for any user type (base User, CustomerUser, or OwnerUser)
type AnyUser = User | CustomerUser | OwnerUser;

// Define the API user response type
interface ApiUser {
  id: string | number; // Accept both string and number to handle different API responses
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  _modelType?: string; // Added to track which model the user came from
}

// Define the API response type
interface AuthResponse {
  user: ApiUser;
  token: string;
}

// Mapper function to transform API user to Redux User
const mapApiUserToUser = (apiUser: ApiUser): AnyUser => {
  console.log('Mapping API user to Redux user:', apiUser);
  
  // Handle different name formats from API
  let name = apiUser.name;
  
  // If name is not provided but firstName/lastName are available, combine them
  if (!name && (apiUser.firstName || apiUser.lastName)) {
    name = `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim();
  }
  
  // If still no name, fall back to email username or default
  if (!name) {
    name = apiUser.email ? apiUser.email.split('@')[0] : 'User';
  }
  
  // Debug the name value
  console.log('Name value after processing:', name);
  
  // Ensure ID is treated as a string, handling both string and number types
  const userId = typeof apiUser.id === 'number' ? String(apiUser.id) : (apiUser.id || '');
  
  // Ensure role is properly typed
  const role = (apiUser.role as 'customer' | 'owner' | 'admin') || 'customer';
  
  // Create base user object with required properties
  const baseUser = {
    id: userId,
    email: apiUser.email,
    name: name || 'Unknown',
    phone: apiUser.phone || '',
    role: role,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Handle customer-specific properties
  if (role === 'customer') {
    const customerUser: CustomerUser = {
      ...baseUser,
      driverLicense: '',
      address: '',
      preferredPaymentMethod: '',
    };
    console.log('Mapped to CustomerUser:', customerUser);
    return customerUser;
  }
  
  // Handle owner-specific properties
  if (role === 'owner') {
    const ownerUser: OwnerUser = {
      ...baseUser,
      businessName: '',
      businessAddress: '',
      taxId: '',
      businessPhone: '',
      businessEmail: '',
    };
    console.log('Mapped to OwnerUser:', ownerUser);
    return ownerUser;
  }
  
  // Default to base User type for admin or any other role
  console.log('Mapped to base User:', baseUser);
  return baseUser as User;
};


interface LoginCredentials {
  email: string;
  password: string;
}

export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  
  // RTK Query hooks
  const [loginMutation, loginResult] = useLoginMutation();
  const [registerMutation, registerResult] = useRegisterMutation();
  const { data: currentUser, refetch } = useGetCurrentUserQuery(undefined, {
    skip: !auth.token,
  });

  // Initialize authentication state when component mounts
  useEffect(() => {
    let isMounted = true;
    
    const initializeAuth = async () => {
      // Get token from localStorage if not in Redux state
      const token = auth.token || localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('useReduxAuth - initializeAuth:', {
        hasToken: !!token,
        hasStoredUser: !!storedUser,
        authUser: auth.user,
        isAuthenticated: auth.isAuthenticated
      });
      
      // If no token, ensure we're logged out
      if (!token) {
        console.log('useReduxAuth - No token found, logging out');
        if (auth.isAuthenticated) {
          dispatch(logout());
        }
        return;
      }
      
      // If we already have user data, no need to refetch
      if (auth.user) {
        console.log('useReduxAuth - User data already exists, skipping fetch');
        return;
      }
      
      // Try to restore user from localStorage first
      if (storedUser && !auth.user) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('useReduxAuth - Restoring user from localStorage:', parsedUser);
          dispatch(loginSuccess({ user: parsedUser, token }));
          return;
        } catch (error) {
          console.error('useReduxAuth - Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
      
      try {
        console.log('Fetching fresh user data...');
        const response = await refetch().unwrap();
        
        if (!isMounted) return;
        
        if (response) {
          console.log('Fresh user data received:', response);
          const userData = 'user' in response ? response.user : response;
          const transformedUser = mapApiUserToUser(userData);
          
          // Save to localStorage for persistence
          localStorage.setItem('user', JSON.stringify(transformedUser));
          localStorage.setItem('token', token);
          
          // Update Redux state
          dispatch(loginSuccess({ 
            user: transformedUser, 
            token: token 
          }));
        }
      } catch (error: any) {
        console.error('Failed to fetch user with stored token:', error);
        
        if (!isMounted) return;
        
        // Clear invalid auth data if token is invalid or user not found
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          console.log('Token is invalid or expired, logging out...');
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          dispatch(logout());
        }
      }
    };
    
    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, [auth.token, auth.user, auth.isAuthenticated, dispatch, refetch]);

  // Update Redux state when currentUser data is received
  useEffect(() => {
    if (currentUser) {
      console.log('Current user data received:', currentUser);
      // Get token from auth state or localStorage
      const token = auth.token || localStorage.getItem('token');
      
      if (token) {
        try {
          // Extract user data from response - handle different response formats
          let userData: ApiUser;
          
          if ('user' in currentUser) {
            // Response has a user property (AuthResponse format)
            userData = currentUser.user;
            
            // Transform API user to Redux User format first
            const transformedUser = mapApiUserToUser(userData);
            
            // Only update if the user data is different
            if (JSON.stringify(transformedUser) !== JSON.stringify(auth.user)) {
              console.log('Updating user data in Redux store');
              dispatch(loginSuccess({ user: transformedUser, token }));
              return; // Exit early since we've handled the update
            }
          } else if ('id' in currentUser && 'email' in currentUser) {
            // Response is already a user object
            userData = currentUser as unknown as ApiUser;
          } else {
            console.error('Unexpected user data format:', currentUser);
            return;
          }
          
          // This block is already handled above
          // Only reach here if we didn't return early from the first condition
        } catch (error) {
          console.error('Error processing user data:', error);
        }
      } else {
        console.warn('Received user data but no token available');
      }
    }
  }, [currentUser, auth.token, dispatch]);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Login attempt with email:', credentials.email);
      dispatch(loginStart());
      
      const result = await loginMutation(credentials).unwrap();
      console.log('Login response received:', result);
      
      if (result?.token && result?.user) {
        console.log('Login successful, processing user data:', result.user);
        
        // Log the user ID and its type for debugging
        console.log('User ID from login:', result.user.id, 'Type:', typeof result.user.id);
        
        // Transform API user to Redux User format
        const transformedUser = mapApiUserToUser(result.user);
        console.log('Transformed user for Redux:', transformedUser);
        
        // Store token in localStorage for persistence
        localStorage.setItem('token', result.token);
        console.log('Token stored in localStorage');
        
        // Update Redux state with user data and token
        dispatch(loginSuccess({ user: transformedUser, token: result.token }));
        console.log('Redux state updated with user data and token');
      } else {
        console.error('Invalid login response:', result);
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      dispatch(loginFailure(error.message || 'Login failed'));
      throw error;
    }
  };

  const register = async (data: ImportedRegisterData) => {
    try {
      // Validate name field before proceeding
      if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        const error = new Error('Name is required for registration');
        dispatch(loginFailure(error.message));
        throw error;
      }
      
      dispatch(loginStart());
      console.log('Registering user with data (raw):', JSON.stringify(data));
      
      // Make sure we're sending the correct data format to the backend
      // Create a clean object with only the fields the backend expects
      const registerData: ImportedRegisterData = {
        name: data.name.trim(), // Ensure name is properly trimmed
        email: data.email.trim(),
        password: data.password,
        phone: data.phone?.trim() || '',
        role: (data.role as 'customer' | 'owner' | 'admin') || 'customer'
      };
      
      console.log('Sending registration data to backend:', JSON.stringify(registerData));
      
      // Call the register mutation with clean data
      const result = await registerMutation(registerData).unwrap();
      console.log('Registration successful, received:', result);
      
      // Transform API response to match Redux state structure
      const transformedData = {
        user: mapApiUserToUser(result.user),
        token: result.token
      };
      
      dispatch(loginSuccess(transformedData));
      showSuccessToast('Registration successful');
      return result;
    } catch (error: any) {
      console.error('Registration error:', error);
      dispatch(loginFailure(error instanceof Error ? error.message : 'Registration failed'));
      if (registerResult.error) {
        showErrorToast(registerResult.error);
      }
      throw error;
    }
  };

  const logoutUser = () => {
    dispatch(logout());
    showSuccessToast('Logged out successfully');
  };

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading || loginResult.isLoading || registerResult.isLoading,
    error: auth.error,
    login,
    register,
    logout: logoutUser,
  };
};

export default useReduxAuth;
