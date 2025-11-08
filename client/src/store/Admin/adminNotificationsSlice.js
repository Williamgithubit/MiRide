import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tokenStorage from '../../utils/tokenStorage';
const initialState = {
    notifications: [],
    filteredNotifications: [],
    selectedNotifications: [],
    status: 'idle',
    error: null,
    filters: {
        search: '',
        type: 'all',
        recipient: 'all',
        status: 'all',
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        itemsPerPage: 10,
        totalCount: 0,
    },
    unreadCount: 0,
};
// Async thunks
export const fetchAdminNotifications = createAsyncThunk('adminNotifications/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch notifications');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const sendNotification = createAsyncThunk('adminNotifications/send', async (notificationData, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/notifications/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationData),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to send notification');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const markNotificationAsRead = createAsyncThunk('adminNotifications/markAsRead', async (notificationId, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch(`/api/admin/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok)
            throw new Error('Failed to mark notification as read');
        return notificationId;
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const markNotificationAsUnread = createAsyncThunk('adminNotifications/markAsUnread', async (notificationId, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch(`/api/admin/notifications/${notificationId}/unread`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok)
            throw new Error('Failed to mark notification as unread');
        return notificationId;
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const deleteNotification = createAsyncThunk('adminNotifications/delete', async (notificationId, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch(`/api/admin/notifications/${notificationId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok)
            throw new Error('Failed to delete notification');
        return notificationId;
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const bulkDeleteNotifications = createAsyncThunk('adminNotifications/bulkDelete', async (notificationIds, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/notifications/bulk-delete', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationIds }),
        });
        if (!response.ok)
            throw new Error('Failed to delete notifications');
        return notificationIds;
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const clearAllNotifications = createAsyncThunk('adminNotifications/clearAll', async (_, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/notifications/clear-all', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok)
            throw new Error('Failed to clear all notifications');
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
const adminNotificationsSlice = createSlice({
    name: 'adminNotifications',
    initialState,
    reducers: {
        setFilter(state, action) {
            state.filters = { ...state.filters, ...action.payload };
            state.filteredNotifications = applyFilters(state.notifications, state.filters);
            state.pagination.totalPages = Math.ceil(state.filteredNotifications.length / state.pagination.itemsPerPage);
            state.pagination.currentPage = 1;
        },
        setPage(state, action) {
            state.pagination.currentPage = action.payload;
        },
        clearFilters(state) {
            state.filters = initialState.filters;
            state.filteredNotifications = state.notifications;
            state.pagination.totalPages = Math.ceil(state.notifications.length / state.pagination.itemsPerPage);
        },
        toggleNotificationSelection(state, action) {
            const id = action.payload;
            if (state.selectedNotifications.includes(id)) {
                state.selectedNotifications = state.selectedNotifications.filter((nId) => nId !== id);
            }
            else {
                state.selectedNotifications.push(id);
            }
        },
        selectAll(state) {
            const currentPageNotifications = getCurrentPageNotifications(state.filteredNotifications, state.pagination.currentPage, state.pagination.itemsPerPage);
            state.selectedNotifications = currentPageNotifications.map((n) => n.id);
        },
        clearSelection(state) {
            state.selectedNotifications = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notifications
            .addCase(fetchAdminNotifications.pending, (state) => {
            state.status = 'loading';
        })
            .addCase(fetchAdminNotifications.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.notifications = action.payload.notifications || [];
            state.filteredNotifications = applyFilters(state.notifications, state.filters);
            state.pagination.totalCount = action.payload.totalCount || state.notifications.length;
            state.pagination.totalPages = Math.ceil(state.filteredNotifications.length / state.pagination.itemsPerPage);
            state.unreadCount = action.payload.unreadCount || 0;
        })
            .addCase(fetchAdminNotifications.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
            // Send notification
            .addCase(sendNotification.fulfilled, (state, action) => {
            if (action.payload.notification) {
                state.notifications.unshift(action.payload.notification);
                state.filteredNotifications = applyFilters(state.notifications, state.filters);
                state.pagination.totalPages = Math.ceil(state.filteredNotifications.length / state.pagination.itemsPerPage);
            }
        })
            // Mark as read
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification && notification.status === 'Unread') {
                notification.status = 'Read';
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.filteredNotifications = applyFilters(state.notifications, state.filters);
        })
            // Mark as unread
            .addCase(markNotificationAsUnread.fulfilled, (state, action) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification && notification.status === 'Read') {
                notification.status = 'Unread';
                state.unreadCount += 1;
            }
            state.filteredNotifications = applyFilters(state.notifications, state.filters);
        })
            // Delete notification
            .addCase(deleteNotification.fulfilled, (state, action) => {
            const notification = state.notifications.find((n) => n.id === action.payload);
            if (notification && notification.status === 'Unread') {
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
            state.notifications = state.notifications.filter((n) => n.id !== action.payload);
            state.filteredNotifications = applyFilters(state.notifications, state.filters);
            state.selectedNotifications = state.selectedNotifications.filter((id) => id !== action.payload);
            state.pagination.totalPages = Math.ceil(state.filteredNotifications.length / state.pagination.itemsPerPage);
        })
            // Bulk delete
            .addCase(bulkDeleteNotifications.fulfilled, (state, action) => {
            const deletedIds = action.payload;
            const deletedUnreadCount = state.notifications.filter((n) => deletedIds.includes(n.id) && n.status === 'Unread').length;
            state.unreadCount = Math.max(0, state.unreadCount - deletedUnreadCount);
            state.notifications = state.notifications.filter((n) => !deletedIds.includes(n.id));
            state.filteredNotifications = applyFilters(state.notifications, state.filters);
            state.selectedNotifications = [];
            state.pagination.totalPages = Math.ceil(state.filteredNotifications.length / state.pagination.itemsPerPage);
        })
            // Clear all
            .addCase(clearAllNotifications.fulfilled, (state) => {
            state.notifications = [];
            state.filteredNotifications = [];
            state.selectedNotifications = [];
            state.unreadCount = 0;
            state.pagination.totalPages = 1;
            state.pagination.currentPage = 1;
        });
    },
});
// Helper functions
const applyFilters = (notifications, filters) => {
    return notifications.filter((notification) => {
        const matchesSearch = !filters.search ||
            notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            notification.message.toLowerCase().includes(filters.search.toLowerCase());
        const matchesType = filters.type === 'all' || notification.type === filters.type;
        const matchesRecipient = filters.recipient === 'all' || notification.recipient === filters.recipient;
        const matchesStatus = filters.status === 'all' || notification.status === filters.status;
        return matchesSearch && matchesType && matchesRecipient && matchesStatus;
    });
};
const getCurrentPageNotifications = (notifications, currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return notifications.slice(startIndex, endIndex);
};
export const { setFilter, setPage, clearFilters, toggleNotificationSelection, selectAll, clearSelection, } = adminNotificationsSlice.actions;
// Selectors
export const selectNotifications = (state) => state.adminNotifications.notifications;
export const selectFilteredNotifications = (state) => state.adminNotifications.filteredNotifications;
export const selectNotificationStatus = (state) => state.adminNotifications.status;
export const selectNotificationError = (state) => state.adminNotifications.error;
export const selectNotificationFilters = (state) => state.adminNotifications.filters;
export const selectNotificationPagination = (state) => state.adminNotifications.pagination;
export const selectSelectedNotifications = (state) => state.adminNotifications.selectedNotifications;
export const selectUnreadCount = (state) => state.adminNotifications.unreadCount;
export const selectCurrentPageNotifications = (state) => {
    const { filteredNotifications, pagination } = state.adminNotifications;
    return getCurrentPageNotifications(filteredNotifications, pagination.currentPage, pagination.itemsPerPage);
};
export default adminNotificationsSlice.reducer;
