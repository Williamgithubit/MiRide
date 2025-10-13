# Admin Reports Feature - Implementation Guide

## Overview

The Admin Reports feature provides comprehensive analytics and reporting capabilities for the MiRide platform. Administrators can generate, view, and export detailed reports on users, cars, bookings, revenue, and system activity.

## Features

### 1. **Report Categories**

#### User Reports
- Total users, active/inactive counts
- New registrations tracking
- User distribution by role (Customer, Owner, Admin)
- Registration trend visualization
- Export to CSV/PDF

#### Car Listings Reports
- Total cars by status (Available, Rented, Maintenance)
- Distribution by category (Sedan, SUV, Luxury, etc.)
- Visual charts and breakdowns
- Export capabilities

#### Booking Reports
- Booking status distribution (Pending, Confirmed, Completed, Cancelled)
- Daily, weekly, and monthly trends
- Interactive trend switching
- Comprehensive statistics

#### Revenue & Payments Reports
- Total revenue, payouts, and commissions
- Monthly revenue trends
- Revenue by car category
- Profit margin calculations
- Multi-line comparison charts

#### Activity Logs
- User activity tracking by role
- Searchable and filterable logs
- IP address tracking
- Audit trail for compliance

### 2. **Interactive Features**

- **Dynamic Filters:** Date range, user type, car category, booking status
- **Search Functionality:** Search across all report data
- **Tab Navigation:** Easy switching between report types
- **Real-time Data:** Generate reports on-demand
- **Responsive Design:** Works on desktop and tablet devices

### 3. **Data Visualization**

Built with **Recharts** library:
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Responsive and interactive tooltips
- Dark mode support

### 4. **Export Options**

- **CSV Export:** Tabular data for spreadsheet analysis
- **PDF Export:** Professional formatted reports with tables and summaries
- Custom filename with timestamp
- Browser-based download

## File Structure

```
client/src/
├── components/dashboards/dashboard-components/admin-components/Reports/
│   ├── AdminReports.tsx          # Main reports container
│   ├── UserReports.tsx            # User analytics component
│   ├── CarReports.tsx             # Car listings analytics
│   ├── BookingReports.tsx         # Booking analytics
│   ├── RevenueReports.tsx         # Revenue analytics
│   ├── ActivityLogs.tsx           # Activity logs viewer
│   ├── ReportFilters.tsx          # Filter component
│   └── index.ts                   # Exports
├── store/Admin/
│   └── adminReportsSlice.ts       # Redux state management
└── utils/
    └── exportUtils.ts             # CSV/PDF export utilities
```

## Installation & Setup

### 1. Install Dependencies

The following packages are already included in `package.json`:
- `recharts` - Chart library
- `jspdf` - PDF generation
- `@reduxjs/toolkit` - State management
- `react-redux` - Redux bindings

**Additional package needed:**
```bash
npm install jspdf-autotable
```

### 2. Redux Store Configuration

The `adminReportsSlice` has been added to the Redux store in `store/store.ts`:

```typescript
import adminReportsReducer from "./Admin/adminReportsSlice";

const appReducer = {
  // ... other reducers
  adminReports: adminReportsReducer,
};
```

### 3. Navigation Integration

The Reports section is accessible via the Admin Dashboard sidebar. The route is already configured:
- **Route ID:** `reports`
- **Icon:** FaChartLine
- **Label:** Reports

## Usage

### Accessing Reports

1. Log in as an admin user
2. Navigate to the Admin Dashboard
3. Click on "Reports" in the sidebar
4. Select a report category from the tabs

### Generating Reports

1. Click the "Filters" button to set date range and other criteria
2. Adjust filters as needed:
   - Start Date / End Date
   - User Type
   - Car Category
   - Booking Status
   - Search Query
3. Click "Generate Report" to fetch data
4. View visualizations and tables

### Exporting Reports

1. Generate a report
2. Click "Export CSV" for spreadsheet format
3. Click "Export PDF" for formatted document
4. File downloads automatically with timestamp

## API Integration

### Backend Requirements

The frontend expects the following API endpoints (see `ADMIN_REPORTS_API.md` for details):

- `GET /api/admin/reports/users` - User statistics
- `GET /api/admin/reports/cars` - Car statistics
- `GET /api/admin/reports/bookings` - Booking statistics
- `GET /api/admin/reports/revenue` - Revenue analytics
- `GET /api/admin/reports/activity` - Activity logs
- `GET /api/admin/reports/generated` - Previously generated reports
- `POST /api/admin/reports/export` - Export report

