-- Fix Existing Bookings - Complete Solution
-- Run this script to fix all existing bookings with proper commission split

-- ========================================
-- STEP 1: Update rentals with commission split
-- ========================================
UPDATE rentals
SET 
    platform_fee = ROUND(total_amount * 0.10, 2),
    owner_payout = ROUND(total_amount * 0.90, 2)
WHERE (platform_fee IS NULL OR platform_fee = 0)
  AND total_amount > 0;

-- Verify rentals were updated
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
-- STEP 2: Delete any incomplete payment records
-- ========================================
DELETE FROM payments 
WHERE platform_fee IS NULL OR owner_amount IS NULL;

-- ========================================
-- STEP 3: Create proper payment records
-- ========================================
INSERT INTO payments (
    rental_id,
    owner_id,
    customer_id,
    stripe_payment_intent_id,
    total_amount,
    platform_fee,
    owner_amount,
    currency,
    payment_status,
    payout_status,
    created_at,
    updated_at
)
SELECT 
    r.id,
    r.owner_id,
    r.customer_id,
    COALESCE(r.payment_intent_id, 'manual_' || r.id),
    r.total_amount,
    r.platform_fee,
    r.owner_payout,
    'usd',
    CAST('succeeded' AS enum_payments_payment_status),
    CAST('paid' AS enum_payments_payout_status),
    r.created_at,
    NOW()
FROM rentals r
LEFT JOIN payments p ON r.id = p.rental_id
WHERE p.id IS NULL
  AND r.payment_status = 'paid'
  AND r.platform_fee IS NOT NULL
  AND r.owner_payout IS NOT NULL;

-- Verify payments were created
SELECT 
    id,
    rental_id,
    owner_id,
    total_amount,
    platform_fee,
    owner_amount,
    payment_status,
    created_at
FROM payments
ORDER BY created_at DESC;

-- ========================================
-- STEP 4: Update owner profiles with earnings
-- ========================================
UPDATE owner_profiles op
SET 
    total_earnings = COALESCE((
        SELECT SUM(owner_amount)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status = CAST('succeeded' AS enum_payments_payment_status)
    ), 0),
    available_balance = COALESCE((
        SELECT SUM(owner_amount)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status = CAST('succeeded' AS enum_payments_payment_status)
    ), 0) - COALESCE((
        SELECT SUM(amount)
        FROM withdrawals
        WHERE user_id = op.user_id
        AND type = 'owner'
        AND status = 'completed'
    ), 0),
    pending_balance = COALESCE((
        SELECT SUM(owner_amount)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status IN (
            CAST('processing' AS enum_payments_payment_status),
            CAST('pending' AS enum_payments_payment_status)
        )
    ), 0);

-- Verify owner profiles
SELECT 
    user_id,
    total_earnings,
    available_balance,
    pending_balance,
    total_withdrawn
FROM owner_profiles
ORDER BY created_at DESC;

-- ========================================
-- STEP 5: Show final summary
-- ========================================

-- Platform summary
SELECT 
    'Platform Commission' as description,
    COUNT(*) as payment_count,
    SUM(total_amount) as total_revenue,
    SUM(platform_fee) as platform_commission,
    SUM(owner_amount) as owner_payouts,
    ROUND(AVG(platform_fee / NULLIF(total_amount, 0) * 100), 2) as avg_commission_pct
FROM payments
WHERE payment_status = CAST('succeeded' AS enum_payments_payment_status);

-- Owner summary
SELECT 
    u.id as owner_id,
    u.name as owner_name,
    COUNT(p.id) as total_bookings,
    SUM(p.total_amount) as total_revenue,
    SUM(p.platform_fee) as platform_commission,
    SUM(p.owner_amount) as owner_earnings,
    op.available_balance
FROM users u
LEFT JOIN payments p ON u.id = p.owner_id 
    AND p.payment_status = CAST('succeeded' AS enum_payments_payment_status)
LEFT JOIN owner_profiles op ON u.id = op.user_id
WHERE u.role = 'owner'
GROUP BY u.id, u.name, op.available_balance
ORDER BY owner_earnings DESC;
