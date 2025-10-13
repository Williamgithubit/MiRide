# Admin Reports API Endpoints

This document outlines the backend API endpoints required for the Admin Reports feature.

## Base URL
All endpoints are prefixed with `/api/admin/reports`

## Authentication
All endpoints require admin authentication via Bearer token in the Authorization header.

---

## 1. User Reports

### GET `/api/admin/reports/users`

Fetches user statistics and analytics.

**Query Parameters:**
- `startDate` (string, required): Start date for the report (ISO 8601 format)
- `endDate` (string, required): End date for the report (ISO 8601 format)
- `userType` (string, optional): Filter by user type (customer, owner, admin)
- `searchQuery` (string, optional): Search by name or email

**Response:**
```json
{
  "totalUsers": 1250,
  "activeUsers": 980,
  "inactiveUsers": 270,
  "newRegistrations": 45,
  "usersByRole": [
    { "role": "Customer", "count": 850 },
    { "role": "Owner", "count": 380 },
    { "role": "Admin", "count": 20 }
  ],
  "registrationTrend": [
    { "date": "2024-01-01", "count": 15 },
    { "date": "2024-01-02", "count": 22 },
    ...
  ]
}
```

---

## 2. Car Reports

### GET `/api/admin/reports/cars`

Fetches car listing statistics and analytics.

**Query Parameters:**
- `startDate` (string, required): Start date for the report
- `endDate` (string, required): End date for the report
- `carCategory` (string, optional): Filter by car category
- `searchQuery` (string, optional): Search by make, model, or ID

**Response:**
```json
{
  "totalCars": 450,
  "availableCars": 320,
  "rentedCars": 100,
  "maintenanceCars": 30,
  "carsByCategory": [
    { "category": "Sedan", "count": 150 },
    { "category": "SUV", "count": 120 },
    { "category": "Luxury", "count": 80 },
    ...
  ],
  "carsByStatus": [
    { "status": "Available", "count": 320 },
    { "status": "Rented", "count": 100 },
    { "status": "Maintenance", "count": 30 }
  ]
}
```

---

## 3. Booking Reports

### GET `/api/admin/reports/bookings`

Fetches booking statistics and trends.

**Query Parameters:**
- `startDate` (string, required): Start date for the report
- `endDate` (string, required): End date for the report
- `bookingStatus` (string, optional): Filter by booking status
- `searchQuery` (string, optional): Search by booking ID or user

**Response:**
```json
{
  "totalBookings": 2500,
  "pendingBookings": 150,
  "confirmedBookings": 300,
  "completedBookings": 1900,
  "cancelledBookings": 150,
  "dailyTrend": [
    { "date": "2024-01-01", "count": 45 },
    { "date": "2024-01-02", "count": 52 },
    ...
  ],
  "weeklyTrend": [
    { "week": "Week 1", "count": 320 },
    { "week": "Week 2", "count": 285 },
    ...
  ],
  "monthlyTrend": [
    { "month": "Jan 2024", "count": 1250 },
    { "month": "Feb 2024", "count": 1100 },
    ...
  ]
}
```

---

## 4. Revenue Reports

### GET `/api/admin/reports/revenue`

Fetches revenue, payouts, and commission analytics.

**Query Parameters:**
- `startDate` (string, required): Start date for the report
- `endDate` (string, required): End date for the report
- `searchQuery` (string, optional): Search filter

**Response:**
```json
{
  "totalRevenue": 125000.50,
  "totalPayouts": 100000.00,
  "totalCommissions": 25000.50,
  "pendingPayouts": 5000.00,
  "revenueByMonth": [
    {
      "month": "Jan 2024",
      "revenue": 45000.00,
      "payouts": 36000.00,
      "commissions": 9000.00
    },
    ...
  ],
  "revenueByCategory": [
    { "category": "Sedan", "revenue": 45000.00 },
    { "category": "SUV", "revenue": 50000.00 },
    { "category": "Luxury", "revenue": 30000.50 }
  ]
}
```

