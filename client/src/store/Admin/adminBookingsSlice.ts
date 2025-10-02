import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

export interface Booking {
  id: string;
  car: {
    id: string;
    name: string;
    model: string;
    imageUrl: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
  };
  owner: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  totalCost: number;
  paymentStatus: 'Paid' | 'Pending' | 'Failed';
  bookingStatus: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
}

interface BookingsState {
  bookings: Booking[];
  filteredBookings: Booking[];
  selectedBooking: Booking | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filters: {
    search: string;
    status: string;
    startDate: string | null;
    endDate: string | null;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
  };
}

const initialState: BookingsState = {
  bookings: [],
  filteredBookings: [],
  selectedBooking: null,
  status: 'idle',
  error: null,
  filters: {
    search: '',
    status: '',
    startDate: null,
    endDate: null,
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    itemsPerPage: 10,
  },
};

// Async thunks
export const fetchBookings = createAsyncThunk(
  'adminBookings/fetchBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  'adminBookings/updateStatus',
  async ({ bookingId, status }: { bookingId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update booking status');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const adminBookingsSlice = createSlice({
  name: 'adminBookings',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<Partial<BookingsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredBookings = applyFilters(state.bookings, state.filters);
    },
    setPage(state, action: PayloadAction<number>) {
      state.pagination.currentPage = action.payload;
    },
    setSelectedBooking(state, action: PayloadAction<Booking | null>) {
      state.selectedBooking = action.payload;
    },
    clearFilters(state) {
      state.filters = initialState.filters;
      state.filteredBookings = state.bookings;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookings = action.payload;
        state.filteredBookings = applyFilters(action.payload, state.filters);
        state.pagination.totalPages = Math.ceil(state.filteredBookings.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const updatedBooking = action.payload;
        const index = state.bookings.findIndex((booking) => booking.id === updatedBooking.id);
        if (index !== -1) {
          state.bookings[index] = updatedBooking;
          state.filteredBookings = applyFilters(state.bookings, state.filters);
        }
      });
  },
});

// Helper function to apply filters
const applyFilters = (bookings: Booking[], filters: BookingsState['filters']) => {
  return bookings.filter((booking) => {
    const matchesSearch =
      !filters.search ||
      booking.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.owner.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      booking.car.name.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || booking.bookingStatus === filters.status;

    const matchesDateRange =
      !filters.startDate ||
      !filters.endDate ||
      (new Date(booking.startDate) >= new Date(filters.startDate) &&
        new Date(booking.endDate) <= new Date(filters.endDate));

    return matchesSearch && matchesStatus && matchesDateRange;
  });
};

export const { setFilter, setPage, setSelectedBooking, clearFilters } = adminBookingsSlice.actions;

// Selectors
export const selectAllBookings = (state: RootState) => state.adminBookings.bookings;
export const selectFilteredBookings = (state: RootState) => state.adminBookings.filteredBookings;
export const selectBookingStatus = (state: RootState) => state.adminBookings.status;
export const selectBookingError = (state: RootState) => state.adminBookings.error;
export const selectBookingFilters = (state: RootState) => state.adminBookings.filters;
export const selectPagination = (state: RootState) => state.adminBookings.pagination;
export const selectSelectedBooking = (state: RootState) => state.adminBookings.selectedBooking;

export default adminBookingsSlice.reducer;