import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';
import { Car } from '../Car/carApi';
import { Customer } from '../Customer/customerApi';

export interface Rental {
  id: number;
  carId: number;
  customerId: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  totalAmount: number;
  totalDays: number;
  ownerId: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentIntentId?: string;
  stripeSessionId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequests?: string;
  hasInsurance?: boolean;
  hasGPS?: boolean;
  hasChildSeat?: boolean;
  hasAdditionalDriver?: boolean;
  insuranceCost?: number;
  gpsCost?: number;
  childSeatCost?: number;
  additionalDriverCost?: number;
  ownerPayout?: number;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  car?: Car;
  customer?: Customer;
}

export interface CreateRentalRequest {
  carId: number;
  customerId?: number; // Made optional since it's handled by auth
  startDate: string;
  endDate: string;
  totalDays?: number;
  totalPrice?: number;
  insurance?: boolean;
  gps?: boolean;
  childSeat?: boolean;
  additionalDriver?: boolean;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequests?: string;
  selectedCar?: Car;
}

export const rentalApi = createApi({
  reducerPath: 'rentalApi',
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
  tagTypes: ['Rental'],
  endpoints: (builder) => ({
    getRentals: builder.query<Rental[], void>({
      query: () => '/rentals',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'LIST' },
            ]
          : [{ type: 'Rental', id: 'LIST' }],
    }),
    getRentalById: builder.query<Rental, number>({
      query: (id) => `/rentals/${id}`,
      providesTags: (result, error, id) => [{ type: 'Rental', id }],
    }),
    getCustomerRentals: builder.query<Rental[], void>({
      query: () => `/rentals/customer`,
      transformResponse: (response: any) => {
        // Ensure we always return an array
        if (!response) return [];
        return Array.isArray(response) ? response : [response];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'CUSTOMER' },
            ]
          : [{ type: 'Rental', id: 'CUSTOMER' }],
    }),
    getActiveRentals: builder.query<Rental[], void>({
      query: () => `/rentals/active`,
      transformResponse: (response: any) => {
        // Handle single object or array response
        if (!response) return [];
        return Array.isArray(response) ? response : [response];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'ACTIVE' },
            ]
          : [{ type: 'Rental', id: 'ACTIVE' }],
    }),
    getCarRentals: builder.query<Rental[], number>({
      query: (carId) => `/rentals/car/${carId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'CAR' },
            ]
          : [{ type: 'Rental', id: 'CAR' }],
    }),
    createRental: builder.mutation<Rental, CreateRentalRequest>({
      query: (rental) => ({
        url: '/rentals/checkout',
        method: 'POST',
        body: rental,
      }),
      invalidatesTags: [
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    updateRental: builder.mutation<Rental, Partial<Rental> & { id: number }>({
      query: ({ id, ...rental }) => ({
        url: `/rentals/${id}`,
        method: 'PUT',
        body: rental,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    cancelRental: builder.mutation<Rental, number>({
      query: (id) => ({
        url: `/rentals/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    completeRental: builder.mutation<Rental, number>({
      query: (id) => ({
        url: `/rentals/${id}/complete`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    // Owner-specific endpoints
    getPendingBookings: builder.query<Rental[], void>({
      query: () => '/rentals/pending',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'PENDING' },
            ]
          : [{ type: 'Rental', id: 'PENDING' }],
    }),
    getOwnerBookings: builder.query<Rental[], void>({
      query: () => '/rentals/owner',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'OWNER' },
            ]
          : [{ type: 'Rental', id: 'OWNER' }],
    }),
    approveBooking: builder.mutation<Rental, number>({
      query: (id) => ({
        url: `/rentals/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'PENDING' },
        { type: 'Rental', id: 'OWNER' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    rejectBooking: builder.mutation<Rental, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/rentals/${id}/reject`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Rental', id },
        { type: 'Rental', id: 'LIST' },
        { type: 'Rental', id: 'PENDING' },
        { type: 'Rental', id: 'OWNER' },
        { type: 'Rental', id: 'CUSTOMER' },
        { type: 'Rental', id: 'CAR' },
      ],
    }),
    getOwnerActiveRentals: builder.query<Rental[], void>({
      query: () => '/rentals/owner/active',
      transformResponse: (response: any) => {
        if (!response) return [];
        return Array.isArray(response) ? response : [response];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Rental' as const, id })),
              { type: 'Rental', id: 'OWNER_ACTIVE' },
            ]
          : [{ type: 'Rental', id: 'OWNER_ACTIVE' }],
    }),
  }),
});

export const {
  useGetRentalsQuery,
  useGetRentalByIdQuery,
  useGetCustomerRentalsQuery,
  useGetActiveRentalsQuery,
  useGetCarRentalsQuery,
  useCreateRentalMutation,
  useUpdateRentalMutation,
  useCancelRentalMutation,
  useCompleteRentalMutation,
  // Owner-specific hooks
  useGetPendingBookingsQuery,
  useGetOwnerBookingsQuery,
  useGetOwnerActiveRentalsQuery,
  useApproveBookingMutation,
  useRejectBookingMutation,
} = rentalApi;
