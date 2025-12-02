# 🚀 Quick Fix Guide - Admin Login Issue

## The Problem
You're getting "Login failed" when trying to log in with `admin@miride.com` / `Admin@123456`

## The Solution (Choose ONE)

### ✅ FASTEST FIX - Run This SQL in Render Database

Open your Render database console (pgAdmin or Render SQL tab) and run:

```sql
-- Delete the problematic admin user
DELETE FROM users WHERE email = 'admin@miride.com';

-- Insert a fresh admin user
INSERT INTO users (
    id, name, email, phone, password, role, is_active, 
    terms_accepted, terms_accepted_at, created_at, updated_at
) VALUES (
    UUID(),
    'Admin User',
    'admin@miride.com',
    '+231778711864',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'admin',
    true,
    true,
    NOW(),
    NOW(),
    NOW()
);
```

Then try logging in again with:
- **Email:** admin@miride.com
- **Password:** Admin@123456

---

### 🔧 ALTERNATIVE - Generate New Hash

If the above doesn't work, the bcrypt hash might be incompatible. Generate a fresh one:

1. **Run locally:**
   ```bash
   cd c:\Users\willi\Desktop\MiRide\server
   node generate_admin_hash.js
   ```

2. **Copy the SQL UPDATE statement** from the output

3. **Run it in your Render database**

---

## Verify It Worked

After running the SQL, check:

```sql
SELECT id, email, role, is_active, LEFT(password, 20) as pwd_preview 
FROM users 
WHERE email = 'admin@miride.com';
```

You should see:
- ✅ `role` = `admin`
- ✅ `is_active` = `true` (or `1`)
- ✅ `pwd_preview` starts with `$2a$10$` or `$2b$10$`

---

## Still Not Working?

1. **Check server logs** on Render for detailed error messages
2. **Verify database connection** - ensure your app is connected to the right database
3. **Check environment variables** - `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` must be correct
4. **Try a simpler password** temporarily to isolate the bcrypt issue

---

## Files Created for You

- `FIX_ADMIN_LOGIN.md` - Detailed troubleshooting guide
- `generate_admin_hash.js` - Script to generate new password hash
- `update_admin_password.sql` - SQL script to update password
- `verify_password.js` - Script to test password hashes

---

## Need More Help?

Check the detailed guide: `FIX_ADMIN_LOGIN.md`
