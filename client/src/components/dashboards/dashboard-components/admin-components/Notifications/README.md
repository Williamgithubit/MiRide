# Admin Notifications System

A comprehensive notifications management system for the MiRide Admin Dashboard built with React, Redux, and Tailwind CSS.

## Features

### 📋 Notifications List/Table
- **Columns**: Title, Message, Recipient (All, Owner, Customer), Type (System, Booking, Payment, Review), Status (Read/Unread), Timestamp, Actions
- **Visual Indicators**: Unread notifications highlighted with blue background and dot indicator
- **Responsive Design**: Mobile-friendly table layout with Tailwind CSS

### 🎯 Admin Actions
- **Mark as Read/Unread**: Toggle notification read status
- **Delete Single Notification**: Remove individual notifications
- **Bulk Delete**: Select multiple notifications and delete them at once
- **Clear All Notifications**: Remove all notifications from the system (with confirmation)
- **Send New Notifications**: Create and send platform-wide notifications

### 🔍 Search & Filters
- **Search**: Real-time search across notification titles and messages
- **Type Filter**: Filter by System, Booking, Payment, or Review
- **Recipient Filter**: Filter by All Users, Owners, or Customers
- **Status Filter**: Filter by Read or Unread status
- **Clear Filters**: Reset all filters with one click

### 📊 Statistics Dashboard
- **Total Notifications**: Display total count of all notifications
- **Unread Count**: Show number of unread notifications
- **Selected Count**: Display number of currently selected notifications

### 🔔 Real-time Updates
- Redux state management for instant UI updates
- Unread notification badge in sidebar
- Automatic refresh capability

### 📱 Responsive UI
- Mobile-optimized layout
- Touch-friendly controls
- Dark mode support

## Components

### AdminNotifications
Main container component that manages the notifications system.

**Location**: `AdminNotifications.tsx`

**Features**:
- Fetches notifications on mount
- Manages filters and pagination
- Handles bulk operations
- Displays statistics cards

### NotificationsTable
Table component for displaying notifications with actions.

**Location**: `NotificationsTable.tsx`

**Features**:
- Sortable columns
- Row selection
- Action buttons (read/unread, delete, open link)
- Color-coded badges for types and recipients
- Relative timestamps

### SendNotificationModal
Modal form for creating and sending new notifications.

**Location**: `SendNotificationModal.tsx`

**Features**:
- Form validation
- Recipient selection (All, Owners, Customers)
- Type selection (System, Booking, Payment, Review)
- Optional link attachment
- Real-time recipient count display

## Redux Integration

### State Structure
```typescript
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
```

### Actions
- `fetchAdminNotifications`: Fetch all notifications
- `sendNotification`: Send new notification to users
- `markNotificationAsRead`: Mark notification as read
- `markNotificationAsUnread`: Mark notification as unread
- `deleteNotification`: Delete single notification
- `bulkDeleteNotifications`: Delete multiple notifications
- `clearAllNotifications`: Clear all notifications
- `setFilter`: Update filter values
- `setPage`: Change current page
- `clearFilters`: Reset all filters
- `toggleNotificationSelection`: Toggle notification selection
- `selectAllNotifications`: Select all notifications on current page
- `clearSelection`: Clear all selections

## Backend API Endpoints

### GET `/api/admin/notifications`
Fetch all notifications with optional filters.

**Query Parameters**:
- `limit`: Number of notifications per page (default: 50)
- `offset`: Pagination offset (default: 0)
- `type`: Filter by notification type
- `recipient`: Filter by recipient type
- `status`: Filter by read/unread status
- `search`: Search query

**Response**:
```json
{
  "notifications": [...],
  "totalCount": 100,
  "unreadCount": 25
}
```

### POST `/api/admin/notifications/send`
Send a new notification to users.

**Request Body**:
```json
{
  "title": "System Maintenance",
  "message": "The system will be down for maintenance...",
  "recipient": "All",
  "type": "System",
  "link": "https://example.com/maintenance"
}
```

### PATCH `/api/admin/notifications/:id/read`
Mark notification as read.

### PATCH `/api/admin/notifications/:id/unread`
Mark notification as unread.

### DELETE `/api/admin/notifications/:id`
Delete a single notification.

### POST `/api/admin/notifications/bulk-delete`
Delete multiple notifications.

**Request Body**:
```json
{
  "notificationIds": ["1", "2", "3"]
}
```

### DELETE `/api/admin/notifications/clear-all`
Clear all notifications from the system.

### GET `/api/admin/notifications/stats`
Get notification statistics.

## Usage

### In AdminDashboard
```tsx
import { AdminNotifications } from "../dashboard-components/admin-components";

// In render method
case "notifications":
  return <AdminNotifications />;
```

### Accessing from Sidebar
The notifications section is automatically available in the admin sidebar with an unread count badge.

## Styling

The component uses Tailwind CSS for styling with the following color schemes:

- **System**: Blue
- **Booking**: Green
- **Payment**: Yellow
- **Review**: Purple
- **All Users**: Indigo
- **Owners**: Orange
- **Customers**: Teal
- **Unread**: Blue highlight
- **Read**: Gray

## Toast Notifications

The system uses `react-hot-toast` for user feedback:
- Success messages for completed actions
- Error messages for failed operations
- Confirmation dialogs for destructive actions

## Security

- All API endpoints require admin authentication
- CSRF protection via authentication tokens
- Input validation on both frontend and backend
- Confirmation dialogs for destructive operations

## Future Enhancements

- [ ] WebSocket integration for real-time notifications
- [ ] Email notifications for sent messages
- [ ] Notification templates
- [ ] Scheduled notifications
- [ ] Notification analytics and insights
- [ ] Export notifications to CSV/PDF
- [ ] Notification categories and tags
- [ ] User notification preferences
