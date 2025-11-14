@echo off
REM MiRide Cloudinary Installation Script for Windows
REM This script installs Cloudinary packages and sets up the environment

echo.
echo ========================================
echo   MiRide Cloudinary Installation
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the server directory
    pause
    exit /b 1
)

REM Install Cloudinary packages
echo [INFO] Installing Cloudinary packages...
echo.
call npm install cloudinary multer-storage-cloudinary

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Packages installed successfully!
) else (
    echo.
    echo [ERROR] Failed to install packages
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Next Steps
echo ========================================
echo.
echo 1. Add these environment variables to your .env file:
echo.
echo    CLOUDINARY_CLOUD_NAME=your_cloud_name
echo    CLOUDINARY_API_KEY=your_api_key
echo    CLOUDINARY_API_SECRET=your_api_secret
echo.
echo 2. Get your Cloudinary credentials from:
echo    https://cloudinary.com/console
echo.
echo 3. Add the same variables to Render:
echo    Render Dashboard -^> Backend Service -^> Environment
echo.
echo 4. Deploy to production:
echo    git add .
echo    git commit -m "feat: Add Cloudinary integration"
echo    git push origin main
echo.
echo 5. Test image upload in production
echo.
echo [SUCCESS] Installation complete!
echo.
pause
