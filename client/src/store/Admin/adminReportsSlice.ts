import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import tokenStorage from '../../utils/tokenStorage';
import { API_BASE_URL } from '../../config/api';

// Types
export interface UserReportData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newRegistrations: number;
  usersByRole: { role: string; count: number }[];
  registrationTrend: { date: string; count: number }[];
}

export interface CarReportData {
  totalCars: number;
  availableCars: number;
  rentedCars: number;
  maintenanceCars: number;
  carsByCategory: { category: string; count: number }[];
  carsByStatus: { status: string; count: number }[];
}

export interface BookingReportData {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  dailyTrend: { date: string; count: number }[];
  weeklyTrend: { week: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
}

export interface RevenueReportData {
  totalRevenue: number;
  totalPayouts: number;
  totalCommissions: number;
  pendingPayouts: number;
  revenueByMonth: { month: string; revenue: number; payouts: number; commissions: number }[];
  revenueByCategory: { category: string; revenue: number }[];
}

export interface ActivityLogData {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  userType?: string;
  carCategory?: string;
  bookingStatus?: string;
  searchQuery?: string;
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: 'users' | 'cars' | 'bookings' | 'revenue' | 'activity';
  generatedAt: string;
  filters: ReportFilters;
  fileUrl?: string;
}

interface AdminReportsState {
  userReport: UserReportData | null;
  carReport: CarReportData | null;
  bookingReport: BookingReportData | null;
  revenueReport: RevenueReportData | null;
  activityLogs: ActivityLogData[];
  generatedReports: GeneratedReport[];
  filters: ReportFilters;
  activeTab: 'users' | 'cars' | 'bookings' | 'revenue' | 'activity';
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  exportStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AdminReportsState = {
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
export const fetchUserReport = createAsyncThunk(
  'adminReports/fetchUserReport',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/users?${queryParams}`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const fetchCarReport = createAsyncThunk(
  'adminReports/fetchCarReport',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/cars?${queryParams}`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const fetchBookingReport = createAsyncThunk(
  'adminReports/fetchBookingReport',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/bookings?${queryParams}`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const fetchRevenueReport = createAsyncThunk(
  'adminReports/fetchRevenueReport',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/revenue?${queryParams}`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const fetchActivityLogs = createAsyncThunk(
  'adminReports/fetchActivityLogs',
  async (filters: ReportFilters, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${API_BASE_URL}/api/admin/reports/activity?${queryParams}`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const fetchGeneratedReports = createAsyncThunk(
  'adminReports/fetchGeneratedReports',
  async (_, { rejectWithValue }) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reports/generated`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

export const exportReport = createAsyncThunk(
  'adminReports/exportReport',
  async (
    { reportType, format, filters }: { reportType: string; format: 'csv' | 'pdf'; filters: ReportFilters },
    { rejectWithValue }
  ) => {
    try {
      const token = tokenStorage.getToken();
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reports/export`, {
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
    } catch (error) {
      return rejectWithValue((error as Error).message || 'An error occurred');
    }
  }
);

const adminReportsSlice = createSlice({
  name: 'adminReports',
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<AdminReportsState['activeTab']>) {
      state.activeTab = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<ReportFilters>>) {
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
        state.error = action.payload as string;
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
export const selectUserReport = (state: RootState) => state.adminReports?.userReport;
export const selectCarReport = (state: RootState) => state.adminReports?.carReport;
export const selectBookingReport = (state: RootState) => state.adminReports?.bookingReport;
export const selectRevenueReport = (state: RootState) => state.adminReports?.revenueReport;
export const selectActivityLogs = (state: RootState) => state.adminReports?.activityLogs || [];
export const selectGeneratedReports = (state: RootState) => state.adminReports?.generatedReports || [];
export const selectReportFilters = (state: RootState) => state.adminReports?.filters;
export const selectActiveTab = (state: RootState) => state.adminReports?.activeTab;
export const selectReportStatus = (state: RootState) => state.adminReports?.status;
export const selectReportError = (state: RootState) => state.adminReports?.error;
export const selectExportStatus = (state: RootState) => state.adminReports?.exportStatus;

export default adminReportsSlice.reducer;
