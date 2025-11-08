import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../../config/api';
import { Booking } from './adminBookingsSlice';
import tokenStorage from '../../utils/tokenStorage';

export const adminBookingsApi = createApi({
  reducerPath: 'adminBookingsApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: `${API_BASE_URL}/api/admin`,
    prepareHeaders: (headers) => {
      const token = tokenStorage.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminBookings'],
  endpoints: (builder) => ({
    getBookings: builder.query<Booking[], void>({
      query: () => 'bookings',
      providesTags: ['AdminBookings'],
    }),
    
    getBookingById: builder.query<Booking, string>({
      query: (id) => `bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminBookings', id }],
    }),
    
    updateBookingStatus: builder.mutation<Booking, { bookingId: string; status: string }>({
      query: ({ bookingId, status }) => ({
        url: `bookings/${bookingId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { bookingId }) => [
        { type: 'AdminBookings', id: bookingId },
        'AdminBookings',
      ],
    }),
    
    getBookingsByFilter: builder.query<
      Booking[],
      {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: (params) => ({
        url: 'bookings',
        params,
      }),
      providesTags: ['AdminBookings'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
  useGetBookingsByFilterQuery,
} = adminBookingsApi;