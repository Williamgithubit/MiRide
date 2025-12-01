-- Verify the fix was applied correctly

-- Check payments table
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
ORDER BY created_at DESC;

-- Check rentals table
SELECT 
    id,
    owner_id,
    customer_id,
    car_id,
    total_amount,
    platform_fee,
    owner_payout,
    status,
    payment_status,
    created_at
FROM rentals
ORDER BY created_at DESC;

-- Check if owner_id matches between rentals and users
SELECT 
    r.id as rental_id,
    r.owner_id as rental_owner_id,
    u.id as user_id,
    u.name as owner_name,
    u.role,
    r.total_amount,
    r.platform_fee,
    r.owner_payout
FROM rentals r
LEFT JOIN users u ON r.owner_id = u.id
ORDER BY r.created_at DESC;

-- Check owner profiles
SELECT 
    op.user_id,
    u.name,
    u.email,
    op.total_earnings,
    op.available_balance,
    op.pending_balance
FROM owner_profiles op
LEFT JOIN users u ON op.user_id = u.id
ORDER BY op.created_at DESC;
