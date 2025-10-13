# Admin Notifications System - Setup Guide

## Overview
A complete notifications management system has been implemented for the MiRide Admin Dashboard, allowing admins to view, manage, and send platform-wide notifications to owners and customers.

## What Was Created

### Frontend Components

1. **Redux Slice** (`client/src/store/Admin/adminNotificationsSlice.ts`)
   - State management for notifications
   - Async thunks for API calls
   - Selectors for accessing state
   - Filters and pagination logic

2. **Main Component** (`client/src/components/dashboards/dashboard-components/admin-components/Notifications/AdminNotifications.tsx`)
   - Main container with stats dashboard
   - Search and filter controls
   - Bulk action controls
   - Pagination
   - Danger zone for clearing all notifications

3. **Table Component** (`client/src/components/dashboards/dashboard-components/admin-components/Notifications/NotificationsTable.tsx`)
   - Displays notifications in a table format
   - Row selection
   - Action buttons (mark as read/unread, delete, open link)
   - Color-coded badges
   - Relative timestamps

4. **Modal Component** (`client/src/components/dashboards/dashboard-components/admin-components/Notifications/SendNotificationModal.tsx`)
   - Form for sending new notifications
   - Recipient selection (All, Owners, Customers)
   - Type selection (System, Booking, Payment, Review)
   - Optional link field
   - Form validation

### Backend Components

1. **Controller** (`server/controllers/adminNotificationsController.js`)
   - `getAllNotifications` - Fetch all notifications with filters
   - `sendNotification` - Send notification to users
   - `markNotificationAsRead` - Mark as read
   - `markNotificationAsUnread` - Mark as unread
   - `deleteNotification` - Delete single notification
   - `bulkDeleteNotifications` - Delete multiple notifications
   - `clearAllNotifications` - Clear all notifications
   - `getNotificationStats` - Get statistics

2. **Routes** (Updated `server/routes/adminRoutes.js`)
   - Added 8 new notification management endpoints
   - All protected with admin authentication

### Integration Points

1. **Redux Store** (Updated `client/src/store/store.ts`)
   - Added `adminNotifications` reducer to the store
   - Integrated with existing Redux setup

2. **Admin Dashboard** (Updated `client/src/components/dashboards/admin/AdminDashboard.tsx`)
   - Added notifications section to switch statement
   - Imported AdminNotifications component

3. **Sidebar** (Updated `client/src/components/dashboards/shared/Sidebar.tsx`)
   - Added unread notification badge
   - Badge shows count of unread notifications
   - Only visible for admin role

4. **Component Exports** (Updated `client/src/components/dashboards/dashboard-components/admin-components/index.ts`)
   - Exported AdminNotifications component

## Features Implemented

### ✅ Notifications List/Table
- Columns: Title, Message, Recipient, Type, Status, Timestamp, Actions
- Unread notifications highlighted with blue background
- Color-coded badges for types and recipients
- Responsive design for mobile and desktop

### ✅ Admin Actions
- Mark as Read/Unread
- Delete single notification
- Bulk delete selected notifications
- Clear all notifications (with confirmation)
- Send new notifications

### ✅ Search & Filters
- Real-time search across titles and messages
- Filter by Type (System, Booking, Payment, Review)
- Filter by Recipient (All, Owner, Customer)
- Filter by Status (Read, Unread)
- Clear all filters button

### ✅ Statistics Dashboard
- Total notifications count
- Unread notifications count
- Selected notifications count

### ✅ Real-time Updates
- Redux state management
- Unread badge in sidebar
- Refresh button for manual updates

### ✅ Responsive UI
- Mobile-optimized layout
- Dark mode support
- Toast notifications for user feedback

## How to Use

### Accessing the Notifications System

1. Log in as an admin user
2. Navigate to the Admin Dashboard
3. Click on "Notifications" in the sidebar
4. The unread count badge will show if there are unread notifications

### Sending a Notification

1. Click the "Send Notification" button
2. Fill in the form:
   - **Title**: Short notification title
   - **Message**: Detailed notification message
   - **Recipient**: Choose All Users, Owners Only, or Customers Only
   - **Type**: Choose System, Booking, Payment, or Review
   - **Link** (Optional): Add a URL for more information
3. Click "Send Notification"
4. The notification will be sent to all selected users

### Managing Notifications

**Search**: Type in the search box to filter notifications by title or message

