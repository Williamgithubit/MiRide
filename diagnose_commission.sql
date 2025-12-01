-- Comprehensive Commission Flow Diagnostic Script
-- Run this in pgAdmin to diagnose the commission issue

-- ========================================
-- 1. CHECK USERS AND ROLES
-- ========================================
SELECT 
    id,
    name,
    email,
    role,
    is_active
FROM users
WHERE role IN ('owner', 'admin')
ORDER BY created_at DESC;

-- ========================================
-- 2. CHECK OWNER PROFILES
-- ========================================
SELECT 
    user_id,
    stripe_account_id,
    stripe_charges_enabled,
    total_earnings,
    available_balance,
    pending_balance
FROM owner_profiles
ORDER BY created_at DESC;

-- ========================================
-- 3. CHECK RECENT RENTALS
-- ========================================
SELECT 
    id,
    customer_id,
    owner_id,
    car_id,
    total_amount,
    platform_fee,
    owner_payout,
    status,
    payment_status,
    created_at
FROM rentals
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 4. CHECK RECENT PAYMENTS
-- ========================================
SELECT 
    id,
    rental_id,
    owner_id,
    customer_id,
    total_amount,
    platform_fee,
    owner_amount,
    payment_status,
    created_at
FROM payments
ORDER BY created_at DESC
LIMIT 5;

-- ========================================
-- 5. CHECK IF COMMISSION FIELDS ARE NULL
-- ========================================
SELECT 
    COUNT(*) as total_payments,
    COUNT(platform_fee) as payments_with_platform_fee,
    COUNT(owner_amount) as payments_with_owner_amount,
    SUM(CASE WHEN platform_fee IS NULL THEN 1 ELSE 0 END) as null_platform_fee,
    SUM(CASE WHEN owner_amount IS NULL THEN 1 ELSE 0 END) as null_owner_amount
FROM payments;

-- ========================================
-- 6. CHECK PAYMENT STATUS DISTRIBUTION
-- ========================================
SELECT 
    payment_status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount,
    SUM(platform_fee) as total_platform_fee,
    SUM(owner_amount) as total_owner_amount
FROM payments
GROUP BY payment_status;

-- ========================================
-- 7. JOIN PAYMENTS WITH RENTALS
-- ========================================
SELECT 
    p.id as payment_id,
    p.owner_id,
    p.total_amount as payment_total,
    p.platform_fee,
    p.owner_amount,
    p.payment_status,
    r.id as rental_id,
    r.total_amount as rental_total,
    r.platform_fee as rental_platform_fee,
    r.owner_payout as rental_owner_payout,
    r.status as rental_status,
    r.payment_status as rental_payment_status
FROM payments p
LEFT JOIN rentals r ON p.rental_id = r.id
ORDER BY p.created_at DESC
LIMIT 5;

-- ========================================
-- 8. CHECK OWNER EARNINGS BY OWNER
-- ========================================
SELECT 
    p.owner_id,
    u.name as owner_name,
    u.email as owner_email,
    COUNT(p.id) as total_payments,
    SUM(p.total_amount) as total_received,
    SUM(p.platform_fee) as total_commission,
    SUM(p.owner_amount) as total_earnings
FROM payments p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.payment_status = 'succeeded'
GROUP BY p.owner_id, u.name, u.email
ORDER BY total_earnings DESC;

-- ========================================
-- 9. CHECK PLATFORM TOTAL COMMISSION
-- ========================================
SELECT 
    COUNT(*) as total_succeeded_payments,
    SUM(total_amount) as total_revenue,
    SUM(platform_fee) as total_platform_commission,
    SUM(owner_amount) as total_owner_payouts
FROM payments
WHERE payment_status = 'succeeded';

-- ========================================
-- 10. CHECK MOST RECENT BOOKING DETAILS
-- ========================================
SELECT 
    r.id,
    r.customer_id,
    c_user.name as customer_name,
    r.owner_id,
    o_user.name as owner_name,
    r.car_id,
    car.brand || ' ' || car.model as car_name,
    r.total_amount,
    r.platform_fee,
    r.owner_payout,
    r.status,
    r.payment_status,
    r.created_at
FROM rentals r
LEFT JOIN users c_user ON r.customer_id = c_user.id
LEFT JOIN users o_user ON r.owner_id = o_user.id
LEFT JOIN cars car ON r.car_id = car.id
ORDER BY r.created_at DESC
LIMIT 1;
