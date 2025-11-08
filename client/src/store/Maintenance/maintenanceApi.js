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
export const maintenanceApi = createApi({
    reducerPath: 'maintenanceApi',
    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        if (result.error && result.error.status === 401) {
            localStorage.removeItem('token');
            setAuthToken(null);
        }
        return result;
    },
    tagTypes: ['Maintenance', 'MaintenanceStats'],
    endpoints: (builder) => ({
        // Get all maintenance records
        getAllMaintenance: builder.query({
            query: () => ({
                url: '/maintenance',
                method: 'GET',
            }),
            providesTags: ['Maintenance'],
        }),
        // Get maintenance records by car
        getMaintenanceByCar: builder.query({
            query: (carId) => ({
                url: `/maintenance/car/${carId}`,
                method: 'GET',
            }),
            providesTags: (result, error, carId) => [
                { type: 'Maintenance', id: `car-${carId}` },
            ],
        }),
        // Get maintenance records by owner
        getMaintenanceByOwner: builder.query({
            query: () => ({
                url: '/maintenance/owner',
                method: 'GET',
            }),
            providesTags: ['Maintenance'],
        }),
        // Create maintenance record
        createMaintenance: builder.mutation({
            query: (record) => ({
                url: '/maintenance',
                method: 'POST',
                body: record,
            }),
            invalidatesTags: ['Maintenance', 'MaintenanceStats'],
        }),
        // Update maintenance record
        updateMaintenance: builder.mutation({
            query: ({ id, ...record }) => ({
                url: `/maintenance/${id}`,
                method: 'PUT',
                body: record,
            }),
            invalidatesTags: ['Maintenance', 'MaintenanceStats'],
        }),
        // Delete maintenance record
        deleteMaintenance: builder.mutation({
            query: (id) => ({
                url: `/maintenance/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Maintenance', 'MaintenanceStats'],
        }),
        // Get maintenance statistics
        getMaintenanceStats: builder.query({
            query: () => ({
                url: '/maintenance/stats',
                method: 'GET',
            }),
            providesTags: ['MaintenanceStats'],
        }),
    }),
});
export const { useGetAllMaintenanceQuery, useGetMaintenanceByCarQuery, useGetMaintenanceByOwnerQuery, useCreateMaintenanceMutation, useUpdateMaintenanceMutation, useDeleteMaintenanceMutation, useGetMaintenanceStatsQuery, } = maintenanceApi;