### Authentication

All API calls include the Bearer token from Redux auth state:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

## State Management

### Redux Slice Structure

```typescript
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
```

### Actions

- `setActiveTab` - Switch between report categories
- `setFilters` - Update filter criteria
- `resetFilters` - Clear all filters
- `fetchUserReport` - Fetch user analytics
- `fetchCarReport` - Fetch car analytics
- `fetchBookingReport` - Fetch booking analytics
- `fetchRevenueReport` - Fetch revenue analytics
- `fetchActivityLogs` - Fetch activity logs
- `exportReport` - Export report to CSV/PDF

### Selectors

```typescript
selectUserReport(state)
selectCarReport(state)
selectBookingReport(state)
selectRevenueReport(state)
selectActivityLogs(state)
selectReportFilters(state)
selectActiveTab(state)
selectReportStatus(state)
selectReportError(state)
```

## Customization

### Adding New Report Types

1. Create a new report component in `Reports/` directory
2. Add the report type to the Redux slice
3. Create an async thunk for data fetching
4. Add a new tab in `AdminReports.tsx`
5. Update the `renderContent()` switch statement

### Modifying Charts

Charts use Recharts library. To customize:

```tsx
<LineChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="date" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="value" stroke="#3B82F6" />
</LineChart>
```

### Styling

The components use Tailwind CSS with dark mode support:
- Light mode: `bg-white text-gray-900`
- Dark mode: `dark:bg-gray-800 dark:text-white`

## Error Handling

### Loading States

```tsx
{status === 'loading' && (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
)}
```

### Error States

```tsx
{error && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200">
    <p className="text-red-600">{error}</p>
  </div>
)}
```

### Empty States

```tsx
{!report && (
  <div className="text-center py-12">
    <p className="text-gray-500">No data available. Please generate a report.</p>
  </div>
)}
```

## Performance Optimization

### Best Practices

1. **Lazy Loading:** Reports load data only when accessed
2. **Memoization:** Use React.memo for chart components
3. **Debouncing:** Search inputs should be debounced
4. **Pagination:** Consider pagination for large activity logs
5. **Caching:** Redux persists filter preferences

### Optimization Tips

```tsx
// Memoize expensive calculations
const chartData = useMemo(() => {
  return processReportData(report);
}, [report]);

// Debounce search
const debouncedSearch = useDebounce(searchTerm, 300);
```

## Testing

### Manual Testing Checklist

- [ ] All report tabs load correctly
- [ ] Filters apply and update data
- [ ] Charts render with correct data
- [ ] CSV export downloads correctly
- [ ] PDF export generates properly
- [ ] Dark mode displays correctly
- [ ] Responsive design works on tablet
- [ ] Loading states display
- [ ] Error states display
- [ ] Empty states display

### Test Data

For development, you can mock API responses in the Redux slice:

```typescript
// Mock data for testing
const mockUserReport = {
  totalUsers: 1250,
  activeUsers: 980,
  inactiveUsers: 270,
  newRegistrations: 45,
  // ... more data
};
```

## Troubleshooting

### Common Issues

**Issue:** Charts not rendering
- **Solution:** Ensure Recharts is installed and data format matches expected structure

**Issue:** PDF export fails
- **Solution:** Install `jspdf-autotable` package: `npm install jspdf-autotable`

**Issue:** API calls fail
- **Solution:** Check backend endpoints are implemented and authentication token is valid

**Issue:** Dark mode colors incorrect
- **Solution:** Verify Tailwind dark mode classes are applied correctly

**Issue:** Filters not working
- **Solution:** Check Redux state updates and API query parameters

## Future Enhancements

Potential improvements:
- [ ] Scheduled report generation
- [ ] Email report delivery
- [ ] Custom report builder
- [ ] More chart types (area, scatter, etc.)
- [ ] Report templates
- [ ] Comparison between date ranges
- [ ] Real-time data updates
- [ ] Advanced filtering options
- [ ] Report sharing with other admins
- [ ] Mobile app support

## Support

For issues or questions:
1. Check this documentation
2. Review `ADMIN_REPORTS_API.md` for backend requirements
3. Check Redux DevTools for state issues
4. Review browser console for errors

## License

This feature is part of the MiRide platform.
