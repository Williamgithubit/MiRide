import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { setAuthToken } from '../Auth/authUtils';

// Dashboard API types
export interface DashboardStats {
  totalRentals: number;
  activeRentals: number;
  totalRevenue: number;
  popularCars: Array<{
    carId: number;
    name: string;
    model: string;
    rentCount: number;
  }>;
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface OwnerStats {
  totalCars: number;
  totalBookings: number;
  totalEarnings: number;
  activeBookings: number;
  earningsByMonth: RevenueData[];
}

export interface AdminStats {
  totalUsers: number;
  totalCars: number;
  totalBookings: number;
  totalRevenue: number;
  revenueByMonth: RevenueData[];
  usersByRole: { [key: string]: number };
  carsByStatus: { [key: string]: number };
}

export interface RevenueData {
  period: string;
  revenue: number;
  bookings: number;
}

export interface RevenueResponse {
  period: string;
  format: string;
  data: RevenueData[];
}

// Create base query with auth
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
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
    // Get owner dashboard stats
    getOwnerStats: builder.query<OwnerStats, number | void>({
      query: (ownerId) => ({
        url: '/dashboard/owner-stats',
        method: 'GET',
      }),
      providesTags: ['OwnerStats'],
    }),

    // Get admin dashboard stats
    getAdminStats: builder.query<AdminStats, void>({
      query: () => ({
        url: '/dashboard/stats/admin',
        method: 'GET',
      }),
      providesTags: ['AdminStats'],
    }),

    // Get revenue data
    getRevenueData: builder.query<RevenueResponse, string>({
      query: (period = 'month') => ({
        url: `/dashboard/revenue-data?period=${period}`,
        method: 'GET',
      }),
      providesTags: ['Revenue'],
    }),

    // Get car utilization data
    getCarUtilization: builder.query<any, void>({
      query: () => ({
        url: '/dashboard/cars/utilization',
        method: 'GET',
      }),
      providesTags: ['DashboardStats'],
    }),

    // Generate reports
    generateReport: builder.query<any, { reportType: string; startDate?: string; endDate?: string }>({
      query: ({ reportType, startDate, endDate }) => {
        const params = new URLSearchParams({ reportType });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        return {
          url: `/dashboard/reports/generate?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

    // Get platform settings
    getPlatformSettings: builder.query<any, void>({
      query: () => ({
        url: '/dashboard/settings',
        method: 'GET',
      }),
    }),

    // Update platform settings
    updatePlatformSettings: builder.mutation<any, any>({
      query: (settings) => ({
        url: '/dashboard/settings',
        method: 'PUT',
        body: settings,
      }),
    }),
  }),
});

export const {
  useGetOwnerStatsQuery,
  useGetAdminStatsQuery,
  useGetRevenueDataQuery,
  useGetCarUtilizationQuery,
  useGenerateReportQuery,
  useGetPlatformSettingsQuery,
  useUpdatePlatformSettingsMutation,
} = dashboardApi;

export { dashboardApi };
export default dashboardApi;
