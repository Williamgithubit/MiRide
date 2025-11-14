#!/bin/bash

# MiRide Cloudinary Installation Script
# This script installs Cloudinary packages and sets up the environment

echo "🚀 MiRide Cloudinary Installation"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Please run this script from the server directory"
    exit 1
fi

# Install Cloudinary packages
echo "📦 Installing Cloudinary packages..."
npm install cloudinary multer-storage-cloudinary

if [ $? -eq 0 ]; then
    echo "✅ Packages installed successfully!"
else
    echo "❌ Failed to install packages"
    exit 1
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Add these environment variables to your .env file:"
echo ""
echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
echo "   CLOUDINARY_API_KEY=your_api_key"
echo "   CLOUDINARY_API_SECRET=your_api_secret"
echo ""
echo "2. Get your Cloudinary credentials from:"
echo "   https://cloudinary.com/console"
echo ""
echo "3. Add the same variables to Render:"
echo "   Render Dashboard → Backend Service → Environment"
echo ""
echo "4. Deploy to production:"
echo "   git add ."
echo "   git commit -m 'feat: Add Cloudinary integration'"
echo "   git push origin main"
echo ""
echo "5. Test image upload in production"
echo ""
echo "✅ Installation complete!"
echo ""
