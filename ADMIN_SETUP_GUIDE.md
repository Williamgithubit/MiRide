# Admin User Setup Guide for Render Production Database

This guide explains how to create an admin user in your Render production database.

## Prerequisites

- ✅ Your backend is deployed on Render: `https://mirideservice.onrender.com`
- ✅ PostgreSQL database is set up on Render
- ✅ You have the `DATABASE_URL` from Render

## Option 1: Quick Setup (Recommended)

### Step 1: Get Your Database URL from Render

1. Go to your Render Dashboard
2. Click on your PostgreSQL database
3. Copy the **Internal Database URL** or **External Database URL**
4. It looks like: `postgresql://user:password@host:5432/database`

### Step 2: Add DATABASE_URL to .env

Create or update `server/.env`:

```env
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_database
```

**Important**: Use the **External Database URL** if running locally, or the **Internal Database URL** if running on Render.

### Step 3: Customize Admin Credentials

Edit `server/quickAdminSetup.js` and change these values:

```javascript
const ADMIN_CREDENTIALS = {
  name: 'Your Name',              // Change this
  email: 'youremail@example.com', // Change this
  password: 'YourSecurePassword', // Change this
  phone: '+1234567890'            // Change this
};
```

### Step 4: Install Dependencies (if needed)

```bash
cd server
npm install pg bcryptjs dotenv
```

### Step 5: Run the Script

```bash
node quickAdminSetup.js
```

You should see:

```
🚀 MiRide Quick Admin Setup
===========================

🔌 Connecting to Render database...
✅ Connected successfully!

🔐 Hashing password...
📝 Creating new admin user...

✅ Admin user created!

📋 Admin Details:
─────────────────────────────────────
   ID:         abc-123-def-456
   Name:       Your Name
   Email:      youremail@example.com
   Role:       admin
   Created:    2024-11-13 16:00:00
─────────────────────────────────────

🔐 Login Credentials:
─────────────────────────────────────
   Email:      youremail@example.com
   Password:   YourSecurePassword
─────────────────────────────────────

🌐 Login URL:
   https://miride.onrender.com/login

⚠️  IMPORTANT:
   1. Change the password after first login!
   2. Delete this script or update credentials
```

### Step 6: Login

1. Go to https://miride.onrender.com/login
2. Use the email and password you set
3. **Change your password immediately** after first login

## Option 2: Interactive Setup

If you prefer to enter credentials interactively:

### Run the Interactive Script

```bash
node createAdminProduction.js
```

This will prompt you for:
- Database URL (if not in .env)
- Admin name
- Admin email
- Admin password
- Phone number

## Troubleshooting

### Error: "DATABASE_URL not found"

**Solution**: Add your Render database URL to `server/.env`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Error: "The users table does not exist"

**Solution**: Run database migrations first:

```bash
npm run migrate
```

Or manually run migrations on Render:

1. Go to Render Dashboard → Your Web Service
2. Click "Shell" tab
3. Run: `npm run migrate`

### Error: "User already exists"

**Solution**: The script will ask if you want to update the existing user to admin. Type `yes` to proceed.

### Error: "Connection timeout"

**Solution**: 
- Make sure you're using the correct database URL
- Check if your IP is whitelisted (Render PostgreSQL allows all IPs by default)
- Verify the database is running on Render

### Error: "SSL connection required"

**Solution**: The scripts already include SSL configuration. If you still get this error, ensure you're using the External Database URL from Render.

## Security Best Practices

1. **Never commit credentials** to Git
   - Add `server/.env` to `.gitignore`
   - Never hardcode passwords in production

2. **Change default password immediately**
   - The default password is only for initial setup
   - Change it after first login

3. **Use strong passwords**
   - Minimum 8 characters
   - Include uppercase, lowercase, numbers, and symbols
   - Example: `MyS3cur3P@ssw0rd!`

4. **Delete or secure the script**
   - After creating admin, delete `quickAdminSetup.js`
   - Or remove the hardcoded credentials

5. **Limit admin access**
   - Only create admin accounts for trusted users
   - Regularly audit admin users

## Running on Render Directly

If you want to run the script directly on Render:

### Method 1: Using Render Shell

1. Go to Render Dashboard → Your Web Service
2. Click "Shell" tab
3. Run:
   ```bash
   cd server
   node quickAdminSetup.js
   ```

### Method 2: Add as Build Command

Add to your `render.yaml` or build settings:

```yaml
services:
  - type: web
    name: miride-backend
    env: node
    buildCommand: npm install && npm run migrate && node quickAdminSetup.js
    startCommand: npm start
```

**Note**: This will run on every deployment, so make sure the script handles existing users gracefully.

## Alternative: Using Render PostgreSQL Dashboard

You can also create an admin user directly in the database:

1. Go to Render Dashboard → PostgreSQL Database
2. Click "Connect" → "External Connection"
3. Use a PostgreSQL client (like pgAdmin or DBeaver)
4. Run this SQL:

```sql
-- Hash your password first using bcrypt (10 rounds)
-- You can use: https://bcrypt-generator.com/

INSERT INTO users (
  id,
  name,
  email,
  password,
  phone,
  role,
  is_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@miride.com',
  '$2a$10$YourHashedPasswordHere',  -- Use bcrypt hash
  '+1234567890',
  'admin',
  true,
  NOW(),
  NOW()
);
```

## Verification

After creating the admin user, verify it works:

1. **Test Login**:
   - Go to https://miride.onrender.com/login
   - Enter admin email and password
   - Should successfully log in

2. **Check Admin Dashboard**:
   - After login, you should see admin-specific features
   - Verify you can access admin routes

3. **Check Database**:
   ```sql
   SELECT id, name, email, role, is_verified 
   FROM users 
   WHERE role = 'admin';
   ```

## Files Created

1. **`quickAdminSetup.js`** - Quick setup with hardcoded credentials
2. **`createAdminProduction.js`** - Interactive setup with prompts
3. **`ADMIN_SETUP_GUIDE.md`** - This guide

## Next Steps

After creating your admin user:

1. ✅ Login to verify it works
2. ✅ Change the default password
3. ✅ Delete or secure the setup scripts
4. ✅ Remove `DATABASE_URL` from local `.env` (keep it on Render only)
5. ✅ Set up Cloudinary for image storage (see `RENDER_STORAGE_ISSUE.md`)

---

**Need Help?**

If you encounter any issues:
1. Check the error message carefully
2. Verify your DATABASE_URL is correct
3. Ensure migrations have been run
4. Check Render logs for any database errors

**Server URL**: https://mirideservice.onrender.com
**Frontend URL**: https://miride.onrender.com
