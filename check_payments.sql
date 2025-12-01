-- Check payment and rental records for commission data

-- 1. Check all payments with commission breakdown
SELECT 
    id,
    rental_id,
    total_amount,
    platform_fee,
    owner_amount,
    payment_status,
    created_at
FROM payments
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check all rentals with commission breakdown
SELECT 
    id,
    customer_id,
    car_id,
    total_amount,
    platform_fee,
    owner_payout,
    status,
    payment_status,
    created_at
FROM rentals
ORDER BY created_at DESC
LIMIT 10;

-- 3. Check if there are any payments at all
SELECT COUNT(*) as total_payments FROM payments;

-- 4. Check if there are any rentals at all
SELECT COUNT(*) as total_rentals FROM rentals;

-- 5. Check the most recent payment details
SELECT * FROM payments ORDER BY created_at DESC LIMIT 1;

-- 6. Check the most recent rental details
SELECT * FROM rentals ORDER BY created_at DESC LIMIT 1;
