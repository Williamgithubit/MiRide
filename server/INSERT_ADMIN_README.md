# Admin User SQL Insert Guide

This guide explains how to manually insert an admin user into the database using SQL with a bcrypt-hashed password.

## Files Created

1. **`insert_admin.sql`** - SQL script to insert admin user
2. **`generate_password_hash.js`** - Node.js script to generate bcrypt password hash
3. **`INSERT_ADMIN_README.md`** - This file

## Quick Start

### Step 1: Generate Password Hash

Run the password hash generator:

```bash
node generate_password_hash.js
```

Or with a custom password:

```bash
ADMIN_PASSWORD="YourSecurePassword123!" node generate_password_hash.js
```

This will output:
- The bcrypt hash
- A complete SQL INSERT statement ready to use

### Step 2: Update SQL File (Optional)

If you want to use the `insert_admin.sql` file:

1. Copy the generated hash from Step 1
2. Open `insert_admin.sql`
3. Replace the placeholder hash on line 35 with your generated hash
4. Save the file

### Step 3: Execute SQL

#### For PostgreSQL:

```bash
# Using psql command line
psql -U your_username -d your_database_name -f insert_admin.sql

# Or connect to psql and run:
psql -U your_username -d your_database_name
\i insert_admin.sql
```

#### For MySQL:

```bash
# Using mysql command line
mysql -u your_username -p your_database_name < insert_admin.sql

# Or connect to mysql and run:
mysql -u your_username -p your_database_name
source insert_admin.sql;
```

#### Using Database GUI Tools:

- **pgAdmin** (PostgreSQL): Open Query Tool → Paste SQL → Execute
- **MySQL Workbench**: Open SQL Editor → Paste SQL → Execute
- **DBeaver**: Open SQL Editor → Paste SQL → Execute (Ctrl+Enter)
- **TablePlus**: Open SQL Query → Paste SQL → Run

## Default Credentials

After inserting the admin user, you can log in with:

- **Email**: `admin@miride.com`
- **Password**: `Admin@123456` (or your custom password)

⚠️ **IMPORTANT**: Change the password immediately after first login!

## SQL Script Details

The `insert_admin.sql` script:

- Creates a new admin user with UUID
- Uses bcrypt-hashed password (10 rounds)
- Sets role to 'admin'
- Activates the account
- Accepts terms automatically
- Uses `ON CONFLICT` to update existing user if email already exists

## Customization

### Change Admin Details

Edit the VALUES in `insert_admin.sql`:

```sql
VALUES (
    gen_random_uuid(),
    'Your Admin Name',        -- Change name
    'youremail@domain.com',   -- Change email
    '+1234567890',            -- Change phone
    '$2a$10$...',             -- Your bcrypt hash
    'admin',
    true,
    true,
    NOW(),
    NOW(),
    NOW()
)
```

### Generate Hash for Different Password

```bash
# Method 1: Using environment variable
ADMIN_PASSWORD="MyNewPassword123!" node generate_password_hash.js

# Method 2: Using Node.js directly
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('MyNewPassword123!', 10).then(hash => console.log(hash));"
```

## Troubleshooting

### Error: "duplicate key value violates unique constraint"

The email already exists. The script will automatically update the existing user to admin role.

### Error: "gen_random_uuid() function does not exist"

**For MySQL**, replace `gen_random_uuid()` with `UUID()`:

```sql
VALUES (
    UUID(),  -- For MySQL
    ...
)
```

### Error: "syntax error near ON CONFLICT"

**For MySQL**, replace the ON CONFLICT clause with:

```sql
ON DUPLICATE KEY UPDATE
    role = 'admin',
    is_active = true,
    updated_at = NOW();
```

### Password Not Working

1. Verify the hash was generated correctly
2. Ensure you copied the complete hash (starts with `$2a$10$` or `$2b$10$`)
3. Check there are no extra spaces or line breaks
4. Try generating a new hash

## Security Notes

1. **Never commit** SQL files with real passwords or hashes to version control
2. **Change the default password** immediately after first login
3. **Use strong passwords** (minimum 12 characters, mix of upper/lower/numbers/symbols)
4. **Limit admin access** to trusted personnel only
5. **Enable 2FA** if available in your application

## Alternative: Using createAdmin.js Script

Instead of SQL, you can use the Node.js script:

```bash
# Set environment variables in .env file
ADMIN_EMAIL=admin@miride.com
ADMIN_PASSWORD=Admin@123456
ADMIN_NAME=Admin User
ADMIN_PHONE=+231778711864

# Run the script
node createAdmin.js
```

This method is recommended as it:
- Automatically hashes the password
- Validates the data
- Handles existing users
- Provides better error messages

## Verification

After inserting the admin user, verify with:

```sql
SELECT id, name, email, role, is_active, created_at
FROM users
WHERE email = 'admin@miride.com';
```

You should see:
- Role: `admin`
- is_active: `true`
- A valid UUID for id
- Current timestamp for created_at

## Support

If you encounter issues:
1. Check the database logs
2. Verify database connection settings
3. Ensure the users table exists
4. Check PostgreSQL/MySQL version compatibility
5. Review the error messages carefully

---

**Created**: December 2025  
**For**: MiRide Car Rental Application  
**Database**: PostgreSQL (with MySQL notes)
