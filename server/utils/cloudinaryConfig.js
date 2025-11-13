// server/utils/cloudinaryConfig.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log configuration status (without exposing secrets)
// if (process.env.CLOUDINARY_CLOUD_NAME) {
//   console.log('✅ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME);
// } else {
//   console.warn('⚠️  Cloudinary not configured - using local storage');
// }

// Create Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'miride/cars', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = file.originalname.split('.')[0];
      return `${filename}-${uniqueSuffix}`;
    }
  }
});

// Create multer upload middleware with Cloudinary storage
export const cloudinaryUpload = multer({
  storage: cloudinaryStorage,
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

// Helper function to delete image from Cloudinary
export const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/miride/cars/car-123.jpg
    const matches = imageUrl.match(/\/miride\/cars\/([^/.]+)/);
    if (matches && matches[1]) {
      const publicId = `miride/cars/${matches[1]}`;
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Deleted from Cloudinary:', publicId, result);
      return result;
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

export { cloudinary };
export default cloudinaryUpload;
