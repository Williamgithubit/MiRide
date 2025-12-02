-- ============================================
-- UPDATE Admin Password - MiRide Production
-- ============================================
-- Run this script in your Render MySQL database
-- This will update the existing admin user's password
-- ============================================

-- Option 1: Update with the original hash
UPDATE users 
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    role = 'admin',
    is_active = true,
    updated_at = NOW()
WHERE email = 'admin@miride.com';

-- Verify the update worked
SELECT 
    id,
    name,
    email,
    role,
    is_active,
    LEFT(password, 20) as password_preview,
    created_at,
    updated_at
FROM users
WHERE email = 'admin@miride.com';

-- ============================================
-- Expected Result:
-- - role should be: admin
-- - is_active should be: 1 (true)
-- - password_preview should start with: $2a$10$N9qo8uLOickgx
-- ============================================

-- If the above doesn't work, try deleting and re-inserting:
-- DELETE FROM users WHERE email = 'admin@miride.com';
-- Then run the insert_admin_mysql.sql script again
