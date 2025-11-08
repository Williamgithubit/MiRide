import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';

export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  ownerId: number;
  ownerName: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  createdAt: string;
  // Add other car properties as needed
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'owner' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
}

// Create a base query with custom fetch logic
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/admin`,
  credentials: 'include', // Important for cookies if using them
  prepareHeaders: (headers, { getState }) => {
    try {
      // Try to get token from Redux state first
      const state = getState() as RootState;
      let token = state?.auth?.token;
      
      // If not in Redux, try localStorage
      if (!token && typeof window !== 'undefined') {
        const storedAuth = localStorage.getItem('persist:root');
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          if (parsedAuth.auth) {
            const authState = JSON.parse(parsedAuth.auth);
            token = authState.token || null;
          }
        }
        // Fallback to direct localStorage token
        if (!token) {
          token = localStorage.getItem('token');
        }
      }
      
      if (token) {
        // Ensure token is properly formatted
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers.set('Authorization', formattedToken);
      } else {
        console.warn('No token available for admin API request');
      }
      
      return headers;
    } catch (error) {
      console.error('Error preparing headers:', error);
      return headers;
    }
  },
});

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    // Log the request and response for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Admin API Request:', {
        url: args.url,
        method: args.method,
        headers: args.headers,
        body: args.body
      });
      console.log('Admin API Response:', result);
    }
    
    return result;
  },
  tagTypes: ['Users', 'Cars', 'Bookings'],
  endpoints: (builder) => ({
    // User Management
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['Users'],
    }),
    getUser: builder.query<User, number>({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation<User, { id: number; userData: Partial<User> }>({
      query: ({ id, userData }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users', id },
        'Users',
      ],
    }),
    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    
    // Car Management
    getCars: builder.query<Car[], { status?: string; search?: string } | void>({
      query: (params) => {
        // If params is undefined, return just the URL
        if (!params) return '/cars';
        
        // Otherwise, return the URL with params
        return {
          url: '/cars',
          params: params || {}  // Ensure params is always an object
        };
      },
      providesTags: (result) => {
        // If we have results, return both the list and individual item tags
        if (result) {
          return [
            'Cars',
            ...result.map(({ id }) => ({ type: 'Cars' as const, id }))
          ];
        }
        // Otherwise, just return the list tag
        return ['Cars'];
      },
    }),
    getCar: builder.query<Car, number>({
      query: (id) => `/cars/${id}`,
      providesTags: (result, error, id) => [{ type: 'Cars' as const, id }],
    }),
    updateCar: builder.mutation<Car, { id: number; carData: Partial<Car> }>({
      query: ({ id, carData }) => ({
        url: `/cars/${id}`,
        method: 'PUT',
        body: carData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Cars', id },
        'Cars',
      ],
    }),
    deleteCar: builder.mutation<void, number>({
      query: (id) => ({
        url: `/cars/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Cars', id },
        'Cars',
      ],
    }),
    updateCarStatus: builder.mutation<Car, { id: number; status: string; reason?: string }>({
      query: ({ id, status, reason }) => ({
        url: `/cars/${id}/status`,
        method: 'PUT',
        body: { status, ...(reason && { reason }) },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Cars', id },
        'Cars',
      ],
    }),
    
    // Booking Management
    getBookings: builder.query<any[], void>({
      query: () => '/bookings',
      providesTags: ['Bookings'],
    }),
    exportBookings: builder.query<Blob, { startDate?: string; endDate?: string }>({
        query: (params) => ({
          url: '/bookings/export',
          params,
          responseHandler: (response: Response) => response.blob(),
        }),
      }),
  }),
});

export const {
  // User Management
  useGetUsersQuery,
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  
  // Car Management
  useGetCarsQuery,
  useLazyGetCarsQuery,
  useGetCarQuery,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useUpdateCarStatusMutation,
  
  // Booking Management
  useGetBookingsQuery,
  useLazyExportBookingsQuery,
} = adminApi;
