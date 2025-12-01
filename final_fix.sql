-- FINAL FIX - Complete Commission Flow Repair
-- This script will fix everything in the correct order

-- ========================================
-- STEP 1: Update rentals with commission (10% platform, 90% owner)
-- ========================================
UPDATE rentals
SET 
    platform_fee = ROUND(total_amount * 0.10, 2),
    owner_payout = ROUND(total_amount * 0.90, 2)
WHERE total_amount > 0;

-- Verify rentals
SELECT 'Rentals Updated' as step, COUNT(*) as count FROM rentals WHERE platform_fee IS NOT NULL;

-- ========================================
-- STEP 2: Clear any bad payment records
-- ========================================
DELETE FROM payments;

-- ========================================
-- STEP 3: Create payment records with proper data
-- ========================================
INSERT INTO payments (
    id,
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
    gen_random_uuid(),
    r.id,
    r.owner_id,
    r.customer_id,
    COALESCE(r.payment_intent_id, 'manual_rental_' || r.id),
    r.total_amount,
    r.platform_fee,
    r.owner_payout,
    'usd',
    'succeeded'::enum_payments_payment_status,
    'paid'::enum_payments_payout_status,
    r.created_at,
    NOW()
FROM rentals r
WHERE r.payment_status = 'paid'
  AND r.total_amount > 0
  AND r.platform_fee IS NOT NULL
  AND r.owner_payout IS NOT NULL;

-- Verify payments created
SELECT 'Payments Created' as step, COUNT(*) as count FROM payments;

-- Show payment details
SELECT 
    id,
    rental_id,
    owner_id,
    total_amount,
    platform_fee,
    owner_amount,
    payment_status
FROM payments
ORDER BY created_at DESC;

-- ========================================
-- STEP 4: Update owner profiles
-- ========================================
UPDATE owner_profiles op
SET 
    total_earnings = (
        SELECT COALESCE(SUM(owner_amount), 0)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status = 'succeeded'::enum_payments_payment_status
    ),
    available_balance = (
        SELECT COALESCE(SUM(owner_amount), 0)
        FROM payments
        WHERE owner_id = op.user_id
        AND payment_status = 'succeeded'::enum_payments_payment_status
    ),
    pending_balance = 0;

-- Verify owner profiles updated
SELECT 'Owner Profiles Updated' as step, COUNT(*) as count FROM owner_profiles WHERE total_earnings > 0;

-- ========================================
-- STEP 5: Show final results
-- ========================================

-- Platform summary
SELECT 
    'PLATFORM TOTALS' as summary_type,
    COUNT(*) as total_payments,
    SUM(total_amount) as total_revenue,
    SUM(platform_fee) as platform_commission,
    SUM(owner_amount) as owner_payouts
FROM payments
WHERE payment_status = 'succeeded'::enum_payments_payment_status;

-- Owner summary
SELECT 
    'OWNER EARNINGS' as summary_type,
    u.name as owner_name,
    COUNT(p.id) as bookings,
    SUM(p.total_amount) as total_revenue,
    SUM(p.platform_fee) as commission_paid,
    SUM(p.owner_amount) as earnings,
    op.available_balance
FROM users u
INNER JOIN owner_profiles op ON u.id = op.user_id
LEFT JOIN payments p ON u.id = p.owner_id 
    AND p.payment_status = 'succeeded'::enum_payments_payment_status
WHERE u.role = 'owner'
GROUP BY u.id, u.name, op.available_balance
ORDER BY earnings DESC;

-- Detailed breakdown
SELECT 
    r.id as rental_id,
    c.name as customer,
    o.name as owner,
    r.total_amount,
    r.platform_fee as rental_platform_fee,
    r.owner_payout as rental_owner_payout,
    p.platform_fee as payment_platform_fee,
    p.owner_amount as payment_owner_amount,
    r.status,
    r.payment_status
FROM rentals r
LEFT JOIN users c ON r.customer_id = c.id
LEFT JOIN users o ON r.owner_id = o.id
LEFT JOIN payments p ON r.id = p.rental_id
ORDER BY r.created_at DESC;
