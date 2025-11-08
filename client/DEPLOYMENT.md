# Deployment Guide

## Environment Configuration

### Production Environment Variables

When deploying to production (e.g., Render, Netlify, Vercel), you need to set the following environment variable:

```bash
VITE_API_URL=https://mirideservice.onrender.com
```

**IMPORTANT:** Do NOT include `/api` at the end of the URL. The API services automatically append `/api` to the base URL.

### Development Environment

For local development, you don't need to set `VITE_API_URL`. The Vite proxy (configured in `vite.config.ts`) will automatically forward API requests to `http://localhost:3000`.

## How It Works

1. **Development Mode:**
   - `VITE_API_URL` is empty/undefined
   - API calls use relative paths (e.g., `/api/cars`)
   - Vite proxy forwards these to `http://localhost:3000`
   - Final URL: `http://localhost:3000/api/cars` ✅

2. **Production Mode:**
   - `VITE_API_URL=https://mirideservice.onrender.com`
   - API calls use: `${API_BASE_URL}/api/cars`
   - Final URL: `https://mirideservice.onrender.com/api/cars` ✅

## Render Deployment

### Frontend (Client)

1. Go to your Render dashboard
2. Select your frontend service
3. Navigate to "Environment" tab
4. Add environment variable:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://mirideservice.onrender.com` (your backend URL)

### Backend (Server)

Ensure your backend has the following environment variables:
- `CLIENT_URL` - Your frontend URL (for CORS)
- `PORT` - Port number (usually 3000 or set by Render)
- Database credentials and other backend-specific variables

## Testing Production Build Locally

To test the production build locally:

```bash
# Build the client
npm run build

# Preview the build
npm run preview
```

Set the environment variable before building:
```bash
# Windows
set VITE_API_URL=https://mirideservice.onrender.com
npm run build

# Linux/Mac
VITE_API_URL=https://mirideservice.onrender.com npm run build
```

## Common Issues

### Issue: "Unexpected token '<'" error
**Cause:** API requests are returning HTML instead of JSON
**Solution:** Ensure `VITE_API_URL` is set correctly without `/api` suffix

### Issue: CORS errors
**Cause:** Backend `CLIENT_URL` doesn't match your frontend URL
**Solution:** Update `CLIENT_URL` in backend environment variables

### Issue: 404 on API routes
**Cause:** Backend routes not properly configured
**Solution:** Verify backend is running and routes are accessible
