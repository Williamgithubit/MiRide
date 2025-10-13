# Admin Notifications System - Testing Guide

## Quick Test Script

Follow these steps to verify the notifications system is working correctly.

## Prerequisites

- Server running on port 5000 (or configured port)
- Client running on port 5173 (or configured port)
- Admin user account created
- Database migrations run

## Test Sequence

### 1. Visual Verification ✅

**Test**: Check if components are accessible
- [ ] Log in as admin user
- [ ] Navigate to Admin Dashboard
- [ ] Verify "Notifications" appears in sidebar
- [ ] Click on "Notifications" in sidebar
- [ ] Verify page loads without errors

**Expected Result**: 
- Notifications page displays with stats cards, search bar, and table
- No console errors

---

### 2. Send Notification Test ✅

**Test**: Create and send a new notification
- [ ] Click "Send Notification" button
- [ ] Modal opens with form
- [ ] Fill in:
  - Title: "Test System Notification"
  - Message: "This is a test notification to verify the system is working."
  - Recipient: "All"
  - Type: "System"
  - Link: (leave empty)
- [ ] Click "Send Notification"

**Expected Result**:
- Success toast appears
- Modal closes
- Notification appears in table (may need to refresh)
- Unread badge in sidebar increases

---

### 3. Search Test ✅

**Test**: Search functionality
- [ ] Type "test" in search box
- [ ] Verify table filters to show only matching notifications
- [ ] Clear search box
- [ ] Verify all notifications appear again

**Expected Result**:
- Real-time filtering works
- Results update as you type

---

### 4. Filter Test ✅

**Test**: Filter functionality
- [ ] Click "Show Filters"
- [ ] Set Type filter to "System"
- [ ] Verify only System notifications show
- [ ] Set Recipient filter to "All"
- [ ] Set Status filter to "Unread"
- [ ] Click "Clear Filters"
- [ ] Verify all notifications appear

**Expected Result**:
- Filters work independently and together
- Clear filters resets everything

---

### 5. Mark as Read/Unread Test ✅

**Test**: Status toggle functionality
- [ ] Find an unread notification (blue background)
- [ ] Click the check icon (✓) in Actions column
- [ ] Verify notification background changes to white
- [ ] Verify status badge changes to "Read"
- [ ] Verify unread count in sidebar decreases
- [ ] Click envelope icon (✉) to mark as unread
- [ ] Verify notification background changes to blue
- [ ] Verify unread count increases

**Expected Result**:
- Status toggles correctly
- Badge count updates
- Visual indicators update

---

### 6. Delete Single Notification Test ✅

**Test**: Delete individual notification
- [ ] Click trash icon (🗑) on a notification
- [ ] Confirm deletion in dialog
- [ ] Verify notification is removed from table
- [ ] Verify success toast appears

**Expected Result**:
- Confirmation dialog appears
- Notification deleted after confirmation
- Table updates immediately

---

### 7. Bulk Delete Test ✅

**Test**: Select and delete multiple notifications
- [ ] Check checkboxes for 2-3 notifications
- [ ] Verify "Selected" count updates
- [ ] Verify blue banner appears showing selection
- [ ] Click "Delete Selected" button
- [ ] Confirm deletion
- [ ] Verify selected notifications are removed

**Expected Result**:
- Selection UI appears
- Bulk delete works
- All selected items removed

---

### 8. Pagination Test ✅

**Test**: Navigate through pages (if you have 10+ notifications)
- [ ] Send multiple test notifications to create 10+
- [ ] Verify pagination controls appear
- [ ] Click "Next" button
- [ ] Verify page 2 loads
- [ ] Click page number directly
- [ ] Click "Previous" button

**Expected Result**:
- Pagination works smoothly
- Page numbers update
- Table content changes per page

---

### 9. Responsive Design Test ✅

**Test**: Mobile/tablet view
- [ ] Open browser DevTools (F12)
- [ ] Toggle device toolbar (Ctrl+Shift+M)
- [ ] Select mobile device (e.g., iPhone 12)
- [ ] Verify layout adapts
- [ ] Test all features on mobile view
- [ ] Switch to tablet view
- [ ] Verify layout adapts

**Expected Result**:
- Layout is responsive
- All features work on mobile
- No horizontal scrolling

---

### 10. Dark Mode Test ✅

**Test**: Dark mode compatibility
- [ ] Toggle dark mode (moon/sun icon in top navbar)
- [ ] Verify all components render correctly
- [ ] Check text contrast is readable
- [ ] Verify badges and colors are visible
- [ ] Toggle back to light mode

**Expected Result**:
- Dark mode works throughout
- All text is readable
- Colors adapt appropriately

---

### 11. Refresh Test ✅

**Test**: Manual refresh functionality
- [ ] Click "Refresh" button
- [ ] Verify loading spinner appears briefly
- [ ] Verify data reloads
- [ ] Verify success toast appears

**Expected Result**:
- Data refreshes from server
- UI updates with latest data

---

### 12. Clear All Test ⚠️ (Destructive)

**Test**: Clear all notifications
- [ ] Scroll to "Danger Zone" section
- [ ] Click "Clear All Notifications"
- [ ] Verify confirmation dialog appears
- [ ] Confirm action
- [ ] Verify all notifications are removed
- [ ] Verify empty state appears

**Expected Result**:
- Confirmation required
- All notifications deleted
- Empty state shows with icon and message

---

### 13. Send to Specific Recipients Test ✅

