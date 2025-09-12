# Car Rental Dashboard System

A comprehensive, role-based dashboard system built with React.js, TypeScript, and Tailwind CSS for the car rental application.

## 🚀 Features

### General Features (All Dashboards)
- **Responsive Design**: Fully responsive layouts for desktop, tablet, and mobile
- **Dark Mode Support**: Complete dark/light theme switching with system preference detection
- **Modern UI**: Clean, minimal design using Tailwind CSS
- **Role-Based Access**: Automatic routing based on user roles (Owner, Admin, Customer)
- **Real-time Data**: Mock data integration with easy API replacement
- **Interactive Components**: Charts, tables, modals, and forms

### 🏠 Owner Dashboard
- **Car Management**: Full CRUD operations for car listings
- **Analytics**: Revenue tracking, utilization rates, and performance metrics
- **Earnings**: Detailed earnings reports and payout tracking
- **Rental History**: Complete booking history and status tracking
- **Interactive Charts**: Revenue trends and car status distribution

### 👑 Admin Dashboard
- **User Management**: Manage owners and customers across the platform
- **Car Approvals**: Review and approve/reject new car listings
- **System Analytics**: Platform-wide statistics and performance metrics
- **Revenue Reports**: Total platform revenue and transaction tracking
- **User Activity**: Monitor active users and system usage

### 🚗 Customer Dashboard
- **Car Browsing**: Search and filter available cars with advanced filters
- **Booking Management**: View active rentals and booking history
- **Payment History**: Complete payment records and receipts
- **Profile Management**: Update personal information and upload documents
- **Real-time Notifications**: Rental status updates and important alerts

## 📁 Project Structure

```
src/components/dashboards/
├── shared/                    # Reusable components
│   ├── DashboardCard.tsx     # Statistics cards
│   ├── TopNavbar.tsx         # Top navigation bar
│   ├── Sidebar.tsx           # Sidebar navigation (existing)
│   ├── Table.tsx             # Data table with sorting/filtering
│   ├── Chart.tsx             # Chart components (Line, Bar, Doughnut)
│   ├── Modal.tsx             # Modal dialogs
│   └── mockData.ts           # Mock data for development
├── owner/
│   └── OwnerDashboard.tsx    # Owner dashboard
├── admin/
│   └── AdminDashboard.tsx    # Admin dashboard
├── customer/
│   └── CustomerDashboard.tsx # Customer dashboard
├── DashboardRouter.tsx       # Role-based routing
└── index.ts                  # Component exports
```

## 🛠 Components

### Shared Components

#### DashboardCard
Statistics cards with optional change indicators and click handlers.
```tsx
<DashboardCard
  title="Total Revenue"
  value="$125,000"
  icon={DollarSign}
  change={{ value: 12.5, type: 'increase' }}
/>
```

#### Table
Advanced data table with sorting, filtering, search, and pagination.
```tsx
<Table
  columns={columns}
  data={data}
  searchable
  filterable
  pagination
/>
```

#### Chart
Flexible chart component supporting Line, Bar, and Doughnut charts.
```tsx
<Chart
  type="line"
  data={chartData}
  options={chartOptions}
/>
```

#### Modal
Responsive modal dialogs with customizable sizes.
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  size="lg"
>
  {content}
</Modal>
```

### Dashboard Components

Each dashboard is a complete, self-contained component with:
- Role-specific navigation
- Multiple sections/views
- Interactive data tables
- Charts and analytics
- Modal forms and dialogs

## 🎨 Styling

### Tailwind CSS Classes
- **Dark Mode**: `dark:` prefix for dark theme styles
- **Responsive**: `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Colors**: Consistent color palette with blue primary
- **Shadows**: Subtle shadows for depth and hierarchy

### Color Scheme
- **Primary**: Blue (blue-600, blue-700)
- **Success**: Green (green-600, green-700)
- **Warning**: Yellow (yellow-600, yellow-700)
- **Error**: Red (red-600, red-700)
- **Gray Scale**: Various gray shades for backgrounds and text

## 🔧 Integration

### Redux Integration
All dashboards integrate with the existing Redux store:
- **Authentication**: Uses `useReduxAuth` hook
- **API Calls**: Ready for RTK Query integration
- **State Management**: Consistent with existing patterns

### Routing
Role-based routing automatically directs users to appropriate dashboards:
```tsx
// Route: /dashboard
// Automatically redirects based on user role:
// - /dashboard -> OwnerDashboard (if role === 'owner')
// - /dashboard -> AdminDashboard (if role === 'admin')
// - /dashboard -> CustomerDashboard (if role === 'customer')
```

### Dark Mode
Global dark mode context with localStorage persistence:
```tsx
const { isDarkMode, toggleDarkMode } = useDarkMode();
```

## 📊 Mock Data

Comprehensive mock data includes:
- **Cars**: Sample car listings with images, rates, and status
- **Users**: Sample owners, customers, and admins
- **Rentals**: Booking history and active rentals
- **Analytics**: Revenue data and system statistics
- **Charts**: Pre-configured chart data

## 🚀 Usage

### Basic Setup
```tsx
import { DashboardRouter } from './components/dashboards';

// In your routing
<Route path="/dashboard/*" element={
  <ProtectedRoute>
    <DashboardRouter />
  </ProtectedRoute>
} />
```

### Individual Dashboards
```tsx
import { OwnerDashboard, AdminDashboard, CustomerDashboard } from './components/dashboards';

// Use specific dashboards
<OwnerDashboard />
<AdminDashboard />
<CustomerDashboard />
```

## 🔄 API Integration

Replace mock data with real API calls:

1. **Update Redux Store**: Replace mock data with RTK Query endpoints
2. **Update Components**: Replace mock imports with Redux hooks
3. **Error Handling**: Add proper error states and loading indicators

Example:
```tsx
// Replace this:
import { mockCars } from '../shared/mockData';

// With this:
import { useGetCarsQuery } from '../../../store/api/carApi';
const { data: cars, isLoading, error } = useGetCarsQuery();
```

## 📱 Responsive Design

All components are fully responsive:
- **Mobile**: Single column layouts, collapsible sidebars
- **Tablet**: Two-column layouts, optimized spacing
- **Desktop**: Multi-column layouts, full feature set

## 🎯 Key Features

### Interactive Elements
- **Sortable Tables**: Click column headers to sort
- **Searchable Data**: Real-time search across all fields
- **Filterable Content**: Advanced filtering options
- **Modal Forms**: Add/edit functionality
- **Chart Interactions**: Hover effects and tooltips

### Performance
- **Lazy Loading**: Components loaded on demand
- **Optimized Rendering**: Minimal re-renders
- **Efficient Tables**: Pagination and virtual scrolling ready
- **Image Optimization**: Responsive images with proper sizing

## 🔐 Security

- **Role-Based Access**: Strict role checking
- **Protected Routes**: Authentication required
- **Data Validation**: Form validation and sanitization
- **Secure Defaults**: Safe fallbacks and error handling

## 🚀 Future Enhancements

- **Real-time Updates**: WebSocket integration
- **Advanced Analytics**: More detailed reporting
- **Export Functionality**: PDF/Excel export options
- **Notification System**: Push notifications
- **Multi-language Support**: Internationalization
- **Advanced Filtering**: Date ranges, custom filters
- **Bulk Operations**: Multi-select actions

## 📝 Notes

- All components are TypeScript-ready with proper type definitions
- Mock data can be easily replaced with real API calls
- Dark mode is fully implemented and persistent
- All dashboards are production-ready and extensible
- Responsive design works across all device sizes
