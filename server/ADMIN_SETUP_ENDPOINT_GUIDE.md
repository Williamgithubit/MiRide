# 🔐 Admin Setup Endpoint - Usage Guide

## Overview

A secure API endpoint to create/update admin credentials in production without direct database access.

## 🔑 Setup

### 1. Set Environment Variable

Add this to your Render environment variables:

```
ADMIN_SETUP_SECRET=your-super-secret-key-here-change-this
```

**⚠️ IMPORTANT:** 
- Use a strong, random secret key (at least 32 characters)
- Never commit this to Git
- Keep it secure - anyone with this key can create admin users

### 2. Generate a Strong Secret

You can generate one using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📡 API Endpoints

### 1. Health Check

Test if the endpoint is working:

```bash
GET https://miride.onrender.com/api/admin-setup/health
```

**Response:**
```json
{
  "success": true,
  "message": "Admin setup endpoint is active",
  "timestamp": "2025-12-02T19:41:00.000Z"
}
```

---

### 2. Create/Update Admin User

**Endpoint:** `POST https://miride.onrender.com/api/admin-setup/create-admin`

**Request Body:**
```json
{
  "secret": "your-super-secret-key-here-change-this",
  "email": "admin@miride.com",
  "password": "Admin@123456",
  "name": "Admin User",
  "phone": "+231778711864"
}
```

**Success Response (201/200):**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "user": {
    "id": "uuid-here",
    "email": "admin@miride.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

**Error Response (403):**
```json
{
  "message": "Forbidden: Invalid setup secret"
}
```

---

### 3. Verify Password (Debug)

Test if a password matches the stored hash:

**Endpoint:** `POST https://miride.onrender.com/api/admin-setup/verify-password`

**Request Body:**
```json
{
  "secret": "your-super-secret-key-here-change-this",
  "email": "admin@miride.com",
  "password": "Admin@123456"
}
```

**Response:**
```json
{
  "success": true,
  "email": "admin@miride.com",
  "passwordMatch": true,
  "message": "Password is correct",
  "userDetails": {
    "id": "uuid-here",
    "name": "Admin User",
    "role": "admin",
    "isActive": true
  }
}
```

---

## 🚀 Quick Usage Examples

### Using cURL

```bash
# Create admin user
curl -X POST https://miride.onrender.com/api/admin-setup/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-super-secret-key-here-change-this",
    "email": "admin@miride.com",
    "password": "Admin@123456",
    "name": "Admin User",
    "phone": "+231778711864"
  }'
```

### Using Postman

1. **Method:** POST
2. **URL:** `https://miride.onrender.com/api/admin-setup/create-admin`
3. **Headers:** 
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "secret": "your-super-secret-key-here-change-this",
     "email": "admin@miride.com",
     "password": "Admin@123456",
     "name": "Admin User",
     "phone": "+231778711864"
   }
   ```

### Using JavaScript (fetch)

```javascript
fetch('https://miride.onrender.com/api/admin-setup/create-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    secret: 'your-super-secret-key-here-change-this',
    email: 'admin@miride.com',
    password: 'Admin@123456',
    name: 'Admin User',
    phone: '+231778711864'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## 🔒 Security Features

1. **Secret Key Protection:** Requires `ADMIN_SETUP_SECRET` environment variable
2. **No Double Hashing:** Manually hashes passwords to avoid bcrypt issues
3. **Hooks Disabled:** Bypasses Sequelize hooks that could cause problems
4. **Logging:** All attempts are logged for security monitoring
5. **Update Existing:** Safely updates existing admin users

---

## 📝 Step-by-Step Production Setup

### Step 1: Set Environment Variable on Render

1. Go to your Render dashboard
2. Select your web service
3. Click "Environment" tab
4. Add new environment variable:
   - **Key:** `ADMIN_SETUP_SECRET`
   - **Value:** `<your-generated-secret>`
5. Click "Save Changes"

### Step 2: Deploy the Code

```bash
git add .
git commit -m "Add admin setup endpoint"
git push origin main
```

Wait for Render to deploy.

### Step 3: Test Health Check

```bash
curl https://miride.onrender.com/api/admin-setup/health
```

### Step 4: Create Admin User

Use cURL, Postman, or any HTTP client to POST to:
```
https://miride.onrender.com/api/admin-setup/create-admin
```

### Step 5: Verify Login

Go to `https://miride.onrender.com/login` and try logging in with:
- Email: `admin@miride.com`
- Password: `Admin@123456`

### Step 6: (Optional) Disable Endpoint

After creating the admin, you can:
1. Remove the route from `server.js`
2. Or keep it for future admin management (recommended)

---

## ⚠️ Troubleshooting

### "Forbidden: Invalid setup secret"
- Check your `ADMIN_SETUP_SECRET` environment variable
- Ensure it matches exactly (no extra spaces)
- Restart your Render service after changing env vars

### "Internal server error"
- Check Render logs for detailed error messages
- Verify database connection is working
- Ensure all required fields are provided

### Password still doesn't work after creation
- Use the `/verify-password` endpoint to debug
- Check if bcrypt is installed: `npm list bcryptjs`
- Verify the user was created: check database directly

---

## 🎯 Best Practices

1. **Change the secret immediately** after first use
2. **Use strong passwords** for admin accounts
3. **Keep the secret secure** - treat it like a database password
4. **Monitor logs** for unauthorized access attempts
5. **Consider disabling** the endpoint after initial setup if not needed
6. **Use HTTPS only** - never send the secret over HTTP

---

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test with the health check endpoint first
4. Use the verify-password endpoint to debug

---

## 🗑️ Removing the Endpoint (Optional)

If you want to disable this endpoint after setup:

1. Comment out in `server.js`:
   ```javascript
   // app.use('/api/admin-setup', adminSetupRoutes);
   ```

2. Or add additional security checks in the controller

3. Redeploy to Render