**Filter**: Click "Show Filters" to access advanced filtering options

**Mark as Read/Unread**: Click the check icon (✓) or envelope icon (✉) in the Actions column

**Delete**: Click the trash icon (🗑) in the Actions column

**Bulk Actions**:
1. Select notifications using checkboxes
2. Click "Select All" to select all on current page
3. Click "Delete Selected" to remove selected notifications

**Clear All**: Use the "Clear All Notifications" button in the Danger Zone (requires confirmation)

## API Endpoints

All endpoints require admin authentication via Bearer token.

### GET `/api/admin/notifications`
Fetch notifications with optional filters
- Query params: `limit`, `offset`, `type`, `recipient`, `status`, `search`

### POST `/api/admin/notifications/send`
Send new notification
- Body: `{ title, message, recipient, type, link? }`

### PATCH `/api/admin/notifications/:id/read`
Mark notification as read

### PATCH `/api/admin/notifications/:id/unread`
Mark notification as unread

### DELETE `/api/admin/notifications/:id`
Delete single notification

### POST `/api/admin/notifications/bulk-delete`
Delete multiple notifications
- Body: `{ notificationIds: string[] }`

### DELETE `/api/admin/notifications/clear-all`
Clear all notifications

### GET `/api/admin/notifications/stats`
Get notification statistics

## Testing the System

### Manual Testing Steps

1. **Start the application**:
   ```bash
   # Terminal 1 - Start server
   cd server
   npm run dev
   
   # Terminal 2 - Start client
   cd client
   npm run dev
   ```

2. **Test sending a notification**:
   - Log in as admin
   - Go to Notifications section
   - Click "Send Notification"
   - Fill in the form and send
   - Verify notification appears in the table

3. **Test filtering**:
   - Use search box to search notifications
   - Apply different filters (Type, Recipient, Status)
   - Verify results update correctly

4. **Test actions**:
   - Mark a notification as read/unread
   - Delete a notification
   - Select multiple and bulk delete
   - Verify actions work correctly

5. **Test badge**:
   - Send a notification
   - Verify unread count appears in sidebar
   - Mark notification as read
   - Verify count decreases

## Troubleshooting

### Issue: Notifications not loading
- Check if backend server is running
- Verify admin authentication token is valid
- Check browser console for errors
- Verify API endpoint is accessible

### Issue: Badge not showing
- Ensure you're logged in as admin
- Check Redux state in browser DevTools
- Verify `adminNotifications.unreadCount` is populated

### Issue: Toast notifications not appearing
- Verify `react-hot-toast` is installed
- Check if Toaster component is in App.tsx
- Look for console errors

### Issue: Styling issues
- Ensure Tailwind CSS is properly configured
- Check if dark mode is enabled/disabled
- Verify all CSS classes are valid

## Dependencies

All required dependencies are already installed:
- `react-hot-toast` - Toast notifications
- `@reduxjs/toolkit` - State management
- `react-redux` - Redux bindings
- `react-icons` - Icon library
- `tailwindcss` - Styling

## File Structure

```
client/src/
├── components/dashboards/
│   ├── admin/
│   │   └── AdminDashboard.tsx (updated)
│   ├── shared/
│   │   └── Sidebar.tsx (updated)
│   └── dashboard-components/
│       └── admin-components/
│           ├── Notifications/
│           │   ├── AdminNotifications.tsx
│           │   ├── NotificationsTable.tsx
│           │   ├── SendNotificationModal.tsx
│           │   ├── index.ts
│           │   └── README.md
│           └── index.ts (updated)
└── store/
    ├── Admin/
    │   └── adminNotificationsSlice.ts
    └── store.ts (updated)

server/
├── controllers/
│   └── adminNotificationsController.js
└── routes/
    └── adminRoutes.js (updated)
```

## Next Steps

1. **Test the system** thoroughly in development
2. **Create test notifications** to verify functionality
3. **Monitor performance** with large numbers of notifications
4. **Consider implementing**:
   - WebSocket for real-time updates
   - Email notifications
   - Notification templates
   - Scheduled notifications
   - Export functionality

## Support

For issues or questions:
1. Check the README.md in the Notifications folder
2. Review the code comments
3. Check browser console for errors
4. Verify API responses in Network tab

---

**Status**: ✅ Complete and Ready for Testing
**Version**: 1.0.0
**Last Updated**: 2025
