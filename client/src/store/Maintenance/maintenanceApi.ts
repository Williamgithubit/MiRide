import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';
import { setAuthToken } from '../Auth/authUtils';

// Maintenance API types
export interface CarMaintenanceRecord {
  id: number;
  carId: number;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  scheduledDate: string | null;
  completedDate: string | null;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  serviceProvider: string | null;
  notes: string | null;
  mileage: number | null;
  nextServiceDue: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  car: {
    id: number;
    name: string;
    model: string;
    brand: string;
    year: number;
    imageUrl: string;
  };
}

export interface CreateMaintenanceRecord {
  carId: number;
  type: 'routine' | 'repair' | 'inspection' | 'emergency';
  description: string;
  cost: number;
  scheduledDate?: string;
  serviceProvider?: string;
  notes?: string;
  mileage?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateMaintenanceRecord extends Partial<CreateMaintenanceRecord> {
  id: number;
  status?: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  completedDate?: string;
  nextServiceDue?: string;
}

// Create base query with auth and timeout
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api`,
  timeout: 15000, // 15 second timeout
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token || localStorage.getItem('token');
    
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
    getAllMaintenance: builder.query<CarMaintenanceRecord[], void>({
      query: () => ({
        url: '/maintenance',
        method: 'GET',
      }),
      providesTags: ['Maintenance'],
    }),

    // Get maintenance records by car
    getMaintenanceByCar: builder.query<CarMaintenanceRecord[], number>({
      query: (carId) => ({
        url: `/maintenance/car/${carId}`,
        method: 'GET',
      }),
      providesTags: (result, error, carId) => [
        { type: 'Maintenance', id: `car-${carId}` },
      ],
    }),

    // Get maintenance records by owner
    getMaintenanceByOwner: builder.query<CarMaintenanceRecord[], void>({
      query: () => ({
        url: '/maintenance/owner',
        method: 'GET',
      }),
      providesTags: ['Maintenance'],
      keepUnusedDataFor: 0,
    }),

    // Create maintenance record
    createMaintenance: builder.mutation<CarMaintenanceRecord, CreateMaintenanceRecord>({
      query: (record) => ({
        url: '/maintenance',
        method: 'POST',
        body: record,
      }),
      invalidatesTags: ['Maintenance', 'MaintenanceStats'],
    }),

    // Update maintenance record
    updateMaintenance: builder.mutation<CarMaintenanceRecord, UpdateMaintenanceRecord>({
      query: ({ id, ...record }) => ({
        url: `/maintenance/${id}`,
        method: 'PUT',
        body: record,
      }),
      invalidatesTags: ['Maintenance', 'MaintenanceStats'],
    }),

    // Delete maintenance record
    deleteMaintenance: builder.mutation<void, number>({
      query: (id) => ({
        url: `/maintenance/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Maintenance', 'MaintenanceStats'],
    }),

    // Get maintenance statistics
    getMaintenanceStats: builder.query<any, void>({
      query: () => ({
        url: '/maintenance/stats',
        method: 'GET',
      }),
      providesTags: ['MaintenanceStats'],
    }),
  }),
});

export const {
  useGetAllMaintenanceQuery,
  useGetMaintenanceByCarQuery,
  useGetMaintenanceByOwnerQuery,
  useCreateMaintenanceMutation,
  useUpdateMaintenanceMutation,
  useDeleteMaintenanceMutation,
  useGetMaintenanceStatsQuery,
} = maintenanceApi;
