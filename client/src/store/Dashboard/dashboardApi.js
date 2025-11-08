import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setAuthToken } from '../Auth/authUtils';
// Create base query with auth
const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token || localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
            setAuthToken(token);
        }
        return headers;
    },
});
const dashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        if (result.error && result.error.status === 401) {
            localStorage.removeItem('token');
            setAuthToken(null);
        }
        return result;
    },
    tagTypes: ['DashboardStats', 'OwnerStats', 'AdminStats', 'Revenue'],
    endpoints: (builder) => ({
        // Get customer dashboard stats
        getCustomerStats: builder.query({
            query: () => ({
                url: '/dashboard/customer-stats',
                method: 'GET',
            }),
            providesTags: ['DashboardStats'],
        }),
        // Get owner dashboard stats
        getOwnerStats: builder.query({
            query: (ownerId) => ({
                url: '/dashboard/owner-stats',
                method: 'GET',
            }),
            providesTags: ['OwnerStats'],
        }),
        // Get admin dashboard stats
        getAdminStats: builder.query({
            query: () => ({
                url: '/dashboard/stats/admin',
                method: 'GET',
            }),
            providesTags: ['AdminStats'],
        }),
        // Get revenue data
        getRevenueData: builder.query({
            query: (period = 'month') => ({
                url: `/dashboard/revenue-data?period=${period}`,
                method: 'GET',
            }),
            providesTags: ['Revenue'],
        }),
        // Get car utilization data
        getCarUtilization: builder.query({
            query: () => ({
                url: '/dashboard/cars/utilization',
                method: 'GET',
            }),
            providesTags: ['DashboardStats'],
        }),
        // Get comprehensive analytics data for owner
        getOwnerAnalytics: builder.query({
            query: ({ period = 'monthly' } = {}) => ({
                url: `/dashboard/owner/analytics?period=${period}`,
                method: 'GET',
            }),
            providesTags: ['OwnerStats', 'Revenue'],
        }),
        // Generate reports
        generateReport: builder.query({
            query: ({ reportType, startDate, endDate }) => {
                const params = new URLSearchParams({ reportType });
                if (startDate)
                    params.append('startDate', startDate);
                if (endDate)
                    params.append('endDate', endDate);
                return {
                    url: `/dashboard/reports/generate?${params.toString()}`,
                    method: 'GET',
                };
            },
        }),
        // Get platform settings
        getPlatformSettings: builder.query({
            query: () => ({
                url: '/dashboard/settings',
                method: 'GET',
            }),
        }),
        // Update platform settings
        updatePlatformSettings: builder.mutation({
            query: (settings) => ({
                url: '/dashboard/settings',
                method: 'PUT',
                body: settings,
            }),
        }),
    }),
});
export const { useGetCustomerStatsQuery, useGetOwnerStatsQuery, useGetAdminStatsQuery, useGetRevenueDataQuery, useGetCarUtilizationQuery, useGetOwnerAnalyticsQuery, useGenerateReportQuery, useLazyGenerateReportQuery, useGetPlatformSettingsQuery, useUpdatePlatformSettingsMutation, } = dashboardApi;
export { dashboardApi };
export default dashboardApi;
