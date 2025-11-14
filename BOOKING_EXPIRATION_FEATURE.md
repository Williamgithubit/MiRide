# Booking Expiration Progress Bar & Notifications Feature

## Overview
This feature adds progress bars to track booking expiration time in both Customer and Owner dashboards, along with automatic notifications when bookings expire.

## Features Implemented

### 1. Customer Dashboard
- **Progress Bar**: Shows time remaining until booking expires
- **Color-coded indicators**:
  - Blue: 0-50% elapsed
  - Yellow: 50-70% elapsed
  - Orange: 70-90% elapsed
  - Red: 90-100% elapsed
- **Real-time updates**: Updates every minute
- **Automatic notification**: Customer receives notification when booking expires

### 2. Owner Dashboard
- **Active Rentals Section**: New section showing all active rentals for owner's cars
- **Progress Bar**: Shows time remaining until rental period ends
- **Customer information**: Displays who is renting the car
- **Color-coded indicators**: Same as customer dashboard
- **Automatic notification**: Owner receives notification when rental expires

## Backend Changes

### New Files Created
1. **`server/services/bookingExpirationService.js`**
   - Checks for expired bookings every 60 minutes
   - Automatically updates booking status to 'completed'
   - Sends notifications to both customer and owner
   - Updates car availability

2. **`server/migrations/20251113-add-expiration-notification-types.js`**
   - Adds 'booking_expired' and 'rental_expired' notification types

### Modified Files
1. **`server/models/Notification.js`**
   - Added 'booking_expired' and 'rental_expired' to notification types enum

2. **`server/services/notificationService.js`**
   - Added `notifyCustomerBookingExpired()` method
   - Added `notifyOwnerRentalExpired()` method

3. **`server/controllers/rentalController.js`**
   - Added `getOwnerActiveRentals()` endpoint

4. **`server/routes/rentalRoutes.js`**
   - Added route: `GET /rentals/owner/active`

5. **`server/server.js`**
   - Starts booking expiration checker on server startup

## Frontend Changes

### New Components Created
1. **`client/src/components/dashboards/dashboard-components/customer-components/booking-components/BookingExpirationProgressBar.tsx`**
   - Progress bar component for customer bookings
   - Shows time remaining (days, hours, minutes)
   - Color-coded based on time elapsed

2. **`client/src/components/dashboards/dashboard-components/owner-components/RentalExpirationProgressBar.tsx`**
   - Progress bar component for owner rentals
   - Shows customer name and rental info
   - Color-coded based on time elapsed

3. **`client/src/components/dashboards/dashboard-components/owner-components/ActiveRentalsSection.tsx`**
   - Displays all active rentals for owner's cars
   - Shows rental cards with progress bars
   - Auto-refreshes every 5 minutes

### Modified Files
1. **`client/src/components/dashboards/dashboard-components/customer-components/booking-components/CurrentBookingCard.tsx`**
   - Added BookingExpirationProgressBar component

2. **`client/src/components/dashboards/dashboard-components/owner-components/CarListingsSection.tsx`**
   - Added ActiveRentalsSection component

3. **`client/src/store/Rental/rentalApi.ts`**
   - Added `getOwnerActiveRentals` endpoint
   - Exported `useGetOwnerActiveRentalsQuery` hook

## How It Works

### Expiration Checking Process
1. Server starts and initializes the booking expiration checker
2. Checker runs every 60 minutes (configurable)
3. Finds all bookings with status 'active' or 'approved' that have passed their end date
4. For each expired booking:
   - Updates status to 'completed'
   - Sends notification to customer
   - Sends notification to owner
   - Updates car availability to 'available'

### Progress Bar Updates
- **Customer Dashboard**: Updates every minute to show remaining time
- **Owner Dashboard**: Updates every minute to show remaining time
- **Color changes**: Automatically adjusts based on percentage elapsed

### Notifications
- **Customer receives**: "Booking Expired" notification with car details
- **Owner receives**: "Rental Period Expired" notification with customer and car details
- **Email notifications**: Sent to both parties (if email is configured)

## API Endpoints

### New Endpoints
- `GET /api/rentals/owner/active` - Get active rentals for owner's cars
  - Authentication: Required (owner or admin)
  - Returns: Array of active rental objects with car and customer details

## Database Changes

### Notification Types Added
- `booking_expired` - Sent to customer when their booking expires
- `rental_expired` - Sent to owner when their car's rental period expires

## Configuration

### Expiration Checker Interval
Default: 60 minutes
Location: `server/server.js` line 124
```javascript
BookingExpirationService.startExpirationChecker(60);
```

### Progress Bar Update Interval
Default: 60 seconds (1 minute)
Location: Both progress bar components
```javascript
setInterval(() => {
  // Update logic
}, 60000);
```

## Testing

### To Test Customer Dashboard
1. Create a booking with an end date in the past
2. Wait for the expiration checker to run (or restart server)
3. Check customer notifications for "Booking Expired" notification
4. Verify booking status changed to 'completed'

### To Test Owner Dashboard
1. Create a booking for one of your cars with an end date in the past
2. Wait for the expiration checker to run (or restart server)
3. Check owner notifications for "Rental Period Expired" notification
4. Verify car availability changed to 'available'

### To Test Progress Bars
1. Create a booking with dates spanning several days
2. Navigate to Customer Dashboard > Booking Status
3. Verify progress bar shows correct time remaining
4. Navigate to Owner Dashboard > My Car Listings
5. Verify Active Rentals section shows rental with progress bar

## Migration Instructions

1. **Run the migration**:
   ```bash
   cd server
   npx sequelize-cli db:migrate
   ```

2. **Restart the server**:
   ```bash
   npm run dev
   ```

3. **Verify the feature**:
   - Check Customer Dashboard for progress bars on bookings
   - Check Owner Dashboard for Active Rentals section
   - Create a test booking and verify notifications

## Notes

- Progress bars only show for active, approved, and pending bookings
- Completed, cancelled, and rejected bookings don't show progress bars
- The expiration checker runs automatically on server start
- Email notifications require EMAIL_USER and EMAIL_PASS environment variables
- The feature is fully responsive and works on mobile devices

## Future Enhancements

- Add manual trigger for expiration check (admin panel)
- Add configurable warning notifications (e.g., 24 hours before expiration)
- Add ability to extend rental period from progress bar
- Add analytics for expired bookings
- Add push notifications for mobile apps
