import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import tokenStorage from '../../utils/tokenStorage';
import { API_BASE_URL } from '../../config/api';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  recipient: 'All' | 'Owner' | 'Customer';
  type: 'System' | 'Booking' | 'Payment' | 'Review';
  status: 'Read' | 'Unread';
  link?: string;
  createdAt: string;
  updatedAt: string;
}

interface AdminNotificationsState {
  notifications: AdminNotification[];
  filteredNotifications: AdminNotification[];
  selectedNotifications: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    search: string;
    type: string;
    recipient: string;
    status: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalCount: number;
  };
  unreadCount: number;
}

const initialState: AdminNotificationsState = {
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
export const fetchAdminNotifications = createAsyncThunk(
  'adminNotifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const sendNotification = createAsyncThunk(
  'adminNotifications/send',
  async (
    notificationData: {
      title: string;
      message: string;
      recipient: string;
      type: string;
      link?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/send`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'adminNotifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');
      return notificationId;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const markNotificationAsUnread = createAsyncThunk(
  'adminNotifications/markAsUnread',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/${notificationId}/unread`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to mark notification as unread');
      return notificationId;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'adminNotifications/delete',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to delete notification');
      return notificationId;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const bulkDeleteNotifications = createAsyncThunk(
  'adminNotifications/bulkDelete',
  async (notificationIds: string[], { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/bulk-delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (!response.ok) throw new Error('Failed to delete notifications');
      return notificationIds;
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'adminNotifications/clearAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/clear-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to clear all notifications');
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

const adminNotificationsSlice = createSlice({
  name: 'adminNotifications',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<AdminNotificationsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredNotifications = applyFilters(state.notifications, state.filters);
      state.pagination.totalPages = Math.ceil(
        state.filteredNotifications.length / state.pagination.itemsPerPage
      );
      state.pagination.currentPage = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.filteredNotifications = state.notifications;
      state.pagination.totalPages = Math.ceil(
        state.notifications.length / state.pagination.itemsPerPage
      );
    },
    toggleNotificationSelection(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.selectedNotifications.includes(id)) {
        state.selectedNotifications = state.selectedNotifications.filter((nId) => nId !== id);
      } else {
        state.selectedNotifications.push(id);
      }
    },
    selectAll(state) {
      const currentPageNotifications = getCurrentPageNotifications(
        state.filteredNotifications,
        state.pagination.currentPage,
        state.pagination.itemsPerPage
      );
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
        state.pagination.totalPages = Math.ceil(
          state.filteredNotifications.length / state.pagination.itemsPerPage
        );
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchAdminNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Send notification
      .addCase(sendNotification.fulfilled, (state, action) => {
        if (action.payload.notification) {
          state.notifications.unshift(action.payload.notification);
          state.filteredNotifications = applyFilters(state.notifications, state.filters);
          state.pagination.totalPages = Math.ceil(
            state.filteredNotifications.length / state.pagination.itemsPerPage
          );
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
        state.selectedNotifications = state.selectedNotifications.filter(
          (id) => id !== action.payload
        );
        state.pagination.totalPages = Math.ceil(
          state.filteredNotifications.length / state.pagination.itemsPerPage
        );
      })
      // Bulk delete
      .addCase(bulkDeleteNotifications.fulfilled, (state, action) => {
        const deletedIds = action.payload;
        const deletedUnreadCount = state.notifications.filter(
          (n) => deletedIds.includes(n.id) && n.status === 'Unread'
        ).length;
        state.unreadCount = Math.max(0, state.unreadCount - deletedUnreadCount);
        state.notifications = state.notifications.filter((n) => !deletedIds.includes(n.id));
        state.filteredNotifications = applyFilters(state.notifications, state.filters);
        state.selectedNotifications = [];
        state.pagination.totalPages = Math.ceil(
          state.filteredNotifications.length / state.pagination.itemsPerPage
        );
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
const applyFilters = (
  notifications: AdminNotification[],
  filters: AdminNotificationsState['filters']
) => {
  return notifications.filter((notification) => {
    const matchesSearch =
      !filters.search ||
      notification.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      notification.message.toLowerCase().includes(filters.search.toLowerCase());

    const matchesType = filters.type === 'all' || notification.type === filters.type;

    const matchesRecipient =
      filters.recipient === 'all' || notification.recipient === filters.recipient;

    const matchesStatus = filters.status === 'all' || notification.status === filters.status;

    return matchesSearch && matchesType && matchesRecipient && matchesStatus;
  });
};

const getCurrentPageNotifications = (
  notifications: AdminNotification[],
  currentPage: number,
  itemsPerPage: number
) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return notifications.slice(startIndex, endIndex);
};

export const {
  setFilter,
  setPage,
  clearFilters,
  toggleNotificationSelection,
  selectAll,
  clearSelection,
} = adminNotificationsSlice.actions;

// Selectors
export const selectNotifications = (state: RootState) =>
  state.adminNotifications.notifications;
export const selectFilteredNotifications = (state: RootState) =>
  state.adminNotifications.filteredNotifications;
export const selectNotificationStatus = (state: RootState) => state.adminNotifications.status;
export const selectNotificationError = (state: RootState) => state.adminNotifications.error;
export const selectNotificationFilters = (state: RootState) => state.adminNotifications.filters;
export const selectNotificationPagination = (state: RootState) =>
  state.adminNotifications.pagination;
export const selectSelectedNotifications = (state: RootState) =>
  state.adminNotifications.selectedNotifications;
export const selectUnreadCount = (state: RootState) => state.adminNotifications.unreadCount;

export const selectCurrentPageNotifications = (state: RootState) => {
  const { filteredNotifications, pagination } = state.adminNotifications;
  return getCurrentPageNotifications(
    filteredNotifications,
    pagination.currentPage,
    pagination.itemsPerPage
  );
};

export default adminNotificationsSlice.reducer;
