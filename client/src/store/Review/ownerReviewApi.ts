import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export interface OwnerReview {
  id: number;
  carId: number;
  customerId: number;
  rating: number;
  comment: string;
  status: 'published' | 'pending' | 'hidden';
  createdAt: string;
  updatedAt: string;
  car: {
    id: number;
    name: string;
    make: string;
    model: string;
    year: number;
    imageUrl?: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface OwnerReviewResponse {
  reviews: OwnerReview[];
  total: number;
  totalPages: number;
}

export interface ReviewFilters {
  search?: string;
  carId?: number;
  customerId?: number;
  rating?: number;
  status?: 'all' | 'published' | 'pending' | 'hidden';
  limit?: number;
  offset?: number;
}

export interface ReviewModerationRequest {
  id: number;
  action: 'approve' | 'reject' | 'hide';
  reason?: string;
}

export const ownerReviewApi = createApi({
  reducerPath: 'ownerReviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/reviews/owner',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['OwnerReview'],
  endpoints: (builder) => ({
    getOwnerReviews: builder.query<OwnerReviewResponse, ReviewFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.carId) params.append('carId', filters.carId.toString());
        if (filters.customerId) params.append('customerId', filters.customerId.toString());
        if (filters.rating) params.append('rating', filters.rating.toString());
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        
        return `?${params.toString()}`;
      },
      providesTags: ['OwnerReview'],
    }),

    getOwnerReviewById: builder.query<OwnerReview, number>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'OwnerReview', id }],
    }),

    moderateReview: builder.mutation<{ message: string }, ReviewModerationRequest>({
      query: ({ id, action, reason }) => ({
        url: `/${id}/moderate`,
        method: 'PUT',
        body: { action, reason },
      }),
      invalidatesTags: ['OwnerReview'],
    }),

    deleteOwnerReview: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OwnerReview'],
    }),

    getReviewStats: builder.query<{
      totalReviews: number;
      averageRating: number;
      publishedReviews: number;
      pendingReviews: number;
      hiddenReviews: number;
      ratingDistribution: { [key: number]: number };
    }, void>({
      query: () => '/stats',
      providesTags: ['OwnerReview'],
    }),

    // Bulk actions
    bulkModerateReviews: builder.mutation<{ message: string; updatedCount: number }, {
      reviewIds: number[];
      action: 'approve' | 'reject' | 'hide';
      reason?: string;
    }>({
      query: ({ reviewIds, action, reason }) => ({
        url: '/bulk-moderate',
        method: 'PUT',
        body: { reviewIds, action, reason },
      }),
      invalidatesTags: ['OwnerReview'],
    }),

    bulkDeleteReviews: builder.mutation<{ message: string; deletedCount: number }, number[]>({
      query: (reviewIds) => ({
        url: '/bulk-delete',
        method: 'DELETE',
        body: { reviewIds },
      }),
      invalidatesTags: ['OwnerReview'],
    }),
  }),
});

export const {
  useGetOwnerReviewsQuery,
  useGetOwnerReviewByIdQuery,
  useModerateReviewMutation,
  useDeleteOwnerReviewMutation,
  useGetReviewStatsQuery,
  useBulkModerateReviewsMutation,
  useBulkDeleteReviewsMutation,
} = ownerReviewApi;
