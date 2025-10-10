import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export interface Notification {
  id: number;
  userId: string;
  type: 'booking_approved' | 'booking_rejected' | 'booking_cancelled' | 'payment_successful' | 'payment_failed' | 'rental_started' | 'rental_completed' | 'system_alert' | 'maintenance_reminder';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unreadCount?: number;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/notifications',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Notification'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationResponse, { limit?: number; offset?: number; unreadOnly?: boolean }>({
      query: ({ limit = 20, offset = 0, unreadOnly = false } = {}) => ({
        url: '',
        params: { limit, offset, unreadOnly }
      }),
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<{ unreadCount: number }, void>({
      query: () => '/unread-count',
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<{ message: string; updatedCount: number }, void>({
      query: () => ({
        url: '/mark-all-read',
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotification: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    clearAllNotifications: builder.mutation<{ message: string; deletedCount: number }, void>({
      query: () => ({
        url: '/clear-all',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
  useClearAllNotificationsMutation,
} = notificationApi;
