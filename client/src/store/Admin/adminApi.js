import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// Create a base query with custom fetch logic
const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api/admin`,
    credentials: 'include', // Important for cookies if using them
    prepareHeaders: (headers, { getState }) => {
        try {
            // Try to get token from Redux state first
            const state = getState();
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
            }
            else {
                console.warn('No token available for admin API request');
            }
            return headers;
        }
        catch (error) {
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
        getUsers: builder.query({
            query: () => '/users',
            providesTags: ['Users'],
        }),
        getUser: builder.query({
            query: (id) => `/users/${id}`,
            providesTags: (result, error, id) => [{ type: 'Users', id }],
        }),
        createUser: builder.mutation({
            query: (userData) => ({
                url: '/users',
                method: 'POST',
                body: userData,
            }),
            invalidatesTags: ['Users'],
        }),
        updateUser: builder.mutation({
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
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users'],
        }),
        // Car Management
        getCars: builder.query({
            query: (params) => {
                // If params is undefined, return just the URL
                if (!params)
                    return '/cars';
                // Otherwise, return the URL with params
                return {
                    url: '/cars',
                    params: params || {} // Ensure params is always an object
                };
            },
            providesTags: (result) => {
                // If we have results, return both the list and individual item tags
                if (result) {
                    return [
                        'Cars',
                        ...result.map(({ id }) => ({ type: 'Cars', id }))
                    ];
                }
                // Otherwise, just return the list tag
                return ['Cars'];
            },
        }),
        getCar: builder.query({
            query: (id) => `/cars/${id}`,
            providesTags: (result, error, id) => [{ type: 'Cars', id }],
        }),
        updateCar: builder.mutation({
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
        deleteCar: builder.mutation({
            query: (id) => ({
                url: `/cars/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Cars', id },
                'Cars',
            ],
        }),
        updateCarStatus: builder.mutation({
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
        getBookings: builder.query({
            query: () => '/bookings',
            providesTags: ['Bookings'],
        }),
        exportBookings: builder.query({
            query: (params) => ({
                url: '/bookings/export',
                params,
                responseHandler: (response) => response.blob(),
            }),
        }),
    }),
});
export const { 
// User Management
useGetUsersQuery, useGetUserQuery, useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation, 
// Car Management
useGetCarsQuery, useLazyGetCarsQuery, useGetCarQuery, useUpdateCarMutation, useDeleteCarMutation, useUpdateCarStatusMutation, 
// Booking Management
useGetBookingsQuery, useLazyExportBookingsQuery, } = adminApi;
