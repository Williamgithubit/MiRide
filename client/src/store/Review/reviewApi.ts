import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';
import { setAuthToken } from '../Auth/authUtils';

// Review API types
export interface Review {
  id: number;
  customerId: string;
  carId: number;
  rentalId: number;
  rating: number;
  comment: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  car: {
    id: number;
    name: string;
    model: string;
    brand: string;
    year: number;
    imageUrl?: string;
    images?: Array<{
      id: number;
      imageUrl: string;
      isPrimary: boolean;
      order: number;
    }>;
  };
  rental?: {
    id: number;
    startDate: string;
    endDate: string;
    totalCost: number;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface CreateReview {
  carId: number;
  rentalId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewResponse {
  id: number;
  response: string;
}

export interface UpdateReview extends Partial<CreateReview> {
  id: number;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Create base query with auth
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    
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
    getAllReviews: builder.query<Review[], void>({
      query: () => ({
        url: '/reviews',
        method: 'GET',
      }),
      providesTags: ['Review'],
    }),

    // Get reviews by car
    getReviewsByCar: builder.query<Review[], number>({
      query: (carId) => ({
        url: `/reviews/car/${carId}`,
        method: 'GET',
      }),
      providesTags: (result, error, carId) => [
        { type: 'Review', id: `car-${carId}` },
      ],
    }),

    // Get reviews by customer
    getReviewsByCustomer: builder.query<Review[], string>({
      query: (customerId) => ({
        url: `/reviews/customer/${customerId}`,
        method: 'GET',
      }),
      providesTags: (result, error, customerId) => [
        { type: 'Review', id: `customer-${customerId}` },
      ],
    }),

    // Get reviews by owner
    getReviewsByOwner: builder.query<Review[], number | void>({
      query: (ownerId) => ({
        url: ownerId ? `/reviews/owner/${ownerId}` : '/reviews/owner',
        method: 'GET',
      }),
      providesTags: ['Review'],
    }),

    // Create review
    createReview: builder.mutation<Review, CreateReview>({
      query: (review) => ({
        url: '/reviews',
        method: 'POST',
        body: review,
      }),
      invalidatesTags: ['Review', 'ReviewStats'],
    }),

    // Update review
    updateReview: builder.mutation<Review, UpdateReview>({
      query: ({ id, ...review }) => ({
        url: `/reviews/${id}`,
        method: 'PUT',
        body: review,
      }),
      invalidatesTags: ['Review', 'ReviewStats'],
    }),

    // Update review response (owner response to customer review)
    updateReviewResponse: builder.mutation<Review, UpdateReviewResponse>({
      query: ({ id, response }) => ({
        url: `/reviews/${id}/response`,
        method: 'PUT',
        body: { response },
      }),
      invalidatesTags: ['Review', 'ReviewStats'],
    }),

    // Delete review
    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Review', 'ReviewStats'],
    }),

    // Get review statistics
    getReviewStats: builder.query<ReviewStats, void>({
      query: () => ({
        url: '/reviews/stats',
        method: 'GET',
      }),
      providesTags: ['ReviewStats'],
    }),

    // Get review statistics by car
    getReviewStatsByCar: builder.query<ReviewStats, number>({
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

export const {
  useGetAllReviewsQuery,
  useGetReviewsByCarQuery,
  useGetReviewsByCustomerQuery,
  useGetReviewsByOwnerQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useUpdateReviewResponseMutation,
  useDeleteReviewMutation,
  useGetReviewStatsQuery,
  useGetReviewStatsByCarQuery,
} = reviewApi;
