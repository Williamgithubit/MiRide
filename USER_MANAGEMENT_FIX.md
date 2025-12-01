# User Management Fix - Login and Delete Issues

## Problems Identified

### 1. **Double Password Hashing (Login Failure)**
**Symptom:** Users created from admin panel cannot log in, always get "Login failed"

**Root Cause:** 
- The `createUser` function in `userManagementController.js` was manually hashing the password with `bcrypt.hash()`
- The User model has a `beforeCreate` hook that also hashes the password
- Result: Password was hashed TWICE (hash of a hash), making login impossible

**Example:**
```
User enters password: "123456"
Admin creates user → bcrypt.hash("123456") = "$2a$10$abc..."
Model hook runs → bcrypt.hash("$2a$10$abc...") = "$2a$10$xyz..." (double hashed!)
User tries to login with "123456" → bcrypt.compare("123456", "$2a$10$xyz...") = FALSE ❌
```

### 2. **Soft Delete (User Still in Database)**
**Symptom:** Deleted users still appear in the database

**Root Cause:**
- User model has `paranoid: true` setting (line 63 in `/server/models/user.js`)
- This enables "soft delete" - sets `deleted_at` timestamp instead of removing the record
- The `deleteUser` function was calling `destroy()` without `force: true`

## Fixes Applied

### Fix 1: Remove Manual Password Hashing
**File:** `/server/controllers/userManagementController.js` (Line 352-360)

**Before:**
```javascript
// Hash password
const hashedPassword = await bcrypt.hash(password, 10);

// Create user
const newUser = await db.User.create({
  name,
  email,
  password: hashedPassword, // Already hashed
  role,
  phone,
  isActive
});
```

**After:**
```javascript
// Create user (password will be hashed automatically by the model hook)
const newUser = await db.User.create({
  name,
  email,
  password, // Plain password - the beforeCreate hook will hash it
  role,
  phone,
  isActive
});
```

### Fix 2: Force Hard Delete
**File:** `/server/controllers/userManagementController.js` (Line 183-184)

**Before:**
```javascript
// Delete user
await user.destroy();
```

**After:**
```javascript
// Delete user (force: true for hard delete, bypassing paranoid mode)
await user.destroy({ force: true });
```

## How to Fix Existing Problematic Users

### Option 1: Delete from Database (Recommended)
If you have users that were created with double-hashed passwords, delete them from the database:

```sql
-- Delete the problematic user (Wilam Kordah)
DELETE FROM users WHERE email = 'wilmakordah@gmail.com';

-- Or delete all soft-deleted users
DELETE FROM users WHERE deleted_at IS NOT NULL;
```

### Option 2: Reset Password
Update the password for the existing user:

```sql
-- First, get a properly hashed password
-- In Node.js console or a script:
-- const bcrypt = require('bcryptjs');
-- const hash = await bcrypt.hash('123456', 10);
-- console.log(hash);

-- Then update the user with the single-hashed password
UPDATE users 
SET password = '$2a$10$[your_single_hashed_password_here]'
WHERE email = 'wilmakordah@gmail.com';
```

### Option 3: Recreate the User
1. Delete the old user from database (SQL above)
2. Restart your server to apply the fixes
3. Create the user again from the admin panel
4. The password will now be hashed correctly (only once)

## Testing the Fix

### Step 1: Restart the Server
```bash
# Stop the server (Ctrl+C)
# Restart it
npm run dev
```

### Step 2: Clean Up Existing User
Run this SQL query in pgAdmin:
```sql
DELETE FROM users WHERE email = 'wilmakordah@gmail.com';
```

### Step 3: Create a New Test User
1. Go to Admin Dashboard → User Management
2. Click "Add New User"
3. Fill in details:
   - Name: Test User
   - Email: test@example.com
   - Password: 123456
   - Role: customer
4. Click "Create User"

### Step 4: Test Login
1. Log out from admin account
2. Go to login page
3. Enter:
   - Email: test@example.com
   - Password: 123456
4. Should successfully log in ✅

### Step 5: Test Delete
1. Log back in as admin
2. Go to User Management
3. Delete the test user
4. Check database - user should be completely removed ✅

## Understanding Paranoid Mode

The User model uses Sequelize's `paranoid: true` mode:

```javascript
// In /server/models/user.js
User.define('User', {
  // ... fields
}, {
  paranoid: true, // Enables soft delete
  underscored: true,
});
```

### What is Paranoid Mode?
- **Soft Delete:** Instead of removing records, sets `deleted_at` timestamp
- **Benefits:** Can recover deleted data, maintain referential integrity
- **Drawbacks:** Deleted records still exist in database

### Soft Delete vs Hard Delete

**Soft Delete (default):**
```javascript
await user.destroy(); // Sets deleted_at = NOW()
```

**Hard Delete (permanent):**
```javascript
await user.destroy({ force: true }); // Actually removes the record
```

### Querying with Paranoid Mode

**Include deleted records:**
```javascript
const allUsers = await db.User.findAll({ paranoid: false });
```

**Only deleted records:**
```javascript
const deletedUsers = await db.User.findAll({
  where: { deleted_at: { [Op.ne]: null } },
  paranoid: false
});
```

## Additional Improvements (Optional)

### 1. Add Logging to User Creation
```javascript
export const createUser = async (req, res) => {
  try {
    // ... existing code ...
    
    const newUser = await db.User.create({
      name,
      email,
      password,
      role,
      phone,
      isActive
    });
    
    console.log(`✅ User created: ${newUser.email} (ID: ${newUser.id})`);
    
    // ... rest of code ...
  }
};
```

### 2. Add Logging to Login Attempts
```javascript
// In authController.js
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log(`🔐 Login attempt: ${email}`);
  
  const user = await db.User.findOne({ where: { email } });
  
  if (!user) {
    console.log(`❌ User not found: ${email}`);
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  if (user.isActive === false) {
    console.log(`❌ Account deactivated: ${email}`);
    return res.status(401).json({ message: 'Account is deactivated' });
  }
  
  const isPasswordValid = await user.validPassword(password);
  
  if (!isPasswordValid) {
    console.log(`❌ Invalid password for: ${email}`);
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  console.log(`✅ Login successful: ${email}`);
  // ... rest of login logic ...
};
```

## Summary

### ✅ Fixed Issues:
1. **Double password hashing** - Removed manual hashing in createUser
2. **Soft delete** - Added `force: true` to permanently delete users

### 🔧 Required Actions:
1. **Restart server** to apply fixes
2. **Delete problematic user** from database
3. **Test creating new user** and logging in
4. **Test deleting user** to verify hard delete

### 📝 Files Modified:
- `/server/controllers/userManagementController.js`
  - Line 356: Removed manual password hashing
  - Line 184: Added `force: true` to destroy()

The user management system should now work correctly for creating, logging in, and deleting users!