---

## 5. Activity Logs

### GET `/api/admin/reports/activity`

Fetches user activity logs for audit purposes.

**Query Parameters:**
- `startDate` (string, required): Start date for the report
- `endDate` (string, required): End date for the report
- `userType` (string, optional): Filter by user role
- `searchQuery` (string, optional): Search by user or action

**Response:**
```json
{
  "logs": [
    {
      "id": "log_123",
      "userId": "user_456",
      "userName": "John Doe",
      "userRole": "admin",
      "action": "User Updated",
      "description": "Updated user profile for customer_789",
      "timestamp": "2024-01-15T10:30:00Z",
      "ipAddress": "192.168.1.1"
    },
    ...
  ]
}
```

---

## 6. Generated Reports

### GET `/api/admin/reports/generated`

Fetches list of previously generated reports.

**Response:**
```json
{
  "reports": [
    {
      "id": "report_123",
      "name": "User Report - January 2024",
      "type": "users",
      "generatedAt": "2024-01-31T15:00:00Z",
      "filters": {
        "startDate": "2024-01-01",
        "endDate": "2024-01-31"
      },
      "fileUrl": "/downloads/reports/report_123.pdf"
    },
    ...
  ]
}
```

---

## 7. Export Report

### POST `/api/admin/reports/export`

Generates and exports a report in CSV or PDF format.

**Request Body:**
```json
{
  "reportType": "users",
  "format": "pdf",
  "filters": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "userType": "customer"
  }
}
```

**Response:**
Returns a file download (binary data) with appropriate content-type header:
- CSV: `text/csv`
- PDF: `application/pdf`

---

## Implementation Notes

### Database Queries

1. **User Reports:**
   - Count users by status (active/inactive)
   - Group users by role
   - Count new registrations in date range
   - Generate time-series data for registration trends

2. **Car Reports:**
   - Count cars by availability status
   - Group cars by category
   - Filter by date range for newly added cars

3. **Booking Reports:**
   - Count bookings by status
   - Generate daily/weekly/monthly aggregations
   - Calculate trends over time

4. **Revenue Reports:**
   - Sum total revenue from completed bookings
   - Calculate commission (platform fee)
   - Calculate owner payouts
   - Group by month and category

5. **Activity Logs:**
   - Query audit logs table
   - Filter by date range, user role, and action type
   - Include user details and IP addresses

### Performance Considerations

- Use database indexes on date columns for faster queries
- Implement caching for frequently accessed reports
- Consider pagination for large datasets
- Use database aggregation functions for better performance

### Security

- Verify admin authentication on all endpoints
- Sanitize all query parameters to prevent SQL injection
- Rate limit export endpoints to prevent abuse
- Log all report generation requests for audit purposes

---

## Example Backend Implementation (Node.js/Express)

```javascript
// routes/admin/reports.js
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../../middleware/auth');
const reportsController = require('../../controllers/adminReportsController');

router.get('/users', authenticateAdmin, reportsController.getUserReport);
router.get('/cars', authenticateAdmin, reportsController.getCarReport);
router.get('/bookings', authenticateAdmin, reportsController.getBookingReport);
router.get('/revenue', authenticateAdmin, reportsController.getRevenueReport);
router.get('/activity', authenticateAdmin, reportsController.getActivityLogs);
router.get('/generated', authenticateAdmin, reportsController.getGeneratedReports);
router.post('/export', authenticateAdmin, reportsController.exportReport);

module.exports = router;
```

---

## Testing

Use the following test scenarios:

1. **Date Range Validation:** Test with various date ranges
2. **Empty Results:** Test with date ranges that have no data
3. **Large Datasets:** Test performance with large amounts of data
4. **Export Formats:** Test both CSV and PDF exports
5. **Filters:** Test all filter combinations
6. **Authentication:** Test unauthorized access attempts
