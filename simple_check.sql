-- Simple check to see what's in payments

SELECT COUNT(*) as total_payments FROM payments;

SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;

SELECT 
    COUNT(*) as total_rentals,
    SUM(CASE WHEN platform_fee IS NOT NULL THEN 1 ELSE 0 END) as rentals_with_commission
FROM rentals;

SELECT * FROM rentals ORDER BY created_at DESC LIMIT 5;
