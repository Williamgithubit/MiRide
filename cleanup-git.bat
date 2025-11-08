@echo off
echo.
echo ========================================================================
echo   Git Cleanup Script - Removing build artifacts and sensitive files
echo ========================================================================
echo.

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
    echo ERROR: Not a git repository!
    exit /b 1
)

echo Step 1: Removing client/dist folder from Git tracking...
if exist "client\dist" (
    git rm -r --cached client/dist 2>nul
    if errorlevel 1 (
        echo    INFO: client/dist not tracked or already removed
    )
) else (
    echo    INFO: client/dist folder doesn't exist
)

echo.
echo Step 2: Removing .env files from Git tracking...
if exist "server\.env" (
    git rm --cached server/.env 2>nul
    if errorlevel 1 (
        echo    INFO: server/.env not tracked or already removed
    )
) else (
    echo    INFO: server/.env doesn't exist
)

echo.
echo Step 3: Checking current status...
git status

echo.
echo ========================================================================
echo   Files removed from Git tracking!
echo ========================================================================
echo.
echo Next steps:
echo    1. Review the changes with: git status
echo    2. Commit the changes: git add . ^&^& git commit -m "Remove build artifacts and .env files"
echo    3. Push to GitHub: git push origin main
echo.
echo NOTE: Files are only removed from Git tracking, not from your local filesystem
echo.
pause
