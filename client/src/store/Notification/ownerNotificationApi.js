import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
export const ownerNotificationApi = createApi({
    reducerPath: 'ownerNotificationApi',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/notifications/owner',
        prepareHeaders: (headers, { getState }) => {
            const token = getState().auth.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['OwnerNotification'],
    endpoints: (builder) => ({
        getOwnerNotifications: builder.query({
            query: ({ type = 'all', status = 'all', priority = 'all', limit = 10, offset = 0, search = '' } = {}) => ({
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
        getOwnerUnreadCount: builder.query({
            query: () => '/unread-count',
            providesTags: ['OwnerNotification'],
        }),
        markOwnerNotificationAsRead: builder.mutation({
            query: (id) => ({
                url: `/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['OwnerNotification'],
        }),
        markOwnerNotificationAsUnread: builder.mutation({
            query: (id) => ({
                url: `/${id}/unread`,
                method: 'PUT',
            }),
            invalidatesTags: ['OwnerNotification'],
        }),
        markAllOwnerNotificationsAsRead: builder.mutation({
            query: () => ({
                url: '/mark-all-read',
                method: 'PUT',
            }),
            invalidatesTags: ['OwnerNotification'],
        }),
        deleteOwnerNotification: builder.mutation({
            query: (id) => ({
                url: `/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['OwnerNotification'],
        }),
        clearAllOwnerNotifications: builder.mutation({
            query: () => ({
                url: '/clear-all',
                method: 'DELETE',
            }),
            invalidatesTags: ['OwnerNotification'],
        }),
    }),
});
export const { useGetOwnerNotificationsQuery, useGetOwnerUnreadCountQuery, useMarkOwnerNotificationAsReadMutation, useMarkOwnerNotificationAsUnreadMutation, useMarkAllOwnerNotificationsAsReadMutation, useDeleteOwnerNotificationMutation, useClearAllOwnerNotificationsMutation, } = ownerNotificationApi;
