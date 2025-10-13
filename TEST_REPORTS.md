# Testing Admin Reports Feature

## Quick Test Guide

### Prerequisites
1. Server running on `http://localhost:3000`
2. Client running on `http://localhost:4000`
3. Admin user credentials

### Frontend Testing

#### 1. Access Reports Section
1. Navigate to `http://localhost:4000`
2. Login with admin credentials
3. Click "Reports" in the sidebar
4. You should see the "Reports & Analytics" page

#### 2. Test Each Report Tab
- **User Reports Tab**: Should show user statistics
- **Car Listings Tab**: Should show car inventory data
- **Bookings Tab**: Should show booking trends
- **Revenue & Payments Tab**: Should show financial data
- **Activity Logs Tab**: Should show recent activities

#### 3. Test Filters
1. Click the "Filters" button
2. Set a date range
3. Select filters (user type, car category, etc.)
4. Click "Apply Filters"
5. Click "Generate Report"
6. Data should update based on filters

#### 4. Test Export
1. Generate any report
2. Click "Export CSV" - file should download
3. Click "Export PDF" - file should download
4. Verify file contents

### Backend Testing (Using curl or Postman)

#### Get Admin Token
```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'

# Copy the token from response
```

#### Test User Report
```bash
curl -X GET "http://localhost:3000/api/admin/reports/users?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected Response:
```json
{
  "totalUsers": 100,
  "activeUsers": 80,
  "inactiveUsers": 20,
  "newRegistrations": 15,
  "usersByRole": [
    { "role": "Customer", "count": 70 },
    { "role": "Owner", "count": 25 },
    { "role": "Admin", "count": 5 }
  ],
  "registrationTrend": [
    { "date": "2024-01-01", "count": 5 },
    ...
  ]
}
```

#### Test Car Report
```bash
curl -X GET "http://localhost:3000/api/admin/reports/cars?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Booking Report
```bash
curl -X GET "http://localhost:3000/api/admin/reports/bookings?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Revenue Report
```bash
curl -X GET "http://localhost:3000/api/admin/reports/revenue?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Test Activity Logs
```bash
curl -X GET "http://localhost:3000/api/admin/reports/activity?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Browser DevTools Testing

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to Reports section
4. Generate a report
5. Check the network requests:
   - Should see requests to `/api/admin/reports/*`
   - Status should be 200 OK
   - Response should contain data

### Common Issues & Solutions

#### Issue: "Failed to fetch user report"
**Solution**: 
- Check if server is running
- Verify admin authentication token is valid
- Check browser console for errors
- Verify backend routes are registered

#### Issue: Charts not displaying
**Solution**:
- Ensure data is being returned from API
- Check that data format matches expected structure
- Verify Recharts is installed: `npm list recharts`

#### Issue: Export not working
**Solution**:
- Verify jspdf-autotable is installed: `npm list jspdf-autotable`
- Check browser console for errors
- Ensure data exists before exporting

#### Issue: 403 Forbidden
**Solution**:
- Verify user has admin role
- Check authentication token is being sent
- Verify ensureAdmin middleware is working

#### Issue: Empty data
**Solution**:
- Check if database has data
- Verify date range includes data
- Check filters aren't too restrictive

### Verification Checklist

Frontend:
- [ ] Reports page loads without errors
- [ ] All 5 tabs are visible and clickable
- [ ] Filters panel opens and closes
- [ ] Generate Report button works
- [ ] Loading spinner shows during fetch
- [ ] Charts render with data
- [ ] Tables display data
- [ ] CSV export downloads
- [ ] PDF export downloads
- [ ] Dark mode works correctly
- [ ] Responsive design works on tablet

Backend:
- [ ] All 7 endpoints respond
- [ ] Authentication is enforced
- [ ] Admin role is required
- [ ] Data is returned in correct format
- [ ] Filters work correctly
- [ ] Date ranges work
- [ ] No server errors in console
- [ ] Database queries execute successfully

### Sample Test Data

If your database is empty, you can seed it with test data:

```sql
-- Insert test users
INSERT INTO "Users" (id, name, email, password, role, "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Test Customer', 'customer@test.com', 'hashed_password', 'customer', NOW(), NOW()),
  (gen_random_uuid(), 'Test Owner', 'owner@test.com', 'hashed_password', 'owner', NOW(), NOW());

-- Insert test cars
INSERT INTO "Cars" (id, make, model, category, "availabilityStatus", "ownerId", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'Toyota', 'Camry', 'sedan', 'available', 'owner_id', NOW(), NOW());

-- Insert test bookings
INSERT INTO "Bookings" (id, "customerId", "carId", status, "totalPrice", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid(), 'customer_id', 'car_id', 'completed', 150.00, NOW(), NOW());
```

### Performance Testing

Test with large datasets:
1. Generate 1000+ users
2. Generate 500+ cars
3. Generate 2000+ bookings
4. Test report generation time
5. Verify charts render smoothly
6. Check export performance

### Browser Compatibility

Test in:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if available)

### Mobile Testing

Test responsive design:
- [ ] Tablet landscape (1024px)
- [ ] Tablet portrait (768px)
- [ ] Large phone (414px)

---

## Success Criteria

✅ All reports load without errors
✅ Charts display correctly
✅ Filters work as expected
✅ Export functions work
✅ No console errors
✅ Responsive design works
✅ Dark mode works
✅ Loading states display
✅ Error states display
✅ Empty states display

---

## Next Steps After Testing

1. **Production Deployment**
   - Set up environment variables
   - Configure production database
   - Enable SSL/HTTPS
   - Set up monitoring

2. **Enhancements**
   - Add report caching
   - Implement pagination
   - Add more chart types
   - Create report templates

3. **Documentation**
   - Update user manual
   - Create video tutorials
   - Document API changes

---

**Happy Testing! 🎉**
