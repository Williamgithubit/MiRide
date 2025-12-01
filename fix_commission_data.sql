-- Fix Commission Data for Existing Records
-- This script calculates and updates commission fields for existing payments and rentals

-- ========================================
-- STEP 1: Update RENTALS table with commission split (10% platform, 90% owner)
-- ========================================
UPDATE rentals
SET 
    platform_fee = ROUND(total_amount * 0.10, 2),
    owner_payout = ROUND(total_amount * 0.90, 2)
WHERE platform_fee IS NULL OR owner_payout IS NULL;

-- Verify rentals update
SELECT 
    id,
    total_amount,
    platform_fee,
    owner_payout,
    status,
    payment_status
FROM rentals
ORDER BY created_at DESC;

-- ========================================
-- STEP 2: Update PAYMENTS table with commission split (10% platform, 90% owner)
-- ========================================
UPDATE payments
SET 
    platform_fee = ROUND(total_amount * 0.10, 2),
    owner_amount = ROUND(total_amount * 0.90, 2)
WHERE platform_fee IS NULL OR owner_amount IS NULL;

-- Verify payments update
SELECT 
    id,
    rental_id,
    total_amount,
    platform_fee,
    owner_amount,
    payment_status
FROM payments
ORDER BY created_at DESC;

-- ========================================
-- STEP 3: Update OWNER_PROFILES with correct earnings
-- ========================================
-- Calculate total earnings for each owner
UPDATE owner_profiles op
SET 
    total_earnings = COALESCE((
        SELECT SUM(owner_amount)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status = 'succeeded'
    ), 0),
    available_balance = COALESCE((
        SELECT SUM(owner_amount)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status = 'succeeded'
    ), 0) - COALESCE((
        SELECT SUM(amount)
        FROM withdrawals
        WHERE user_id = op.user_id
        AND type = 'owner'
        AND status = 'completed'
    ), 0);

-- Verify owner profiles update
SELECT 
    user_id,
    total_earnings,
    available_balance,
    pending_balance
FROM owner_profiles
ORDER BY created_at DESC;

-- ========================================
-- STEP 4: Verify the commission split is correct
-- ========================================
SELECT 
    'Rentals' as table_name,
    COUNT(*) as total_records,
    SUM(total_amount) as total_amount,
    SUM(platform_fee) as total_platform_fee,
    SUM(owner_payout) as total_owner_payout,
    ROUND(SUM(platform_fee) / NULLIF(SUM(total_amount), 0) * 100, 2) as platform_percentage
FROM rentals
WHERE payment_status = 'paid'

UNION ALL

SELECT 
    'Payments' as table_name,
    COUNT(*) as total_records,
    SUM(total_amount) as total_amount,
    SUM(platform_fee) as total_platform_fee,
    SUM(owner_amount) as total_owner_payout,
    ROUND(SUM(platform_fee) / NULLIF(SUM(total_amount), 0) * 100, 2) as platform_percentage
FROM payments
WHERE payment_status = 'succeeded';

-- ========================================
-- STEP 5: Show summary by owner
-- ========================================
SELECT 
    u.id as owner_id,
    u.name as owner_name,
    u.email,
    COUNT(p.id) as total_bookings,
    SUM(p.total_amount) as total_revenue,
    SUM(p.platform_fee) as platform_commission,
    SUM(p.owner_amount) as owner_earnings,
    op.available_balance
FROM users u
LEFT JOIN payments p ON u.id = p.owner_id AND p.payment_status = 'succeeded'
LEFT JOIN owner_profiles op ON u.id = op.user_id
WHERE u.role = 'owner'
GROUP BY u.id, u.name, u.email, op.available_balance
ORDER BY owner_earnings DESC;

-- ========================================
-- STEP 6: Show platform totals
-- ========================================
SELECT 
    COUNT(*) as total_succeeded_payments,
    SUM(total_amount) as total_revenue,
    SUM(platform_fee) as platform_commission,
    SUM(owner_amount) as owner_payouts,
    ROUND(SUM(platform_fee) / NULLIF(SUM(total_amount), 0) * 100, 2) as commission_percentage
FROM payments
WHERE payment_status = 'succeeded';
