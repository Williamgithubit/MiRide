// server/utils/cloudinaryAvatarConfig.js
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

// Create Cloudinary storage configuration for avatars
const avatarCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'miride/avatars', // Folder for profile pictures
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }
    ],
    public_id: (req, file) => {
      // Generate unique filename with user ID
      const userId = req.userId || req.user?.id || 'unknown';
      const uniqueSuffix = Date.now();
      return `avatar-${userId}-${uniqueSuffix}`;
    }
  }
});

// Create multer upload middleware for avatars
export const avatarUpload = multer({
  storage: avatarCloudinaryStorage,
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

// Helper function to delete avatar from Cloudinary
export const deleteAvatarFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/demo/image/upload/v1234567890/miride/avatars/avatar-123.jpg
    const matches = imageUrl.match(/\/miride\/avatars\/([^/.]+)/);
    if (matches && matches[1]) {
      const publicId = `miride/avatars/${matches[1]}`;
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Deleted avatar from Cloudinary:', publicId, result);
      return result;
    }
  } catch (error) {
    console.error('Error deleting avatar from Cloudinary:', error);
  }
};

export { cloudinary };
export default avatarUpload;
