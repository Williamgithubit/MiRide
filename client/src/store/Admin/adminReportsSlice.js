import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tokenStorage from '../../utils/tokenStorage';
const initialState = {
    userReport: null,
    carReport: null,
    bookingReport: null,
    revenueReport: null,
    activityLogs: [],
    generatedReports: [],
    filters: {
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    },
    activeTab: 'users',
    status: 'idle',
    error: null,
    exportStatus: 'idle',
};
// Async thunks
export const fetchUserReport = createAsyncThunk('adminReports/fetchUserReport', async (filters, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/admin/reports/users?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch user report');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const fetchCarReport = createAsyncThunk('adminReports/fetchCarReport', async (filters, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/admin/reports/cars?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch car report');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const fetchBookingReport = createAsyncThunk('adminReports/fetchBookingReport', async (filters, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/admin/reports/bookings?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch booking report');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const fetchRevenueReport = createAsyncThunk('adminReports/fetchRevenueReport', async (filters, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/admin/reports/revenue?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch revenue report');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const fetchActivityLogs = createAsyncThunk('adminReports/fetchActivityLogs', async (filters, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`/api/admin/reports/activity?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch activity logs');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const fetchGeneratedReports = createAsyncThunk('adminReports/fetchGeneratedReports', async (_, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/reports/generated', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch generated reports');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const exportReport = createAsyncThunk('adminReports/exportReport', async ({ reportType, format, filters }, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/reports/export', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reportType, format, filters }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to export report');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return { success: true };
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
const adminReportsSlice = createSlice({
    name: 'adminReports',
    initialState,
    reducers: {
        setActiveTab(state, action) {
            state.activeTab = action.payload;
        },
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters(state) {
            state.filters = initialState.filters;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // User Report
            .addCase(fetchUserReport.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
            .addCase(fetchUserReport.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.userReport = action.payload;
        })
            .addCase(fetchUserReport.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
            // Car Report
            .addCase(fetchCarReport.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
            .addCase(fetchCarReport.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.carReport = action.payload;
        })
            .addCase(fetchCarReport.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
            // Booking Report
            .addCase(fetchBookingReport.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
            .addCase(fetchBookingReport.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.bookingReport = action.payload;
        })
            .addCase(fetchBookingReport.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
            // Revenue Report
            .addCase(fetchRevenueReport.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
            .addCase(fetchRevenueReport.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.revenueReport = action.payload;
        })
            .addCase(fetchRevenueReport.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
            // Activity Logs
            .addCase(fetchActivityLogs.pending, (state) => {
            state.status = 'loading';
            state.error = null;
        })
            .addCase(fetchActivityLogs.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.activityLogs = action.payload.logs || [];
        })
            .addCase(fetchActivityLogs.rejected, (state, action) => {
            state.status = 'failed';
            state.error = action.payload;
        })
            // Generated Reports
            .addCase(fetchGeneratedReports.fulfilled, (state, action) => {
            state.generatedReports = action.payload.reports || [];
        })
            // Export Report
            .addCase(exportReport.pending, (state) => {
            state.exportStatus = 'loading';
        })
            .addCase(exportReport.fulfilled, (state) => {
            state.exportStatus = 'succeeded';
        })
            .addCase(exportReport.rejected, (state) => {
            state.exportStatus = 'failed';
        });
    },
});
export const { setActiveTab, setFilters, resetFilters, clearError } = adminReportsSlice.actions;
// Selectors
export const selectUserReport = (state) => state.adminReports?.userReport;
export const selectCarReport = (state) => state.adminReports?.carReport;
export const selectBookingReport = (state) => state.adminReports?.bookingReport;
export const selectRevenueReport = (state) => state.adminReports?.revenueReport;
export const selectActivityLogs = (state) => state.adminReports?.activityLogs || [];
export const selectGeneratedReports = (state) => state.adminReports?.generatedReports || [];
export const selectReportFilters = (state) => state.adminReports?.filters;
export const selectActiveTab = (state) => state.adminReports?.activeTab;
export const selectReportStatus = (state) => state.adminReports?.status;
export const selectReportError = (state) => state.adminReports?.error;
export const selectExportStatus = (state) => state.adminReports?.exportStatus;
export default adminReportsSlice.reducer;
