# Enhanced Booking Requests Testing Guide

## 🧪 Testing Checklist

### **Component Integration Tests**

#### ✅ BookingRequestsTable Component
- [ ] Renders with mock data
- [ ] Search functionality works across customer name, email, and car details
- [ ] Status filtering works for all status types
- [ ] Pagination works with multiple pages
- [ ] Desktop table layout displays correctly
- [ ] Mobile card layout displays correctly
- [ ] Action buttons (View, Approve, Reject) are functional
- [ ] Loading states display properly
- [ ] Empty states display with appropriate messaging

#### ✅ BookingActionModals
- [ ] ApprovalModal opens and displays booking details
- [ ] ApprovalModal confirmation works
- [ ] RejectionModal opens with reason selection
- [ ] RejectionModal custom reason input works
- [ ] RejectionModal confirmation works
- [ ] Loading states work in both modals
- [ ] Modals close properly on cancel/success

#### ✅ BookingDetailsModal
- [ ] Opens and displays comprehensive booking information
- [ ] Shows car details with image
- [ ] Shows customer information
- [ ] Shows rental period and duration
- [ ] Shows pricing information
- [ ] Shows status badges correctly
- [ ] Closes properly

#### ✅ BookingRequestsSection Integration
- [ ] Fetches data from Redux store
- [ ] Handles loading states
- [ ] Handles error states
- [ ] Refresh functionality works
- [ ] Modal state management works
- [ ] Toast notifications work for success/error

### **Redux Integration Tests**

#### ✅ API Endpoints
- [ ] `useGetRentalsQuery` fetches booking data
- [ ] `useApproveBookingMutation` sends approval requests
- [ ] `useRejectBookingMutation` sends rejection requests with reason
- [ ] Cache invalidation works after mutations
- [ ] Error handling works for failed requests

### **Server-Side Tests**

#### ✅ Rental Controller
- [ ] `getRentals()` returns all rentals with car and customer data
- [ ] `approveBooking()` updates status and sends notifications
- [ ] `rejectBooking()` updates status with reason and sends notifications
- [ ] Authentication middleware works
- [ ] Owner authorization works (only owners can approve/reject their cars)

#### ✅ API Routes
- [ ] `GET /api/rentals` returns rental data
- [ ] `PUT /api/rentals/:id/approve` approves bookings
- [ ] `PUT /api/rentals/:id/reject` rejects bookings with reason
- [ ] Routes require proper authentication
- [ ] Routes return proper error codes for unauthorized access

### **Data Flow Tests**

#### ✅ Complete Workflow
1. [ ] Customer makes booking → Status: `pending_approval`
2. [ ] Owner sees booking in requests table
3. [ ] Owner can view booking details
4. [ ] Owner can approve → Status: `approved`, customer notified
5. [ ] Owner can reject → Status: `rejected`, customer notified
6. [ ] Real-time updates work (table refreshes after actions)

### **UI/UX Tests**

#### ✅ Visual Design
- [ ] Consistent styling with Customer Booking Status
- [ ] React Icons display properly
- [ ] Status badges have correct colors
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Dark mode support works
- [ ] Loading animations are smooth
- [ ] Hover states work on interactive elements

#### ✅ Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] Proper ARIA labels
- [ ] Focus management in modals
- [ ] Color contrast meets standards

### **Error Handling Tests**

#### ✅ Network Errors
- [ ] API timeout handling
- [ ] Network disconnection handling
- [ ] Server error responses (500, 404, etc.)
- [ ] Invalid data handling
- [ ] Authentication expiry handling

#### ✅ User Input Validation
- [ ] Empty reason rejection handling
- [ ] Invalid booking ID handling
- [ ] Concurrent action prevention (disable buttons during loading)

## 🚀 Manual Testing Steps

### **Setup Test Data**
1. Ensure you have test bookings with `pending_approval` status
2. Ensure bookings have proper car and customer associations
3. Test with different booking statuses

### **Test Scenarios**

#### **Scenario 1: View Booking Requests**
1. Navigate to Owner Dashboard → Booking Requests
2. Verify table loads with booking data
3. Test search functionality with customer names
4. Test status filtering
5. Test pagination if multiple bookings exist

#### **Scenario 2: Approve Booking**
1. Click "Approve" button on a pending booking
2. Verify approval modal opens with correct booking details
3. Click "Approve Booking" button
4. Verify success toast appears
5. Verify booking status updates in table
6. Verify customer receives notification

#### **Scenario 3: Reject Booking**
1. Click "Reject" button on a pending booking
2. Verify rejection modal opens
3. Select a predefined reason
4. Click "Reject Booking" button
5. Verify success toast appears
6. Verify booking status updates in table
7. Test custom reason input

#### **Scenario 4: View Booking Details**
1. Click "View" button on any booking
2. Verify details modal opens with complete information
3. Verify all sections display correctly
4. Test modal close functionality

#### **Scenario 5: Responsive Design**
1. Test on mobile device/browser dev tools
2. Verify mobile card layout works
3. Test touch interactions
4. Verify all functionality works on mobile

## 🐛 Common Issues & Solutions

### **Import Path Issues**
- Ensure BookingStatusBadge import path is correct
- Verify React Icons are properly imported

### **API Integration Issues**
- Check server is running and accessible
- Verify authentication tokens are valid
- Check network tab for API call errors

### **State Management Issues**
- Verify Redux store is properly configured
- Check for cache invalidation after mutations
- Ensure proper error handling in RTK Query

### **Styling Issues**
- Verify Tailwind CSS is properly configured
- Check for dark mode class conflicts
- Ensure responsive classes are applied correctly

## 📊 Performance Considerations

- [ ] Table pagination prevents performance issues with large datasets
- [ ] Image lazy loading for car images
- [ ] Debounced search to prevent excessive API calls
- [ ] Proper memoization in React components
- [ ] Efficient Redux selectors

## 🔒 Security Considerations

- [ ] Owner can only see/manage their own car bookings
- [ ] Proper authentication on all API endpoints
- [ ] Input sanitization for rejection reasons
- [ ] CSRF protection on mutation endpoints
- [ ] Rate limiting on API endpoints
