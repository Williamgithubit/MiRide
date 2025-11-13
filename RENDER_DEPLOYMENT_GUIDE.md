# Render Deployment Guide - MiRide Car Rental

## 🚨 Critical: Image Display Fix

This guide addresses the issue where car images display in development but not in production on Render.

## Root Causes Identified

1. **Static File Path Resolution**: Server needs to find the `public/uploads` folder in production
2. **Environment Variables**: Frontend needs `VITE_API_URL` to construct proper image URLs
3. **Directory Structure**: Upload directories must exist in the deployed code

## ✅ Fixes Applied

### 1. Server Static File Path (server/server.js)
- Added multiple path resolution strategies
- Server now tries: `../public/uploads`, `public/uploads`, and `process.cwd()/public/uploads`
- Logs which path is being used for debugging

### 2. Root .gitignore
- Created to ensure `public/uploads` structure is committed
- Allows existing images to be tracked while ignoring future uploads

### 3. Directory Structure
- Added `.gitkeep` files to preserve empty directories
- Ensures upload folders exist even when empty

## 🚀 Deployment Steps

### Backend Deployment (Render Web Service)

1. **Create Web Service**
   - Connect your GitHub repository
   - Select the `server` directory as the root directory
   - Or set Build Command to: `cd server && npm install`

2. **Environment Variables** (Critical!)
   ```
   NODE_ENV=production
   PORT=3000
   CLIENT_URL=https://your-frontend-url.onrender.com
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-jwt-secret
   ```

3. **Build Settings**
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Verify Deployment**
   - Check logs for: `✅ Using uploads path: /path/to/uploads`
   - Check logs for: `📁 Static files served from: /path/to/uploads`
   - Test: `https://your-backend.onrender.com/uploads/cars/test.jpg`

### Frontend Deployment (Render Static Site)

1. **Create Static Site**
   - Connect your GitHub repository
   - Select the `client` directory as the root directory

2. **Environment Variables** (Critical for Images!)
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
   ⚠️ **IMPORTANT**: Do NOT include `/api` at the end!

3. **Build Settings**
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`

4. **Verify Deployment**
   - Open browser console on your site
   - Look for: `🔧 API_BASE_URL configured as: https://your-backend.onrender.com`
   - If empty, the environment variable wasn't set correctly

## 🔍 Troubleshooting

### Images Still Not Showing?

#### Check 1: Backend Logs
```bash
# Look for these lines in Render backend logs:
✅ Using uploads path: /opt/render/project/src/public/uploads
📁 Static files served from: /opt/render/project/src/public/uploads
```

If you see a different path or error, the static files aren't being served.

#### Check 2: Frontend Console
```javascript
// Open browser console on production site:
// Should see:
🔧 API_BASE_URL configured as: https://your-backend.onrender.com
🔧 VITE_API_URL from env: https://your-backend.onrender.com
```

If `API_BASE_URL` is empty, add `VITE_API_URL` to frontend environment variables.

#### Check 3: Test Static File Serving
```bash
# Try accessing an image directly:
https://your-backend.onrender.com/uploads/cars/car-123456.jpg

# Should return the image, not 404
```

#### Check 4: Network Tab
- Open DevTools → Network tab
- Filter by "Img"
- Look at failed image requests
- Check if URLs are correct: `https://backend.onrender.com/uploads/cars/...`

### Common Issues

#### Issue: 404 on Image URLs
**Cause**: `VITE_API_URL` not set in frontend
**Fix**: Add environment variable in Render frontend service

#### Issue: Images point to frontend domain
**Cause**: Frontend is using relative paths instead of backend URL
**Fix**: Verify `VITE_API_URL` is set and rebuild frontend

#### Issue: Static files not found on backend
**Cause**: `public/uploads` folder missing or wrong path
**Fix**: 
- Verify `public/uploads` exists in repository
- Check backend logs for upload path
- Ensure `.gitkeep` files are committed

#### Issue: CORS errors
**Cause**: `CLIENT_URL` not set correctly on backend
**Fix**: Set `CLIENT_URL=https://your-frontend.onrender.com` in backend env vars

## 📁 Project Structure

```
MiRide/
├── public/                    # Root-level public folder
│   └── uploads/
│       ├── .gitkeep          # Preserves directory
│       └── cars/
│           ├── .gitkeep      # Preserves directory
│           └── *.jpg         # Car images
├── server/                    # Backend
│   ├── server.js             # Static file serving configured here
│   ├── package.json
│   └── ...
└── client/                    # Frontend
    ├── src/
    │   ├── config/
    │   │   └── api.ts        # API_BASE_URL configuration
    │   └── utils/
    │       └── imageUtils.ts # Image URL helper
    ├── package.json
    └── ...
```

## 🔄 Redeployment Checklist

When redeploying after fixes:

- [ ] Commit all changes to git
- [ ] Push to GitHub
- [ ] Trigger manual deploy on Render (or wait for auto-deploy)
- [ ] Check backend logs for upload path confirmation
- [ ] Check frontend console for API_BASE_URL
- [ ] Test image loading on production site
- [ ] Check Network tab for failed requests

## 📝 Environment Variables Summary

### Backend (server/.env)
```env
NODE_ENV=production
PORT=3000
CLIENT_URL=https://miride.onrender.com
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
```

### Frontend (client/.env.production)
```env
VITE_API_URL=https://mirideservice.onrender.com
```

## 🆘 Still Having Issues?

1. **Check Render Logs**: Backend logs show upload path and requests
2. **Browser Console**: Frontend logs show API configuration
3. **Network Tab**: Shows actual image request URLs
4. **Test Endpoints**: 
   - Backend health: `https://backend.onrender.com/`
   - Static files: `https://backend.onrender.com/uploads/cars/`
   - API: `https://backend.onrender.com/api/cars`

## ✨ Success Indicators

When everything works correctly:

1. ✅ Backend logs show: `✅ Using uploads path: ...`
2. ✅ Frontend console shows: `🔧 API_BASE_URL configured as: https://...`
3. ✅ Images load in production
4. ✅ No 404 errors in Network tab
5. ✅ Image URLs point to backend domain

---

**Last Updated**: November 2024
**Status**: Production-ready fixes applied
