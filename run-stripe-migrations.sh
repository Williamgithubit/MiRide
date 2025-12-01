#!/bin/bash

echo "========================================"
echo "  Stripe Connect Migration Runner"
echo "========================================"
echo ""

cd server

echo "Running Stripe Connect migrations..."
echo ""

echo "[1/4] Adding Stripe Connect fields to owner_profiles..."
npx sequelize-cli db:migrate --name 20250101-add-stripe-connect-to-owners.js
if [ $? -ne 0 ]; then
    echo "ERROR: Migration 1 failed!"
    exit 1
fi
echo "✓ Migration 1 complete"
echo ""

echo "[2/4] Creating payments table..."
npx sequelize-cli db:migrate --name 20250102-create-payments-table.js
if [ $? -ne 0 ]; then
    echo "ERROR: Migration 2 failed!"
    exit 1
fi
echo "✓ Migration 2 complete"
echo ""

echo "[3/4] Creating withdrawals table..."
npx sequelize-cli db:migrate --name 20250103-create-withdrawals-table.js
if [ $? -ne 0 ]; then
    echo "ERROR: Migration 3 failed!"
    exit 1
fi
echo "✓ Migration 3 complete"
echo ""

echo "[4/4] Adding Stripe Connect fields to rentals..."
npx sequelize-cli db:migrate --name 20250104-add-stripe-connect-to-rentals.js
if [ $? -ne 0 ]; then
    echo "ERROR: Migration 4 failed!"
    exit 1
fi
echo "✓ Migration 4 complete"
echo ""

echo "========================================"
echo "  All migrations completed successfully!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure STRIPE_SECRET_KEY in .env"
echo "2. Configure STRIPE_WEBHOOK_SECRET in .env"
echo "3. Start the server: npm run dev"
echo "4. Test the features!"
echo ""
