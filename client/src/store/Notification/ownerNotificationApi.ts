import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { API_BASE_URL } from '../../config/api';

export interface OwnerNotification {
  id: number;
  userId: string;
  type: 'booking_request' | 'payment_received' | 'booking_approved' | 'booking_cancelled' | 'customer_review' | 'system_alert' | 'maintenance_reminder';
  title: string;
  message: string;
  relatedItem?: {
    type: 'car' | 'booking' | 'customer';
    id: string;
    name: string;
    details?: any;
  };
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface OwnerNotificationResponse {
  notifications: OwnerNotification[];
  total: number;
  unreadCount?: number;
}

export interface NotificationFilters {
  type?: 'all' | 'booking_request' | 'payment_received' | 'booking_approved' | 'booking_cancelled' | 'customer_review' | 'system_alert' | 'maintenance_reminder';
  status?: 'all' | 'read' | 'unread';
  priority?: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  limit?: number;
  offset?: number;
  search?: string;
}

export const ownerNotificationApi = createApi({
  reducerPath: 'ownerNotificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/notifications/owner`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['OwnerNotification'],
  endpoints: (builder) => ({
    getOwnerNotifications: builder.query<OwnerNotificationResponse, NotificationFilters>({
      query: ({ 
        type = 'all', 
        status = 'all', 
        priority = 'all', 
        limit = 10, 
        offset = 0, 
        search = '' 
      } = {}) => ({
        url: '',
        params: { 
          type: type !== 'all' ? type : undefined,
          status: status !== 'all' ? status : undefined,
          priority: priority !== 'all' ? priority : undefined,
          limit, 
          offset,
          search: search || undefined
        }
      }),
      providesTags: ['OwnerNotification'],
    }),
    getOwnerUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/unread-count',
      providesTags: ['OwnerNotification'],
    }),
    markOwnerNotificationAsRead: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['OwnerNotification'],
    }),
    markOwnerNotificationAsUnread: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}/unread`,
        method: 'PUT',
      }),
      invalidatesTags: ['OwnerNotification'],
    }),
    markAllOwnerNotificationsAsRead: builder.mutation<{ message: string; updatedCount: number }, void>({
      query: () => ({
        url: '/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['OwnerNotification'],
    }),
    deleteOwnerNotification: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['OwnerNotification'],
    }),
    clearAllOwnerNotifications: builder.mutation<{ message: string; deletedCount: number }, void>({
      query: () => ({
        url: '/clear-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['OwnerNotification'],
    }),
  }),
});

export const {
  useGetOwnerNotificationsQuery,
  useGetOwnerUnreadCountQuery,
  useMarkOwnerNotificationAsReadMutation,
  useMarkOwnerNotificationAsUnreadMutation,
  useMarkAllOwnerNotificationsAsReadMutation,
  useDeleteOwnerNotificationMutation,
  useClearAllOwnerNotificationsMutation,
} = ownerNotificationApi;
