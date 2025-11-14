# Render Storage Issue - Images Disappearing After Deployment

## Critical Problem

**Images disappear after every deployment on Render!**

### Why This Happens

Render uses **ephemeral storage** for web services:
- Files uploaded to the server's filesystem are stored in temporary storage
- Every time you deploy (git push), Render creates a **new container**
- The new container doesn't have the previously uploaded files
- Result: All uploaded images are lost on every deployment

### Current Behavior

1. ✅ Upload car images → Images display correctly
2. ❌ Deploy code changes (git push) → **All images disappear**
3. ✅ Delete and re-upload cars → Images display again
4. ❌ Next deployment → **Images disappear again**

This is NOT a caching issue - the files literally don't exist on the server after redeployment!

## Solution: Use Cloud Storage

You need to store images in **persistent cloud storage** instead of the server's filesystem.

### Recommended Options

#### 1. **Cloudinary** (Easiest - Recommended)
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Automatic image optimization
- ✅ Built-in CDN
- ✅ Easy integration with Node.js
- ✅ Image transformations (resize, crop, etc.)

#### 2. **AWS S3**
- ✅ Very reliable
- ✅ Pay-as-you-go pricing
- ❌ More complex setup
- ❌ Requires AWS account

#### 3. **Render Persistent Disk**
- ✅ Integrated with Render
- ❌ Costs $1/month per 1GB
- ❌ Requires manual mounting
- ❌ Not recommended for production

## Implementation: Cloudinary (Recommended)

### Step 1: Install Cloudinary Package

```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

### Step 2: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register/free
2. Sign up for free account
3. Get your credentials:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Add Environment Variables

Add to your Render backend environment variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 4: Update Upload Configuration

**File**: `server/utils/uploadConfig.js`

```javascript
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'miride/cars', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }], // Auto-resize
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `car-${uniqueSuffix}`;
    }
  }
});

// Create multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
    }
  }
});

export default upload;
```

### Step 5: Update Car Routes

**File**: `server/routes/carRoutes.js`

The upload middleware will now automatically upload to Cloudinary and return the Cloudinary URL in `req.files[].path`.

No changes needed - Cloudinary URLs are automatically saved to the database!

### Step 6: Remove Static File Serving (Optional)

Since images are now on Cloudinary, you can remove the `/uploads` static file serving from `server.js`:

```javascript
// Remove or comment out this line:
// app.use('/uploads', express.static(uploadsPath, { ... }));
```

### Step 7: Update Frontend Image Utils

**File**: `client/src/utils/imageUtils.ts`

Update to handle both local and Cloudinary URLs:

```typescript
export const getImageUrl = (
  imageUrl: string | undefined,
  fallback: string = "/placeholder-car.jpg"
): string => {
  if (!imageUrl) return fallback;

  // If already a full URL (Cloudinary, http/https), return as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // If it's a relative path (legacy), prepend API base URL
  if (imageUrl.startsWith("/uploads")) {
    return `${API_BASE_URL}${imageUrl}`;
  }

  return imageUrl;
};
```

## Benefits of Cloudinary

1. ✅ **Persistent Storage**: Images never disappear after deployment
2. ✅ **CDN**: Fast image delivery worldwide
3. ✅ **Automatic Optimization**: Images are compressed and optimized
4. ✅ **Transformations**: Resize, crop, format conversion on-the-fly
5. ✅ **Free Tier**: 25GB storage, 25GB bandwidth/month
6. ✅ **Backup**: Cloudinary handles backups automatically

## Migration Plan

### For Existing Images

Option 1: **Manual Re-upload** (Simplest)
1. Deploy Cloudinary integration
2. Delete existing cars
3. Re-upload cars with images
4. Images will now be stored on Cloudinary

Option 2: **Migration Script** (Preserves data)
1. Create script to download existing images from database URLs
2. Upload them to Cloudinary
3. Update database with new Cloudinary URLs

## Alternative: Render Persistent Disk

If you prefer to keep using Render's filesystem:

### Step 1: Add Persistent Disk in Render Dashboard

1. Go to your Render service
2. Click "Disks" tab
3. Add new disk:
   - Name: `uploads`
   - Mount Path: `/opt/render/project/src/public/uploads`
   - Size: 1GB ($1/month)

### Step 2: Update Upload Path

```javascript
const uploadDir = process.env.RENDER 
  ? '/opt/render/project/src/public/uploads/cars'
  : path.join(__dirname, '../../public/uploads/cars');
```

**Note**: This costs $1/GB/month and is less reliable than Cloudinary.

## Comparison

| Solution | Cost | Reliability | Performance | Ease of Use |
|----------|------|-------------|-------------|-------------|
| **Cloudinary** | Free (25GB) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| AWS S3 | ~$0.023/GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Render Disk | $1/GB | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Filesystem | Free | ❌ (ephemeral) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Recommendation

**Use Cloudinary** - It's free, reliable, and solves the problem permanently. The integration is straightforward and provides additional benefits like CDN and image optimization.

## Next Steps

1. Sign up for Cloudinary (free)
2. Install packages: `npm install cloudinary multer-storage-cloudinary`
3. Add environment variables to Render
4. Update `uploadConfig.js` to use Cloudinary
5. Deploy and test
6. Re-upload existing cars with images

---

**Status**: ⚠️ Critical issue - requires cloud storage implementation
**Impact**: All uploaded images are lost on every deployment
**Recommended Solution**: Cloudinary integration
