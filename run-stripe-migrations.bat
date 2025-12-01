@echo off
echo ========================================
echo   Stripe Connect Migration Runner
echo ========================================
echo.

cd server

echo Running all Stripe Connect migrations...
echo.

npx sequelize-cli db:migrate
if %errorlevel% neq 0 (
    echo ERROR: Migrations failed!
    pause
    exit /b 1
)
echo.
echo ✓ All Stripe Connect migrations completed successfully!
echo.

echo ========================================
echo   All migrations completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Configure STRIPE_SECRET_KEY in .env
echo 2. Configure STRIPE_WEBHOOK_SECRET in .env
echo 3. Start the server: npm run dev
echo 4. Test the features!
echo.

pause
