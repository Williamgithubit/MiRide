import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  driverLicense?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      // Get the token from the state
      const token = (getState() as RootState).auth.token;
      
      // If we have a token, add it to the headers
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      query: () => '/customers',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Customer' as const, id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerById: builder.query<Customer, string>({
      query: (id) => {
        // Emergency fix: Prevent invalid ID calls
        if (!id || id === '0' || id === 'undefined' || id === 'null' || id === 'invalid') {
          console.error('customerApi - Invalid ID provided:', id);
          throw new Error('Invalid customer ID provided');
        }
        console.log('customerApi - Fetching customer with ID:', id);
        return `/customers/${id}`;
      },
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    addCustomer: builder.mutation<Customer, Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>({
      query: (customer) => ({
        url: '/customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation<Customer, Partial<Customer> & { id: string }>({
      query: ({ id, ...customer }) => ({
        url: `/customers/${id}`,
        method: 'PUT',
        body: customer,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Customer', id },
        { type: 'Customer', id: 'LIST' },
      ],
    }),
    searchCustomers: builder.query<Customer[], string>({
      query: (searchTerm) => ({
        url: '/customers/search',
        params: { q: searchTerm },
      }),
      providesTags: [{ type: 'Customer', id: 'SEARCH' }],
    }),
    // Get current user's profile
    getCurrentProfile: builder.query<Customer, void>({
      query: () => '/customers/profile',
      providesTags: [{ type: 'Customer', id: 'PROFILE' }],
    }),
    // Update current user's profile
    updateProfile: builder.mutation<Customer, UpdateProfileData>({
      query: (profileData) => ({
        url: '/customers/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'PROFILE' }],
    }),
    // Upload avatar
    uploadAvatar: builder.mutation<{ avatar: string }, FormData>({
      query: (formData) => ({
        url: '/customers/profile/avatar',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [{ type: 'Customer', id: 'PROFILE' }],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useAddCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useSearchCustomersQuery,
  useGetCurrentProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} = customerApi;
