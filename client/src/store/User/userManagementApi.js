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
const userManagementApi = createApi({
    reducerPath: 'userManagementApi',
    baseQuery: async (args, api, extraOptions) => {
        const result = await baseQuery(args, api, extraOptions);
        if (result.error && result.error.status === 401) {
            localStorage.removeItem('token');
            setAuthToken(null);
        }
        return result;
    },
    tagTypes: ['User', 'UserList'],
    endpoints: (builder) => ({
        // Get paginated users list with filters
        getUsers: builder.query({
            query: (filters = {}) => {
                const params = new URLSearchParams();
                if (filters.search)
                    params.append('search', filters.search);
                if (filters.role && filters.role !== 'all')
                    params.append('role', filters.role);
                if (filters.status && filters.status !== 'all')
                    params.append('status', filters.status);
                if (filters.page)
                    params.append('page', filters.page.toString());
                if (filters.limit)
                    params.append('limit', filters.limit.toString());
                if (filters.sortBy)
                    params.append('sortBy', filters.sortBy);
                if (filters.sortOrder)
                    params.append('sortOrder', filters.sortOrder);
                return {
                    url: `/admin/users?${params.toString()}`,
                    method: 'GET',
                };
            },
            providesTags: ['UserList'],
        }),
        // Get single user by ID
        getUserById: builder.query({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: 'GET',
            }),
            providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
        }),
        // Update user
        updateUser: builder.mutation({
            query: ({ userId, data }) => ({
                url: `/admin/users/${userId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId },
                'UserList',
            ],
        }),
        // Delete user
        deleteUser: builder.mutation({
            query: (userId) => ({
                url: `/admin/users/${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, userId) => [
                { type: 'User', id: userId },
                'UserList',
            ],
        }),
        // Activate/Deactivate user
        toggleUserStatus: builder.mutation({
            query: ({ userId, isActive }) => ({
                url: `/admin/users/${userId}/status`,
                method: 'PATCH',
                body: { isActive },
            }),
            invalidatesTags: (result, error, { userId }) => [
                { type: 'User', id: userId },
                'UserList',
            ],
        }),
        // Bulk actions
        bulkUserAction: builder.mutation({
            query: (data) => ({
                url: '/admin/users/bulk',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['UserList'],
        }),
        // Get user statistics
        getUserStats: builder.query({
            query: () => ({
                url: '/admin/users/stats',
                method: 'GET',
            }),
            providesTags: ['UserList'],
        }),
        // Create new user
        createUser: builder.mutation({
            query: (data) => ({
                url: '/admin/users',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['UserList'],
        }),
    }),
});
export const { useGetUsersQuery, useGetUserByIdQuery, useUpdateUserMutation, useDeleteUserMutation, useToggleUserStatusMutation, useBulkUserActionMutation, useGetUserStatsQuery, useCreateUserMutation, useLazyGetUsersQuery, } = userManagementApi;
export { userManagementApi };
export default userManagementApi;
