import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    currentBookings: [],
    pastBookings: [],
    activeBooking: null,
    selectedBooking: null,
    loading: false,
    error: null,
    lastUpdated: null,
    statusFilter: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    realTimeEnabled: true,
    updateInterval: 30000, // 30 seconds
};
const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        // Loading states
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        // Booking data management
        setCurrentBookings: (state, action) => {
            state.currentBookings = action.payload;
            state.lastUpdated = new Date().toISOString();
        },
        setPastBookings: (state, action) => {
            state.pastBookings = action.payload;
        },
        setActiveBooking: (state, action) => {
            state.activeBooking = action.payload;
        },
        setSelectedBooking: (state, action) => {
            state.selectedBooking = action.payload;
        },
        // Update individual booking
        updateBookingStatus: (state, action) => {
            const { id, status, paymentStatus } = action.payload;
            // Update in current bookings
            const currentIndex = state.currentBookings.findIndex(booking => booking.id === id);
            if (currentIndex !== -1) {
                state.currentBookings[currentIndex].status = status;
                if (paymentStatus) {
                    state.currentBookings[currentIndex].paymentStatus = paymentStatus;
                }
                state.currentBookings[currentIndex].updatedAt = new Date().toISOString();
            }
            // Update in past bookings
            const pastIndex = state.pastBookings.findIndex(booking => booking.id === id);
            if (pastIndex !== -1) {
                state.pastBookings[pastIndex].status = status;
                if (paymentStatus) {
                    state.pastBookings[pastIndex].paymentStatus = paymentStatus;
                }
                state.pastBookings[pastIndex].updatedAt = new Date().toISOString();
            }
            // Update active booking if it matches
            if (state.activeBooking && state.activeBooking.id === id) {
                state.activeBooking.status = status;
                if (paymentStatus) {
                    state.activeBooking.paymentStatus = paymentStatus;
                }
                state.activeBooking.updatedAt = new Date().toISOString();
            }
            state.lastUpdated = new Date().toISOString();
        },
        // Add new booking (for real-time updates)
        addBooking: (state, action) => {
            const newBooking = action.payload;
            const existingIndex = state.currentBookings.findIndex(booking => booking.id === newBooking.id);
            if (existingIndex === -1) {
                state.currentBookings.unshift(newBooking);
            }
            else {
                state.currentBookings[existingIndex] = newBooking;
            }
            state.lastUpdated = new Date().toISOString();
        },
        // Remove booking (for cancellations)
        removeBooking: (state, action) => {
            const bookingId = action.payload;
            state.currentBookings = state.currentBookings.filter(booking => booking.id !== bookingId);
            state.pastBookings = state.pastBookings.filter(booking => booking.id !== bookingId);
            if (state.activeBooking && state.activeBooking.id === bookingId) {
                state.activeBooking = null;
            }
            if (state.selectedBooking && state.selectedBooking.id === bookingId) {
                state.selectedBooking = null;
            }
            state.lastUpdated = new Date().toISOString();
        },
        // Filter and sort
        setStatusFilter: (state, action) => {
            state.statusFilter = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        setSortOrder: (state, action) => {
            state.sortOrder = action.payload;
        },
        // Real-time updates
        setRealTimeEnabled: (state, action) => {
            state.realTimeEnabled = action.payload;
        },
        setUpdateInterval: (state, action) => {
            state.updateInterval = action.payload;
        },
        // Clear all data
        clearBookingData: (state) => {
            state.currentBookings = [];
            state.pastBookings = [];
            state.activeBooking = null;
            state.selectedBooking = null;
            state.error = null;
            state.lastUpdated = null;
        },
    },
});
export const { setLoading, setError, setCurrentBookings, setPastBookings, setActiveBooking, setSelectedBooking, updateBookingStatus, addBooking, removeBooking, setStatusFilter, setSortBy, setSortOrder, setRealTimeEnabled, setUpdateInterval, clearBookingData, } = bookingSlice.actions;
export default bookingSlice.reducer;
