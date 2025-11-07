import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BookingStatus {
  id: number;
  carId: number;
  customerId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalCost: number;
  totalAmount: number;
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentIntentId?: string;
  stripeSessionId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  specialRequests?: string;
  
  // Add-ons
  hasInsurance: boolean;
  hasGPS: boolean;
  hasChildSeat: boolean;
  hasAdditionalDriver: boolean;
  insuranceCost: number;
  gpsCost: number;
  childSeatCost: number;
  additionalDriverCost: number;
  
  // Approval tracking
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Related data
  car?: {
    id: number;
    name: string;
    model: string;
    brand: string;
    year: number;
    imageUrl?: string;
    images?: Array<{
      id: number;
      imageUrl: string;
      isPrimary: boolean;
      order: number;
    }>;
    rentalPricePerDay: number;
  };
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  owner?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface BookingState {
  currentBookings: BookingStatus[];
  pastBookings: BookingStatus[];
  activeBooking: BookingStatus | null;
  selectedBooking: BookingStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  // Filter and sort options
  statusFilter: string;
  sortBy: 'date' | 'status' | 'amount';
  sortOrder: 'asc' | 'desc';
  
  // Real-time updates
  realTimeEnabled: boolean;
  updateInterval: number;
}

const initialState: BookingState = {
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    // Booking data management
    setCurrentBookings: (state, action: PayloadAction<BookingStatus[]>) => {
      state.currentBookings = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    setPastBookings: (state, action: PayloadAction<BookingStatus[]>) => {
      state.pastBookings = action.payload;
    },
    
    setActiveBooking: (state, action: PayloadAction<BookingStatus | null>) => {
      state.activeBooking = action.payload;
    },
    
    setSelectedBooking: (state, action: PayloadAction<BookingStatus | null>) => {
      state.selectedBooking = action.payload;
    },
    
    // Update individual booking
    updateBookingStatus: (state, action: PayloadAction<{ id: number; status: BookingStatus['status']; paymentStatus?: BookingStatus['paymentStatus'] }>) => {
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
    addBooking: (state, action: PayloadAction<BookingStatus>) => {
      const newBooking = action.payload;
      const existingIndex = state.currentBookings.findIndex(booking => booking.id === newBooking.id);
      
      if (existingIndex === -1) {
        state.currentBookings.unshift(newBooking);
      } else {
        state.currentBookings[existingIndex] = newBooking;
      }
      
      state.lastUpdated = new Date().toISOString();
    },
    
    // Remove booking (for cancellations)
    removeBooking: (state, action: PayloadAction<number>) => {
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
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<'date' | 'status' | 'amount'>) => {
      state.sortBy = action.payload;
    },
    
    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },
    
    // Real-time updates
    setRealTimeEnabled: (state, action: PayloadAction<boolean>) => {
      state.realTimeEnabled = action.payload;
    },
    
    setUpdateInterval: (state, action: PayloadAction<number>) => {
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

export const {
  setLoading,
  setError,
  setCurrentBookings,
  setPastBookings,
  setActiveBooking,
  setSelectedBooking,
  updateBookingStatus,
  addBooking,
  removeBooking,
  setStatusFilter,
  setSortBy,
  setSortOrder,
  setRealTimeEnabled,
  setUpdateInterval,
  clearBookingData,
} = bookingSlice.actions;

export default bookingSlice.reducer;
