# Admin User Setup Guide

This guide explains how to create an admin user for the MiRide application.

## Prerequisites

- Database must be set up and running
- Environment variables must be configured in `.env` file
- Database migrations must be completed (`npm run migrate`)

## Methods to Create Admin User

### Method 1: Interactive Script (Recommended)

This method prompts you for all required information interactively.

```bash
cd server
npm run create-admin-interactive
```

You will be asked to provide:
- Full Name
- Email
- Phone (optional)
- Password
- Password confirmation

**Advantages:**
- User-friendly and guided
- Input validation
- Password confirmation
- Can upgrade existing users to admin

### Method 2: Quick Script with Predefined Credentials

This method uses predefined credentials in the script file.

1. **Edit the credentials** in `createAdmin.js`:
   ```javascript
   const adminData = {
     name: 'Admin User',           // Change this
     email: 'admin@miride.com',    // Change this
     phone: '+1234567890',         // Change this
     password: 'Admin@123456',     // Change this to a secure password
     role: 'admin',
     isActive: true
   };
   ```

2. **Run the script:**
   ```bash
   cd server
   npm run create-admin
   ```

**Advantages:**
- Quick and automated
- Good for development/testing
- Can be used in deployment scripts

## Security Best Practices

1. **Use Strong Passwords:**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, and special characters
   - Example: `Admin@SecurePass2024!`

2. **Change Default Credentials:**
   - If using the quick script, always change the default password
   - Update credentials immediately after first login

3. **Protect Admin Credentials:**
   - Never commit credentials to version control
   - Store securely (use password managers)
   - Limit admin access to trusted personnel

4. **Email Verification:**
   - Use a valid email address
   - Ensure you have access to this email

## Troubleshooting

### Database Connection Error
```
❌ Unable to connect to the database
```
**Solution:** Check your `.env` file and ensure database credentials are correct.

### User Already Exists
```
⚠️ Admin user with this email already exists!
```
**Solution:** 
- Use a different email, or
- Choose to upgrade the existing user to admin when prompted

### Validation Errors
```
❌ Validation error: email must be unique
```
**Solution:** The email is already in use. Use a different email address.

## Verifying Admin Creation

After creating the admin user, you can verify by:

1. **Logging into the application:**
   - Navigate to the login page
   - Use the admin email and password
   - You should have access to the admin dashboard

2. **Checking the database:**
   ```sql
   SELECT id, name, email, role, is_active FROM users WHERE role = 'admin';
   ```

## Default Admin Credentials (Development Only)

If you used the quick script without modifications:

- **Email:** `admin@miride.com`
- **Password:** `Admin@123456`

⚠️ **WARNING:** Change these credentials immediately in production!

## Admin User Capabilities

Admin users have access to:
- Admin Dashboard
- User Management (view, edit, deactivate users)
- Car Management (view, approve, manage all cars)
- Booking Management (view, manage all bookings)
- System Settings
- Analytics and Reports

## Need Help?

If you encounter issues:
1. Check the console output for specific error messages
2. Verify database connection and migrations
3. Ensure all environment variables are set correctly
4. Check the server logs for detailed error information
