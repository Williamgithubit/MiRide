# Fix Admin Login Issue - MiRide Production

## Problem
The admin login is failing with "Login failed" error even though the credentials are correct.

## Root Cause Analysis
After analyzing the code and database, the issue is likely one of the following:

1. **Bcrypt hash mismatch** - The hash in the database doesn't match the password
2. **Column name mismatch** - Database uses snake_case but code expects camelCase (though this should be handled by Sequelize's `underscored: true`)
3. **Role enum mismatch** - The role value in database doesn't match expected enum values

## Solution

### Option 1: Generate and Update Password Hash (RECOMMENDED)

1. **Generate a new bcrypt hash locally:**
   ```bash
   cd server
   node generate_admin_hash.js
   ```

2. **Copy the SQL UPDATE statement** from the output

3. **Run it in your Render database** via pgAdmin or Render's SQL console

### Option 2: Delete and Re-insert Admin User

Run this SQL in your Render database:

```sql
-- Delete existing admin user
DELETE FROM users WHERE email = 'admin@miride.com';

-- Insert fresh admin user
INSERT INTO users (
    id,
    name,
    email,
    phone,
    password,
    role,
    is_active,
    terms_accepted,
    terms_accepted_at,
    created_at,
    updated_at
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

-- Verify
SELECT id, name, email, role, is_active FROM users WHERE email = 'admin@miride.com';
```

### Option 3: Use a Simpler Password Temporarily

If the bcrypt hash is the issue, try using a simpler password first:

1. Generate hash for a simple password like "password123":
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('password123', 10).then(h => console.log(h));"
   ```

2. Update the database:
   ```sql
   UPDATE users SET password = '<generated_hash>' WHERE email = 'admin@miride.com';
   ```

3. Try logging in with the simple password

4. Once logged in, change to a secure password through the app

## Verification Steps

After applying the fix:

1. Check the database to confirm the user exists:
   ```sql
   SELECT id, email, role, is_active, password FROM users WHERE email = 'admin@miride.com';
   ```

2. Verify the password field is not null and starts with `$2a$` or `$2b$`

3. Verify `is_active` is `true` (or `1` in MySQL)

4. Verify `role` is exactly `'admin'`

5. Try logging in at: https://miride.onrender.com/login

## Additional Debugging

If the issue persists, check your server logs on Render for more detailed error messages:

1. Go to Render Dashboard
2. Select your web service
3. Click on "Logs"
4. Look for errors around the time you try to login

The logs should show:
- "Login attempt for email: admin@miride.com"
- Any database errors
- Password validation results

## Contact
If none of these solutions work, the issue might be with:
- Database connection/configuration
- Bcrypt library version mismatch
- Server environment variables

Check your `.env` or Render environment variables to ensure database connection is correct.