**Test**: Target specific user groups
- [ ] Click "Send Notification"
- [ ] Set Recipient to "Owner"
- [ ] Fill in title and message
- [ ] Send notification
- [ ] Verify notification sent (check toast)
- [ ] Repeat for "Customer" recipient

**Expected Result**:
- Notifications sent to correct user groups
- Backend filters recipients correctly

---

### 14. Link Functionality Test ✅

**Test**: Optional link field
- [ ] Click "Send Notification"
- [ ] Fill in form
- [ ] Add link: "https://example.com"
- [ ] Send notification
- [ ] Find notification in table
- [ ] Verify external link icon (🔗) appears
- [ ] Click link icon
- [ ] Verify link opens in new tab

**Expected Result**:
- Link icon appears when link is present
- Clicking opens link in new tab

---

### 15. Statistics Dashboard Test ✅

**Test**: Stats cards update correctly
- [ ] Note current counts in stats cards
- [ ] Send a new notification
- [ ] Verify "Total Notifications" increases
- [ ] Verify "Unread Notifications" increases
- [ ] Mark a notification as read
- [ ] Verify "Unread Notifications" decreases
- [ ] Select some notifications
- [ ] Verify "Selected" count updates

**Expected Result**:
- All stats update in real-time
- Counts are accurate

---

### 16. Error Handling Test ✅

**Test**: Handle errors gracefully
- [ ] Stop the backend server
- [ ] Try to send a notification
- [ ] Verify error toast appears
- [ ] Try to refresh notifications
- [ ] Verify error handling
- [ ] Restart backend server
- [ ] Verify system recovers

**Expected Result**:
- Error messages appear
- No crashes
- System recovers when backend is back

---

### 17. Badge in Sidebar Test ✅

**Test**: Unread count badge
- [ ] Send a new notification
- [ ] Verify red badge appears on "Notifications" in sidebar
- [ ] Verify badge shows correct count
- [ ] Mark all as read
- [ ] Verify badge disappears
- [ ] Navigate to different section
- [ ] Return to notifications
- [ ] Verify badge persists correctly

**Expected Result**:
- Badge shows unread count
- Updates in real-time
- Disappears when count is 0

---

### 18. Form Validation Test ✅

**Test**: Send notification form validation
- [ ] Click "Send Notification"
- [ ] Try to submit empty form
- [ ] Verify validation errors
- [ ] Fill only title
- [ ] Try to submit
- [ ] Verify message is required
- [ ] Fill all required fields
- [ ] Submit successfully

**Expected Result**:
- Form validates required fields
- Clear error messages
- Submission works when valid

---

### 19. Performance Test ✅

**Test**: System with many notifications
- [ ] Send 50+ test notifications (use a loop if needed)
- [ ] Verify table loads quickly
- [ ] Test filtering performance
- [ ] Test search performance
- [ ] Test pagination
- [ ] Verify no lag or freezing

**Expected Result**:
- System handles large datasets
- UI remains responsive
- Pagination helps with performance

---

### 20. Browser Console Test ✅

**Test**: No errors in console
- [ ] Open browser console (F12)
- [ ] Navigate through all features
- [ ] Check for errors or warnings
- [ ] Verify no 404s in Network tab
- [ ] Check Redux DevTools (if installed)
- [ ] Verify state updates correctly

**Expected Result**:
- No console errors
- No network errors
- Redux state updates properly

---

## Quick Smoke Test (5 minutes)

If you're short on time, run this abbreviated test:

1. ✅ Log in as admin
2. ✅ Navigate to Notifications
3. ✅ Send a test notification
4. ✅ Verify it appears in table
5. ✅ Mark as read
6. ✅ Delete it
7. ✅ Check badge updates

---

## Common Issues & Solutions

### Issue: "Cannot read property 'unreadCount' of undefined"
**Solution**: Ensure Redux store is properly configured with adminNotifications reducer

### Issue: 404 on API calls
**Solution**: Verify backend server is running and routes are registered

### Issue: Badge not showing
**Solution**: Check if you're logged in as admin role

### Issue: Toast notifications not appearing
**Solution**: Verify Toaster component is in App.tsx

### Issue: Styling looks broken
**Solution**: Ensure Tailwind CSS is properly configured

---

## API Testing with cURL

Test backend endpoints directly:

```bash
# Get all notifications (replace TOKEN with your admin token)
curl -H "Authorization: Bearer TOKEN" http://localhost:5000/api/admin/notifications

# Send notification
curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Test","message":"Test message","recipient":"All","type":"System"}' \
  http://localhost:5000/api/admin/notifications/send

# Mark as read
curl -X PATCH -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/notifications/1/read

# Delete notification
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/admin/notifications/1
```

---

## Test Checklist Summary

- [ ] Visual verification
- [ ] Send notification
- [ ] Search functionality
- [ ] Filter functionality
- [ ] Mark as read/unread
- [ ] Delete single notification
- [ ] Bulk delete
- [ ] Pagination
- [ ] Responsive design
- [ ] Dark mode
- [ ] Refresh functionality
- [ ] Clear all
- [ ] Recipient targeting
- [ ] Link functionality
- [ ] Statistics dashboard
- [ ] Error handling
- [ ] Sidebar badge
- [ ] Form validation
- [ ] Performance with many items
- [ ] No console errors

---

## Success Criteria

✅ All tests pass
✅ No console errors
✅ UI is responsive
✅ Dark mode works
✅ All features functional
✅ Good performance

---

**Status**: Ready for Testing
**Estimated Testing Time**: 30-45 minutes (full test) or 5 minutes (smoke test)
