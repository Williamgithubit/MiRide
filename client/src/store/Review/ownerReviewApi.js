import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const ownerReviewApi = createApi({
    reducerPath: 'ownerReviewApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/reviews/owner',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['OwnerReview'],
    endpoints: (builder) => ({
        getOwnerReviews: builder.query({
            query: (filters = {}) => {
                const params = new URLSearchParams();
                if (filters.search)
                    params.append('search', filters.search);
                if (filters.carId)
                    params.append('carId', filters.carId.toString());
                if (filters.customerId)
                    params.append('customerId', filters.customerId.toString());
                if (filters.rating)
                    params.append('rating', filters.rating.toString());
                if (filters.status && filters.status !== 'all')
                    params.append('status', filters.status);
                if (filters.limit)
                    params.append('limit', filters.limit.toString());
                if (filters.offset)
                    params.append('offset', filters.offset.toString());
                return `?${params.toString()}`;
            },
            providesTags: ['OwnerReview'],
        }),
        getOwnerReviewById: builder.query({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'OwnerReview', id }],
        }),
        moderateReview: builder.mutation({
            query: ({ id, action, reason }) => ({
                url: `/${id}/moderate`,
                method: 'PUT',
                body: { action, reason },
            }),
            invalidatesTags: ['OwnerReview'],
        }),
        deleteOwnerReview: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['OwnerReview'],
        }),
        getReviewStats: builder.query({
            query: () => '/stats',
            providesTags: ['OwnerReview'],
        }),
        // Bulk actions
        bulkModerateReviews: builder.mutation({
            query: ({ reviewIds, action, reason }) => ({
                url: '/bulk-moderate',
                method: 'PUT',
                body: { reviewIds, action, reason },
            }),
            invalidatesTags: ['OwnerReview'],
        }),
        bulkDeleteReviews: builder.mutation({
            query: (reviewIds) => ({
                url: '/bulk-delete',
                method: 'DELETE',
                body: { reviewIds },
            }),
            invalidatesTags: ['OwnerReview'],
        }),
    }),
});
export const { useGetOwnerReviewsQuery, useGetOwnerReviewByIdQuery, useModerateReviewMutation, useDeleteOwnerReviewMutation, useGetReviewStatsQuery, useBulkModerateReviewsMutation, useBulkDeleteReviewsMutation, } = ownerReviewApi;
