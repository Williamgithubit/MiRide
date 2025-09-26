import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { BookingStatus } from './bookingSlice';

export interface BookingModificationRequest {
  id: number;
  startDate?: string;
  endDate?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequests?: string;
  hasInsurance?: boolean;
  hasGPS?: boolean;
  hasChildSeat?: boolean;
  hasAdditionalDriver?: boolean;
}

export interface BookingCancellationRequest {
  id: number;
  reason?: string;
}

export interface BookingStatsResponse {
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  upcomingBookings: number;
}

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Booking', 'BookingStats'],
  endpoints: (builder) => ({
    // Get current customer bookings (active and pending)
    getCurrentBookings: builder.query<BookingStatus[], void>({
      query: () => '/rentals/customer/current',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'CURRENT' },
            ]
          : [{ type: 'Booking', id: 'CURRENT' }],
    }),

    // Get customer booking history (completed, cancelled)
    getBookingHistory: builder.query<BookingStatus[], void>({
      query: () => '/rentals/customer/history',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'HISTORY' },
            ]
          : [{ type: 'Booking', id: 'HISTORY' }],
    }),

    // Get all customer bookings
    getAllBookings: builder.query<BookingStatus[], void>({
      query: () => '/rentals/customer',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Booking' as const, id })),
              { type: 'Booking', id: 'ALL' },
            ]
          : [{ type: 'Booking', id: 'ALL' }],
    }),

    // Get specific booking by ID
    getBookingById: builder.query<BookingStatus, number>({
      query: (id) => `/rentals/${id}`,
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // Get active booking (currently ongoing rental)
    getActiveBooking: builder.query<BookingStatus | null, void>({
      query: () => '/rentals/customer/active',
      providesTags: [{ type: 'Booking', id: 'ACTIVE' }],
    }),

    // Get booking statistics
    getBookingStats: builder.query<BookingStatsResponse, void>({
      query: () => '/rentals/customer/stats',
      providesTags: [{ type: 'BookingStats', id: 'CUSTOMER' }],
    }),

    // Modify booking (if allowed)
    modifyBooking: builder.mutation<BookingStatus, BookingModificationRequest>({
      query: ({ id, ...modifications }) => ({
        url: `/rentals/${id}/modify`,
        method: 'PUT',
        body: modifications,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'CURRENT' },
        { type: 'Booking', id: 'ALL' },
        { type: 'BookingStats', id: 'CUSTOMER' },
      ],
    }),

    // Cancel booking
    cancelBooking: builder.mutation<BookingStatus, BookingCancellationRequest>({
      query: ({ id, reason }) => ({
        url: `/rentals/${id}/cancel`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'CURRENT' },
        { type: 'Booking', id: 'ALL' },
        { type: 'Booking', id: 'ACTIVE' },
        { type: 'BookingStats', id: 'CUSTOMER' },
      ],
    }),

    // Request booking modification (for owner approval)
    requestModification: builder.mutation<BookingStatus, BookingModificationRequest & { requestReason: string }>({
      query: ({ id, requestReason, ...modifications }) => ({
        url: `/rentals/${id}/request-modification`,
        method: 'POST',
        body: { requestReason, modifications },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'CURRENT' },
        { type: 'Booking', id: 'ALL' },
      ],
    }),

    // Get booking payment details
    getBookingPayment: builder.query<{
      paymentIntentId: string;
      stripeSessionId: string;
      paymentStatus: string;
      amount: number;
      currency: string;
      paymentMethod: string;
      transactionId: string;
      paidAt: string;
    }, number>({
      query: (bookingId) => `/rentals/${bookingId}/payment`,
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
    }),

    // Extend booking (if available)
    extendBooking: builder.mutation<BookingStatus, { id: number; newEndDate: string; additionalCost: number }>({
      query: ({ id, newEndDate, additionalCost }) => ({
        url: `/rentals/${id}/extend`,
        method: 'PUT',
        body: { newEndDate, additionalCost },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'CURRENT' },
        { type: 'Booking', id: 'ALL' },
        { type: 'Booking', id: 'ACTIVE' },
        { type: 'BookingStats', id: 'CUSTOMER' },
      ],
    }),

    // Report issue with booking
    reportBookingIssue: builder.mutation<{ success: boolean; ticketId: string }, { bookingId: number; issue: string; description: string; priority: 'low' | 'medium' | 'high' }>({
      query: ({ bookingId, issue, description, priority }) => ({
        url: `/rentals/${bookingId}/report-issue`,
        method: 'POST',
        body: { issue, description, priority },
      }),
    }),

    // Get booking timeline/activity
    getBookingTimeline: builder.query<Array<{
      id: number;
      action: string;
      description: string;
      timestamp: string;
      actor: 'customer' | 'owner' | 'system';
      metadata?: Record<string, any>;
    }>, number>({
      query: (bookingId) => `/rentals/${bookingId}/timeline`,
      providesTags: (result, error, bookingId) => [{ type: 'Booking', id: bookingId }],
    }),
  }),
});

export const {
  useGetCurrentBookingsQuery,
  useGetBookingHistoryQuery,
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useGetActiveBookingQuery,
  useGetBookingStatsQuery,
  useModifyBookingMutation,
  useCancelBookingMutation,
  useRequestModificationMutation,
  useGetBookingPaymentQuery,
  useExtendBookingMutation,
  useReportBookingIssueMutation,
  useGetBookingTimelineQuery,
} = bookingApi;
