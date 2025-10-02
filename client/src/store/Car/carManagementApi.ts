import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { setAuthToken } from '../Auth/authUtils';

// Car Management API types
export interface Car {
  id: string;
  name: string;
  model: string;
  brand: string;
  year: number;
  rentalPricePerDay: number;
  isAvailable: boolean;
  features?: string[];
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  // Enhanced status types for admin management
  status: 'available' | 'rented' | 'maintenance' | 'pending_approval' | 'rejected' | 'inactive';
}

export interface CarListResponse {
  cars: Car[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface CarFilters {
  search?: string;
  status?: 'available' | 'rented' | 'maintenance' | 'pending_approval' | 'rejected' | 'inactive' | 'all';
  owner?: string | 'all';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'model' | 'rentalPricePerDay' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface UpdateCarData {
  name?: string;
  model?: string;
  brand?: string;
  year?: number;
  rentalPricePerDay?: number;
  description?: string;
  status?: 'available' | 'rented' | 'maintenance' | 'pending_approval' | 'rejected' | 'inactive';
  features?: string[];
}

export interface UpdateCarStatusData {
  status: 'available' | 'rented' | 'maintenance' | 'pending_approval' | 'rejected' | 'inactive';
  rejectionReason?: string;
}

export interface BulkCarActionRequest {
  carIds: string[];
  action: 'approve' | 'reject' | 'deactivate' | 'delete';
}

export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface CarStats {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  pendingApprovalCars: number;
  rejectedCars: number;
  inactiveCars: number;
  newCarsThisMonth: number;
  averageRentalPrice: number;
}

// Create base query with auth
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
      setAuthToken(token);
    }
    
    return headers;
  },
});

const carManagementApi = createApi({
  reducerPath: 'carManagementApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);
    
    if (result.error && result.error.status === 401) {
      localStorage.removeItem('token');
      setAuthToken(null);
    }
    
    return result;
  },
  tagTypes: ['Car', 'CarList', 'CarStats', 'Owner'],
  endpoints: (builder) => ({
    // Get paginated cars list with filters
    getCars: builder.query<CarListResponse, CarFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.owner && filters.owner !== 'all') params.append('owner', filters.owner);
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
        
        return {
          url: `/admin/cars?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['CarList'],
    }),

    // Get single car by ID
    getCarById: builder.query<Car, string>({
      query: (carId) => ({
        url: `/admin/cars/${carId}`,
        method: 'GET',
      }),
      providesTags: (result, error, carId) => [{ type: 'Car', id: carId }],
    }),

    // Update car
    updateCar: builder.mutation<Car, { carId: string; data: UpdateCarData }>({
      query: ({ carId, data }) => ({
        url: `/admin/cars/${carId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { carId }) => [
        { type: 'Car', id: carId },
        'CarList',
        'CarStats',
      ],
    }),

    // Delete car
    deleteCar: builder.mutation<{ message: string }, string>({
      query: (carId) => ({
        url: `/admin/cars/${carId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, carId) => [
        { type: 'Car', id: carId },
        'CarList',
        'CarStats',
      ],
    }),

    // Update car status (approve/reject/deactivate)
    updateCarStatus: builder.mutation<Car, { carId: string; data: UpdateCarStatusData }>({
      query: ({ carId, data }) => ({
        url: `/admin/cars/${carId}/status`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { carId }) => [
        { type: 'Car', id: carId },
        'CarList',
        'CarStats',
      ],
    }),

    // Bulk actions
    bulkCarAction: builder.mutation<{ message: string; affectedCount: number }, BulkCarActionRequest>({
      query: (data) => ({
        url: '/admin/cars/bulk',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['CarList', 'CarStats'],
    }),

    // Get car statistics
    getCarStats: builder.query<CarStats, void>({
      query: () => ({
        url: '/admin/cars/stats',
        method: 'GET',
      }),
      providesTags: ['CarStats'],
    }),

    // Get all owners for filter dropdown
    getOwners: builder.query<Owner[], void>({
      query: () => ({
        url: '/admin/cars/owners',
        method: 'GET',
      }),
      providesTags: ['Owner'],
    }),
  }),
});

export const {
  useGetCarsQuery,
  useGetCarByIdQuery,
  useUpdateCarMutation,
  useDeleteCarMutation,
  useUpdateCarStatusMutation,
  useBulkCarActionMutation,
  useGetCarStatsQuery,
  useGetOwnersQuery,
  useLazyGetCarsQuery,
} = carManagementApi;

export { carManagementApi };
export default carManagementApi;
