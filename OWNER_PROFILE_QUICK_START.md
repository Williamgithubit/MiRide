# Owner Profile Feature - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
All dependencies are already installed:
- ✅ Multer (for file uploads)
- ✅ Redux Toolkit
- ✅ Axios
- ✅ React Hot Toast

### Start the Application

1. **Start Backend Server**
```bash
cd server
npm run dev
```

2. **Start Frontend Client**
```bash
cd client
npm run dev
```

## 🧪 Testing the Feature

### Step 1: Login as Owner
1. Navigate to `http://localhost:5173/login`
2. Login with owner credentials
3. You'll be redirected to the owner dashboard

### Step 2: Access Profile
1. Look for "My Profile" in the sidebar (bottom of the owner menu items)
2. Click on "My Profile"
3. You should see your profile page with:
   - Profile picture (or placeholder)
   - Name, email, phone, address
   - Member since date
   - Number of registered cars
   - Number of active bookings

### Step 3: Edit Profile
1. Click the "Edit Profile" button (top right)
2. Update any of the following:
   - Full name
   - Phone number
   - Address
   - Profile picture (click camera icon on avatar)
3. Click "Save Changes"
4. You should see a success toast notification
5. Profile updates immediately

### Step 4: Verify Persistence
1. Refresh the page
2. Navigate away and come back
3. Profile data should persist
4. Avatar should display correctly

## 🔍 API Endpoints

### Get Owner Profile
```http
GET http://localhost:3000/api/owners/profile/{ownerId}
Authorization: Bearer {your-token}
```

### Update Owner Profile
```http
PUT http://localhost:3000/api/owners/profile/update/{ownerId}
Authorization: Bearer {your-token}
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, Country"
}
```

### Upload Avatar
```http
POST http://localhost:3000/api/owners/profile/upload/{ownerId}
Authorization: Bearer {your-token}
Content-Type: multipart/form-data

Form Data:
- avatar: [image file]
```

## 📁 File Locations

### Frontend Files
- **Redux Slice**: `client/src/store/Owner/ownerProfileSlice.ts`
- **Component**: `client/src/components/dashboards/dashboard-components/owner-components/OwnerProfile.tsx`
- **Sidebar**: `client/src/components/dashboards/shared/Sidebar.tsx` (updated)
- **Dashboard**: `client/src/components/dashboards/owner/OwnerDashboard.tsx` (updated)
- **Store**: `client/src/store/store.ts` (updated)

### Backend Files
- **Controller**: `server/controllers/ownerProfileController.js`
- **Routes**: `server/routes/ownerProfileRoutes.js`
- **Server**: `server/server.js` (updated)
- **Upload Directory**: `public/uploads/avatars/`

## 🎨 UI Features

### View Mode
- Clean profile card with gradient header
- Circular avatar display
- Information grid with icons
- Statistics display
- "Edit Profile" button

### Edit Mode
- Inline form editing
- Avatar upload with preview
- Real-time validation
- Save/Cancel buttons
- Loading states

## 🔐 Security

- All endpoints require authentication
- Owners can only access their own profile
- Admins can view any owner profile
- File upload validation (type, size)
- JWT token verification

## 🐛 Troubleshooting

### Avatar Not Displaying
1. Check if file was uploaded: `public/uploads/avatars/`
2. Verify file permissions
3. Check browser console for errors
4. Ensure server is serving static files from `/uploads`

### Profile Not Loading
1. Check browser console for errors
2. Verify backend server is running
3. Check network tab for API calls
4. Ensure user is authenticated

### Update Not Saving
1. Check if token is valid
2. Verify user ID matches owner ID
3. Check backend logs for errors
4. Ensure database connection is active

## 📊 Database Schema

The feature uses the existing `users` table with these fields:
- `id` (UUID, primary key)
- `name` (string)
- `email` (string, unique)
- `phone` (string, nullable)
- `address` (text, nullable)
- `avatar` (string, nullable)
- `role` (enum: 'customer', 'owner', 'admin')
- `createdAt` (timestamp)

Statistics are calculated from:
- `cars` table (count where `ownerId` matches)
- `rentals` table (count where `ownerId` matches and status is active)

## ✅ Feature Checklist

- [x] Redux slice created
- [x] Profile component created
- [x] Backend controller created
- [x] Routes configured
- [x] Multer setup for uploads
- [x] Sidebar updated
- [x] Dashboard integrated
- [x] Store configured
- [x] Authentication middleware applied
- [x] Error handling implemented
- [x] Loading states added
- [x] Toast notifications configured
- [x] Dark mode support
- [x] Responsive design

## 🎯 Next Steps

1. Test the feature thoroughly
2. Add profile picture for existing owners
3. Consider adding more profile fields if needed
4. Add profile completion percentage
5. Add profile verification badge
6. Implement profile privacy settings

## 💡 Tips

- Use high-quality images for avatars (recommended: 500x500px)
- Keep file sizes under 2MB for faster uploads
- Use JPEG or PNG format for best compatibility
- Test on different screen sizes
- Verify dark mode appearance

## 🆘 Support

If you encounter any issues:
1. Check the documentation in `OWNER_PROFILE_FEATURE.md`
2. Review the browser console for errors
3. Check backend logs for API errors
4. Verify all dependencies are installed
5. Ensure database migrations are up to date

---

**Feature Status**: ✅ Complete and Ready to Use
