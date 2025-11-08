import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import tokenStorage from '../../utils/tokenStorage';
export const adminBookingsApi = createApi({
    reducerPath: 'adminBookingsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/admin',
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
        getBookings: builder.query({
            query: () => 'bookings',
            providesTags: ['AdminBookings'],
        }),
        getBookingById: builder.query({
            query: (id) => `bookings/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'AdminBookings', id }],
        }),
        updateBookingStatus: builder.mutation({
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
        getBookingsByFilter: builder.query({
            query: (params) => ({
                url: 'bookings',
                params,
            }),
            providesTags: ['AdminBookings'],
        }),
    }),
});
export const { useGetBookingsQuery, useGetBookingByIdQuery, useUpdateBookingStatusMutation, useGetBookingsByFilterQuery, } = adminBookingsApi;
