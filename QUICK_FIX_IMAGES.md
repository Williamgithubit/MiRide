# 🚨 Quick Fix: Images Not Displaying in Production

## The Problem

Images show in development but not in production.

## The Solution (90% of cases)

### Step 1: Set Environment Variable

In your **frontend** deployment platform (Render/Netlify/Vercel):

```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

If you're using Render (static site or web service) for the frontend:

- Go to your frontend service in the Render dashboard
- Open the "Environment" tab (or "Environment > Environment Variables")
- Add a new variable named `VITE_API_URL` with value `https://your-backend-url.onrender.com`
- Save and trigger a new deploy/build of the frontend service

If your backend stores uploads in `public/uploads`, ensure the backend deployment includes that folder or use persistent object storage (S3) and save absolute URLs in the DB.

⚠️ **Important:**

- Replace `your-backend-url.onrender.com` with your actual backend URL
- NO trailing slash: ❌ `https://backend.com/`
- NO `/api` suffix: ❌ `https://backend.com/api`
- Just the domain: ✅ `https://backend.com`

### Step 2: Rebuild Frontend

```bash
git add .
git commit -m "Fix image display"
git push
```

### Step 3: Verify

Open browser console in production:

```javascript
console.log(import.meta.env.VITE_API_URL);
```

Should show: `https://your-backend-url.onrender.com`

## Still Not Working?

### Check Backend Environment Variable

In your **backend** deployment platform:

```bash
CLIENT_URL=https://your-frontend-url.onrender.com
```

### Test Direct Image Access

Visit in browser:

```
https://your-backend-url.onrender.com/uploads/cars/car-1761115511235-783903212.jpg
```

- ✅ Image loads → Frontend issue (check `VITE_API_URL`)
- ❌ 404 Error → Backend issue (check static file serving)

## Need More Help?

See detailed guide: `IMAGE_PRODUCTION_TROUBLESHOOTING.md`

---

## Environment Variables Cheat Sheet

### Frontend (Vite/React)

```bash
VITE_API_URL=https://mirideservice.onrender.com
```

### Backend (Express/Node)

```bash
CLIENT_URL=https://miride-frontend.onrender.com
PORT=3000
NODE_ENV=production
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=your-stripe-key
```

---

## Common Mistakes

1. ❌ Forgetting to set `VITE_API_URL`
2. ❌ Adding trailing slash: `https://backend.com/`
3. ❌ Adding `/api`: `https://backend.com/api`
4. ❌ Not rebuilding frontend after setting variable
5. ❌ Setting variable in backend instead of frontend

---

## Quick Checklist

- [ ] `VITE_API_URL` set in **frontend** deployment
- [ ] `CLIENT_URL` set in **backend** deployment
- [ ] Frontend rebuilt after setting variable
- [ ] No trailing slash in URLs
- [ ] No `/api` suffix in `VITE_API_URL`
- [ ] Images committed to git
- [ ] Browser console shows correct `VITE_API_URL`

---

**That's it!** 🎉 Images should now display in production.
