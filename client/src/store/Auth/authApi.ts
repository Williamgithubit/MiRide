import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
// Avoid circular dependency by using type only import
import type { RootState } from '../store';
import { AuthResponse, LoginData, RegisterData, User, CustomerUser, OwnerUser } from '../User/userTypes';
import { setAuthToken } from './authUtils';

// Re-export types for convenience
export type { User, CustomerUser, OwnerUser, AuthResponse, LoginData, RegisterData };

// Create a custom base query with token handling
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Get the token from the state or localStorage as fallback
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    
    // If we have a token, add it to the headers and axios instance
    if (token) {
      console.log('Adding token to request headers:', token.substring(0, 10) + '...');
      headers.set('authorization', `Bearer ${token}`);
      setAuthToken(token); // Ensure axios instance has the token
    } else {
      console.log('No token available for request');
      setAuthToken(null); // Clear token from axios instance
    }
    
    return headers;
  },
});

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // If we get a 401, clear the token
    if (result.error && result.error.status === 401) {
      console.log('Authentication error, clearing token');
      localStorage.removeItem('token');
      setAuthToken(null);
    }
    
    return result;
  },
  // Define endpoints for authentication
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginData>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      // Add transformResponse to handle login response
      transformResponse: (response: AuthResponse, meta) => {
        console.log('Login response received:', response);
        // Store token in localStorage immediately
        if (response?.token) {
          localStorage.setItem('token', response.token);
          setAuthToken(response.token);
          console.log('Token saved to localStorage');
        }
        return response;
      },
      // Add error handling
      transformErrorResponse: (response: { status: number; data?: any }) => {
        console.error('Login error:', response);
        // Return a consistent error structure
        const error = {
          status: response.status,
          data: response.data || { message: 'An error occurred during login' },
        };
        return error;
      },
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (userData) => {
        // Handle different name formats (name or firstName/lastName)
        let fullName = userData.name || '';
        
        // If name is not provided but firstName is, use firstName + lastName
        if ((!fullName || fullName.trim() === '') && 'firstName' in userData) {
          const { firstName = '', lastName = '' } = userData as { firstName?: string; lastName?: string };
          fullName = `${firstName} ${lastName}`.trim();
          console.log('Created fullName from firstName/lastName:', fullName);
        }
        
        // Enhanced validation for name field
        if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
          throw new Error('Name is required for registration');
        }
        
        // Validate required fields
        if (!userData.email?.trim()) {
          throw new Error('Email is required');
        }
        
        if (!userData.password) {
          throw new Error('Password is required');
        }
        
        // Create a request body with all fields the backend expects
        const requestBody: Record<string, any> = {
          name: fullName.trim(),
          email: userData.email.trim(),
          password: userData.password,
          phone: userData.phone?.trim() || '',
          role: userData.role || 'customer'
        };
        
        // Add profile-specific fields based on role
        if (userData.role === 'customer' && 'driverLicense' in userData) {
          requestBody.driverLicense = (userData as any).driverLicense;
          if (userData.address) requestBody.address = userData.address;
        } else if (userData.role === 'owner') {
          // Add owner-specific fields
          if (userData.businessName) requestBody.businessName = userData.businessName;
          if (userData.businessAddress) requestBody.businessAddress = userData.businessAddress;
          if (userData.taxId) requestBody.taxId = userData.taxId;
          if (userData.businessPhone) requestBody.businessPhone = userData.businessPhone;
          if (userData.businessEmail) requestBody.businessEmail = userData.businessEmail;
        }
        
        console.log('Sending registration request with body:', JSON.stringify(requestBody));
        
        return {
          url: '/auth/register',
          method: 'POST',
          body: requestBody,
        };
      },
      // Add transformResponse to handle register response
      transformResponse: (response: any) => {
        console.log('Register response received:', response);
        // Store token in localStorage immediately
        if (response.token) {
          localStorage.setItem('token', response.token);
          console.log('Token saved to localStorage');
        }
        return response;
      },
      // Add error handling
      transformErrorResponse: (response: { status: number; data?: any }) => {
        console.error('Register error:', response);
        const error = {
          status: response.status,
          data: response.data || { message: 'An error occurred during registration' },
        };
        if (response.data) {
          console.error('Error details:', response.data);
        }
        return error;
      },
    }),
    //Get current user
    getCurrentUser: builder.query<AuthResponse, void>({
      query: () => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Getting current user with token:', token ? 'Token exists' : 'No token');
        
        // Always return a valid request configuration
        return {
          url: '/auth/me',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token || ''}` // Empty string if no token
          },
          validateStatus: (response: Response, result: any) => {
            // Return false for 401 Unauthorized to trigger error handling
            return response.status < 400;
          },
        };
      },
      //Transform error response
      transformErrorResponse: (response: FetchBaseQueryError) => {
        if (!localStorage.getItem('token')) {
          console.warn('No token found in localStorage during error handling');
          return { status: 'CUSTOM_ERROR', data: { message: 'No token found' } };
        }
        console.error('getCurrentUser error:', response);
        return response;
      },
      //Transform response
      transformResponse: (response: any) => {
        console.log('Current user response received:', response);
        
        // Log the user ID and its type for debugging
        if (response?.id) {
          console.log('User ID from getCurrentUser:', response.id, 'Type:', typeof response.id);
        }
        
        // Ensure the response has the expected format with name field
        if (response) {
          // If response doesn't have a name property but has firstName/lastName
          if (!response.name && (response.firstName || response.lastName)) {
            response.name = `${response.firstName || ''} ${response.lastName || ''}`.trim();
            console.log('Created name from firstName/lastName:', response.name);
          }
          
          // If still no name, use email or default
          if (!response.name) {
            response.name = response.email ? response.email.split('@')[0] : 'User';
            console.log('Created name from email or default:', response.name);
          }
        }
        
        return response;
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log('Current user query fulfilled with data:', data);
        } catch (error: any) {
          console.error('Error fetching current user:', error);
          
          // If unauthorized (401), clear token from localStorage
          if (error?.error?.status === 401) {
            console.warn('Unauthorized error, clearing token');
            localStorage.removeItem('token');
          }
        }
      },
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } = authApi;