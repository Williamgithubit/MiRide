import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const notificationApi = createApi({
    reducerPath: 'notificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/notifications',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Notification'],
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: ({ limit = 20, offset = 0, unreadOnly = false } = {}) => ({
                url: '',
                params: { limit, offset, unreadOnly }
            }),
            providesTags: ['Notification'],
        }),
        getUnreadCount: builder.query({
            query: () => '/unread-count',
            providesTags: ['Notification'],
        }),
        markAsRead: builder.mutation({
            query: (id) => ({
                url: `/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        markAllAsRead: builder.mutation({
            query: () => ({
                url: '/mark-all-read',
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),
        deleteNotification: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
        clearAllNotifications: builder.mutation({
            query: () => ({
                url: '/clear-all',
                method: 'DELETE',
            }),
            invalidatesTags: ['Notification'],
        }),
    }),
});
export const { useGetNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useMarkAllAsReadMutation, useDeleteNotificationMutation, useClearAllNotificationsMutation, } = notificationApi;
