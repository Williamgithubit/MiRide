import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAuthToken } from '../Auth/authUtils';
// Create base query with auth
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token || localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
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
        getCars: builder.query({
            query: (filters = {}) => {
                const params = new URLSearchParams();
                if (filters.search)
                    params.append('search', filters.search);
                if (filters.status && filters.status !== 'all')
                    params.append('status', filters.status);
                if (filters.owner && filters.owner !== 'all')
                    params.append('owner', filters.owner);
                if (filters.minPrice)
                    params.append('minPrice', filters.minPrice.toString());
                if (filters.maxPrice)
                    params.append('maxPrice', filters.maxPrice.toString());
                if (filters.page)
                    params.append('page', filters.page.toString());
                if (filters.limit)
                    params.append('limit', filters.limit.toString());
                if (filters.sortBy)
                    params.append('sortBy', filters.sortBy);
                if (filters.sortOrder)
                    params.append('sortOrder', filters.sortOrder);
                return {
                    url: `/admin/cars?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['CarList'],
        }),
        // Get single car by ID
        getCarById: builder.query({
            query: (carId) => ({
                url: `/admin/cars/${carId}`,
                method: 'GET',
            }),
            providesTags: (result, error, carId) => [{ type: 'Car', id: carId }],
        }),
        // Update car
        updateCar: builder.mutation({
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
        deleteCar: builder.mutation({
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
        updateCarStatus: builder.mutation({
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
        bulkCarAction: builder.mutation({
            query: (data) => ({
                url: '/admin/cars/bulk',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['CarList', 'CarStats'],
        }),
        // Get car statistics
        getCarStats: builder.query({
            query: () => ({
                url: '/admin/cars/stats',
                method: 'GET',
            }),
            providesTags: ['CarStats'],
        }),
        // Get all owners for filter dropdown
        getOwners: builder.query({
            query: () => ({
                url: '/admin/cars/owners',
                method: 'GET',
            }),
            providesTags: ['Owner'],
        }),
    }),
});
export const { useGetCarsQuery, useGetCarByIdQuery, useUpdateCarMutation, useDeleteCarMutation, useUpdateCarStatusMutation, useBulkCarActionMutation, useGetCarStatsQuery, useGetOwnersQuery, useLazyGetCarsQuery, } = carManagementApi;
export { carManagementApi };
export default carManagementApi;
