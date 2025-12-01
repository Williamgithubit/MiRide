-- Cleanup Script for User Management Issues
-- Run this in pgAdmin to clean up problematic users

-- 1. Delete the specific problematic user (Wilam Kordah)
DELETE FROM users WHERE email = 'wilmakordah@gmail.com';

-- 2. Delete all soft-deleted users (optional - only if you want to clean up)
-- DELETE FROM users WHERE deleted_at IS NOT NULL;

-- 3. Verify the user is deleted
SELECT * FROM users WHERE email = 'wilmakordah@gmail.com';
-- Should return 0 rows

-- 4. Check all users in the database
SELECT id, name, email, role, is_active, created_at, deleted_at 
FROM users 
ORDER BY created_at DESC;

-- 5. If you need to restore a soft-deleted user (set deleted_at to NULL)
-- UPDATE users SET deleted_at = NULL WHERE email = 'some@email.com';
