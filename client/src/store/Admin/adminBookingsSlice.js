import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tokenStorage from '../../utils/tokenStorage';
const initialState = {
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
export const fetchBookings = createAsyncThunk('adminBookings/fetchBookings', async (_, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch('/api/admin/bookings', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch bookings');
        }
        const data = await response.json();
        // Backend returns { bookings: [...], totalCount, ... }
        return data.bookings || data;
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
export const updateBookingStatus = createAsyncThunk('adminBookings/updateStatus', async ({ bookingId, status }, { rejectWithValue }) => {
    try {
        const token = tokenStorage.getToken();
        if (!token) {
            return rejectWithValue('No authentication token found');
        }
        const response = await fetch(`/api/admin/bookings/${bookingId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });
        if (!response.ok)
            throw new Error('Failed to update booking status');
        return await response.json();
    }
    catch (error) {
        return rejectWithValue(error.message || 'An error occurred');
    }
});
const adminBookingsSlice = createSlice({
    name: 'adminBookings',
    initialState,
    reducers: {
        setFilter(state, action) {
            state.filters = { ...state.filters, ...action.payload };
            state.filteredBookings = applyFilters(state.bookings, state.filters);
        },
        setPage(state, action) {
            state.pagination.currentPage = action.payload;
        },
        setSelectedBooking(state, action) {
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
            state.error = action.payload;
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
const applyFilters = (bookings, filters) => {
    return bookings.filter((booking) => {
        const matchesSearch = !filters.search ||
            booking.customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            booking.owner.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            booking.car.name.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = !filters.status || booking.bookingStatus === filters.status;
        const matchesDateRange = !filters.startDate ||
            !filters.endDate ||
            (new Date(booking.startDate) >= new Date(filters.startDate) &&
                new Date(booking.endDate) <= new Date(filters.endDate));
        return matchesSearch && matchesStatus && matchesDateRange;
    });
};
export const { setFilter, setPage, setSelectedBooking, clearFilters } = adminBookingsSlice.actions;
// Selectors
export const selectAllBookings = (state) => state.adminBookings.bookings;
export const selectFilteredBookings = (state) => state.adminBookings.filteredBookings;
export const selectBookingStatus = (state) => state.adminBookings.status;
export const selectBookingError = (state) => state.adminBookings.error;
export const selectBookingFilters = (state) => state.adminBookings.filters;
export const selectPagination = (state) => state.adminBookings.pagination;
export const selectSelectedBooking = (state) => state.adminBookings.selectedBooking;
export default adminBookingsSlice.reducer;
