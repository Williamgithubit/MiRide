import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const rentalApi = createApi({
    reducerPath: 'rentalApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api',
        prepareHeaders: (headers, { getState }) => {
            // Get the token from the state
            const token = getState().auth.token;
            // If we have a token, add it to the headers
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Rental'],
    endpoints: (builder) => ({
        getRentals: builder.query({
            query: () => '/rentals',
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Rental', id })),
                    { type: 'Rental', id: 'LIST' },
                ]
                : [{ type: 'Rental', id: 'LIST' }],
        }),
        getRentalById: builder.query({
            query: (id) => `/rentals/${id}`,
            providesTags: (result, error, id) => [{ type: 'Rental', id }],
        }),
        getCustomerRentals: builder.query({
            query: () => `/rentals/customer`,
            transformResponse: (response) => {
                // Ensure we always return an array
                if (!response)
                    return [];
                return Array.isArray(response) ? response : [response];
            },
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Rental', id })),
                    { type: 'Rental', id: 'CUSTOMER' },
                ]
                : [{ type: 'Rental', id: 'CUSTOMER' }],
        }),
        getActiveRentals: builder.query({
            query: () => `/rentals/active`,
            transformResponse: (response) => {
                // Handle single object or array response
                if (!response)
                    return [];
                return Array.isArray(response) ? response : [response];
            },
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Rental', id })),
                    { type: 'Rental', id: 'ACTIVE' },
                ]
                : [{ type: 'Rental', id: 'ACTIVE' }],
        }),
        getCarRentals: builder.query({
            query: (carId) => `/rentals/car/${carId}`,
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Rental', id })),
                    { type: 'Rental', id: 'CAR' },
                ]
                : [{ type: 'Rental', id: 'CAR' }],
        }),
        createRental: builder.mutation({
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
        updateRental: builder.mutation({
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
        cancelRental: builder.mutation({
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
        completeRental: builder.mutation({
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
        getPendingBookings: builder.query({
            query: () => '/rentals/pending',
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Rental', id })),
                    { type: 'Rental', id: 'PENDING' },
                ]
                : [{ type: 'Rental', id: 'PENDING' }],
        }),
        getOwnerBookings: builder.query({
            query: () => '/rentals/owner',
            providesTags: (result) => result
                ? [
                    ...result.map(({ id }) => ({ type: 'Rental', id })),
                    { type: 'Rental', id: 'OWNER' },
                ]
                : [{ type: 'Rental', id: 'OWNER' }],
        }),
        approveBooking: builder.mutation({
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
        rejectBooking: builder.mutation({
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
    }),
});
export const { useGetRentalsQuery, useGetRentalByIdQuery, useGetCustomerRentalsQuery, useGetActiveRentalsQuery, useGetCarRentalsQuery, useCreateRentalMutation, useUpdateRentalMutation, useCancelRentalMutation, useCompleteRentalMutation, 
// Owner-specific hooks
useGetPendingBookingsQuery, useGetOwnerBookingsQuery, useApproveBookingMutation, useRejectBookingMutation, } = rentalApi;
