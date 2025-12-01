-- Check if rentals exist and have commission data

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
    payment_intent_id,
    created_at
FROM rentals
ORDER BY created_at DESC;
