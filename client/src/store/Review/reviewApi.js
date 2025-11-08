import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAuthToken } from '../Auth/authUtils';
// Create base query with auth
const baseQuery = fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token || localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
            setAuthToken(token);
        }
        return headers;
    },
});
export const reviewApi = createApi({
    reducerPath: 'reviewApi',
    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        if (result.error && result.error.status === 401) {
            localStorage.removeItem('token');
            setAuthToken(null);
        }
        return result;
    },
    tagTypes: ['Review', 'ReviewStats'],
    endpoints: (builder) => ({
        // Get all reviews
        getAllReviews: builder.query({
            query: () => ({
                url: '/reviews',
                method: 'GET',
            }),
            providesTags: ['Review'],
        }),
        // Get reviews by car
        getReviewsByCar: builder.query({
            query: (carId) => ({
                url: `/reviews/car/${carId}`,
                method: 'GET',
            }),
            providesTags: (result, error, carId) => [
                { type: 'Review', id: `car-${carId}` },
            ],
        }),
        // Get reviews by customer
        getReviewsByCustomer: builder.query({
            query: (customerId) => ({
                url: `/reviews/customer/${customerId}`,
                method: 'GET',
            }),
            providesTags: (result, error, customerId) => [
                { type: 'Review', id: `customer-${customerId}` },
            ],
        }),
        // Get reviews by owner
        getReviewsByOwner: builder.query({
            query: (ownerId) => ({
                url: ownerId ? `/reviews/owner/${ownerId}` : '/reviews/owner',
                method: 'GET',
            }),
            providesTags: ['Review'],
        }),
        // Create review
        createReview: builder.mutation({
            query: (review) => ({
                url: '/reviews',
                method: 'POST',
                body: review,
            }),
            invalidatesTags: ['Review', 'ReviewStats'],
        }),
        // Update review
        updateReview: builder.mutation({
            query: ({ id, ...review }) => ({
                url: `/reviews/${id}`,
                method: 'PUT',
                body: review,
            }),
            invalidatesTags: ['Review', 'ReviewStats'],
        }),
        // Update review response (owner response to customer review)
        updateReviewResponse: builder.mutation({
            query: ({ id, response }) => ({
                url: `/reviews/${id}/response`,
                method: 'PUT',
                body: { response },
            }),
            invalidatesTags: ['Review', 'ReviewStats'],
        }),
        // Delete review
        deleteReview: builder.mutation({
            query: (id) => ({
                url: `/reviews/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Review', 'ReviewStats'],
        }),
        // Get review statistics
        getReviewStats: builder.query({
            query: () => ({
                url: '/reviews/stats',
                method: 'GET',
            }),
            providesTags: ['ReviewStats'],
        }),
        // Get review statistics by car
        getReviewStatsByCar: builder.query({
            query: (carId) => ({
                url: `/reviews/stats/car/${carId}`,
                method: 'GET',
            }),
            providesTags: (result, error, carId) => [
                { type: 'ReviewStats', id: `car-${carId}` },
            ],
        }),
    }),
});
export const { useGetAllReviewsQuery, useGetReviewsByCarQuery, useGetReviewsByCustomerQuery, useGetReviewsByOwnerQuery, useCreateReviewMutation, useUpdateReviewMutation, useUpdateReviewResponseMutation, useDeleteReviewMutation, useGetReviewStatsQuery, useGetReviewStatsByCarQuery, } = reviewApi;
