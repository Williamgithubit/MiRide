-- Create Payment records from existing Rentals
-- This script creates missing payment records based on rental data

-- First, let's see which rentals don't have payment records
SELECT 
    r.id as rental_id,
    r.customer_id,
    r.owner_id,
    r.total_amount,
    r.platform_fee,
    r.owner_payout,
    r.payment_status,
    r.payment_intent_id,
    p.id as payment_id
FROM rentals r
LEFT JOIN payments p ON r.id = p.rental_id
WHERE p.id IS NULL
ORDER BY r.created_at DESC;

-- Now create payment records for rentals that don't have them
-- IMPORTANT: Only run this if the above query shows missing payments!

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
    COALESCE(r.payment_intent_id, 'manual_' || r.id), -- Use payment_intent_id or create a manual ID
    r.total_amount,
    COALESCE(r.platform_fee, ROUND(r.total_amount * 0.10, 2)), -- Calculate 10% if null
    COALESCE(r.owner_payout, ROUND(r.total_amount * 0.90, 2)), -- Calculate 90% if null
    'usd',
    CAST(CASE 
        WHEN r.payment_status = 'paid' THEN 'succeeded'
        WHEN r.payment_status = 'pending' THEN 'processing'
        ELSE 'pending'
    END AS enum_payments_payment_status),
    CAST(CASE 
        WHEN r.payment_status = 'paid' THEN 'paid'
        ELSE 'pending'
    END AS enum_payments_payout_status),
    r.created_at,
    NOW()
FROM rentals r
LEFT JOIN payments p ON r.id = p.rental_id
WHERE p.id IS NULL
  AND r.payment_status IN ('paid', 'pending');

-- Verify the payments were created
SELECT 
    p.id,
    p.rental_id,
    p.owner_id,
    p.total_amount,
    p.platform_fee,
    p.owner_amount,
    p.payment_status,
    p.created_at
FROM payments p
ORDER BY p.created_at DESC;

-- Update owner profiles with correct earnings
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
    ), 0);

-- Show final summary
SELECT 
    'Platform Total' as description,
    COUNT(*) as payment_count,
    SUM(total_amount) as total_revenue,
    SUM(platform_fee) as platform_commission,
    SUM(owner_amount) as owner_payouts
FROM payments
WHERE payment_status = 'succeeded';
