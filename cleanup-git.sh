#!/bin/bash

echo "🧹 Git Cleanup Script - Removing build artifacts and sensitive files"
echo "=================================================================="
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository!"
    exit 1
fi

echo "📋 Step 1: Removing client/dist folder from Git tracking..."
if [ -d "client/dist" ]; then
    git rm -r --cached client/dist 2>/dev/null || echo "   ℹ️  client/dist not tracked or already removed"
else
    echo "   ℹ️  client/dist folder doesn't exist"
fi

echo ""
echo "📋 Step 2: Removing .env files from Git tracking..."
if [ -f "server/.env" ]; then
    git rm --cached server/.env 2>/dev/null || echo "   ℹ️  server/.env not tracked or already removed"
else
    echo "   ℹ️  server/.env doesn't exist"
fi

echo ""
echo "📋 Step 3: Removing any .js files from client/src (if they're build artifacts)..."
# Only remove if you're sure these are build artifacts, not source files
# Uncomment the line below if you want to remove .js files from src
# git rm --cached client/src/**/*.js 2>/dev/null || echo "   ℹ️  No .js files to remove from client/src"
echo "   ⚠️  Skipping .js files in client/src (uncomment in script if needed)"

echo ""
echo "📋 Step 4: Checking current status..."
git status

echo ""
echo "✅ Files removed from Git tracking!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the changes with: git status"
echo "   2. Commit the changes: git add . && git commit -m 'Remove build artifacts and .env files'"
echo "   3. Push to GitHub: git push origin main"
echo ""
echo "⚠️  Note: Files are only removed from Git tracking, not from your local filesystem"
