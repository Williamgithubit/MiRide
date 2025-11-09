# Image Display Production Troubleshooting Guide

## Issue
Images were displaying in development but stopped displaying in production.

---

## Root Causes & Solutions

### 1. **Missing Environment Variable (Most Common)**

#### Problem
The `VITE_API_URL` environment variable is not set in production, causing the frontend to use relative paths that don't resolve correctly.

#### Solution
**In your production deployment platform (Render/Netlify/Vercel):**

Set the environment variable:
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

**Important:** 
- Do NOT include `/api` at the end
- Do NOT include a trailing slash
- Example: `https://mirideservice.onrender.com` ✅
- NOT: `https://mirideservice.onrender.com/api` ❌

#### How to Verify
1. Open browser console in production
2. Run: `console.log(import.meta.env.VITE_API_URL)`
3. Should show your backend URL, not `undefined`

---

### 2. **Uploads Folder Not Deployed**

#### Problem
The `public/uploads/cars/` folder exists locally but isn't being deployed to production.

#### Solution
✅ **Already Fixed:** Added `.gitkeep` file to ensure directory structure is tracked

Verify the folder is in git:
```bash
git ls-files public/uploads/
```

Should show:
```
public/uploads/cars/.gitkeep
public/uploads/cars/car-*.jpg
```

---

### 3. **CORS Issues**

#### Problem
Backend is blocking requests from the frontend domain.

#### Solution
Ensure `CLIENT_URL` is set correctly in backend environment variables:

```bash
# Backend .env or production environment
CLIENT_URL=https://your-frontend-url.onrender.com
```

Check `server/server.js` line 32-35:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

---

### 4. **Static File Serving Not Configured**

#### Problem
Backend isn't serving static files from the uploads folder.

#### Solution
✅ **Already Configured** in `server/server.js` line 40:
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
```

Verify this line exists and the path is correct.

---

### 5. **Build Process Not Including Images**

#### Problem
Some deployment platforms ignore certain folders during build.

#### Solution
Create a `netlify.toml` or deployment config to include the uploads folder:

**For Netlify:**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**For Render:**
Ensure the build command includes copying uploads:
```json
{
  "buildCommand": "npm install && npm run build",
  "staticPublishPath": "./dist"
}
```

---

## Deployment Checklist

### Frontend (Client)
- [ ] `VITE_API_URL` environment variable is set
- [ ] Points to correct backend URL (no trailing slash, no `/api`)
- [ ] Build completes successfully
- [ ] `dist` folder is generated

### Backend (Server)
- [ ] `CLIENT_URL` environment variable is set
- [ ] Points to frontend URL
- [ ] `public/uploads/cars/` folder exists
- [ ] Static file serving is configured (`app.use('/uploads', ...)`)
- [ ] Images are committed to git

### Both
- [ ] CORS is properly configured
- [ ] Environment variables are set in production platform
- [ ] Latest code is deployed

---

## Testing in Production

### 1. Check Image URL
Open browser DevTools → Network tab → Look for image requests:

**Expected:**
```
https://your-backend.onrender.com/uploads/cars/car-123456.jpg
Status: 200 OK
```

**If you see:**
```
https://your-frontend.onrender.com/uploads/cars/car-123456.jpg
Status: 404 Not Found
```
→ `VITE_API_URL` is not set correctly

### 2. Check API Base URL
In browser console:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

Should output: `https://your-backend.onrender.com`

### 3. Direct Image Access
Try accessing an image directly:
```
https://your-backend.onrender.com/uploads/cars/car-1761115511235-783903212.jpg
```

If this works but images don't show in the app → Frontend issue
If this fails → Backend issue

---

## Quick Fixes

### Fix 1: Rebuild Frontend with Correct Environment Variable
```bash
# Set environment variable in deployment platform
VITE_API_URL=https://your-backend.onrender.com

# Trigger rebuild
git commit --allow-empty -m "Trigger rebuild"
git push
```

### Fix 2: Verify Backend Serves Images
```bash
# SSH into backend or check logs
curl https://your-backend.onrender.com/uploads/cars/car-123456.jpg
```

Should return image data, not 404.

### Fix 3: Check CORS
If images load when you directly visit the URL but not in the app:
```javascript
// Check browser console for CORS errors
// Should NOT see: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
```

---

## Code Verification

### ✅ Correct Image URL Handling

All components should use this pattern:

```typescript
import { API_BASE_URL } from '../config/api';

const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return '/placeholder-car.jpg';
  if (imageUrl.startsWith('http')) return imageUrl;
  if (imageUrl.startsWith('/uploads')) return `${API_BASE_URL}${imageUrl}`;
  return imageUrl;
};
```

### ❌ Incorrect (Hardcoded localhost)
```typescript
// NEVER do this:
if (imageUrl.startsWith('/uploads')) {
  return `http://localhost:3000${imageUrl}`;
}
```

---

## Files to Check

1. **`client/src/config/api.ts`** - API base URL configuration
2. **`client/vite.config.ts`** - Proxy configuration (dev only)
3. **`server/server.js`** - Static file serving
4. **`server/.env`** - Backend environment variables
5. **Production platform settings** - Environment variables

---

## Common Mistakes

1. ❌ Setting `VITE_API_URL=https://backend.com/api` (includes `/api`)
2. ❌ Setting `VITE_API_URL=https://backend.com/` (trailing slash)
3. ❌ Not setting `VITE_API_URL` at all in production
4. ❌ Hardcoding `localhost` in components
5. ❌ Not committing images to git
6. ❌ Wrong CORS origin in backend

---

## Environment Variables Reference

### Frontend (Vite)
```bash
VITE_API_URL=https://mirideservice.onrender.com
```

### Backend (Express)
```bash
CLIENT_URL=https://miride-frontend.onrender.com
PORT=3000
NODE_ENV=production
```

---

## Still Not Working?

### Debug Steps:

1. **Check browser console** for errors
2. **Check Network tab** for failed image requests
3. **Verify environment variables** are actually set in production
4. **Check backend logs** for 404 errors on `/uploads` requests
5. **Test direct image URL** in browser
6. **Compare working local vs broken production** URLs

### Get Help:
Include this information:
- Frontend URL
- Backend URL
- Sample image URL that's failing
- Browser console errors
- Network tab screenshot
- Environment variables (without sensitive data)

---

## Prevention

To prevent this issue in the future:

1. ✅ Always use `API_BASE_URL` from `config/api.ts`
2. ✅ Never hardcode `localhost` URLs
3. ✅ Test in production before marking as complete
4. ✅ Document environment variables in README
5. ✅ Use `.gitkeep` to preserve empty directories
6. ✅ Commit uploaded images to git (or use cloud storage)

---

## Related Documentation

- [IMAGE_DISPLAY_FIX.md](./IMAGE_DISPLAY_FIX.md) - Original fix documentation
- [PRODUCTION_FIXES_APPLIED.md](./PRODUCTION_FIXES_APPLIED.md) - Other production fixes
- [README.md](./README.md) - General setup instructions
