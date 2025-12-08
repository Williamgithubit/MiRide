// server/utils/cloudinaryLogoConfig.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create Cloudinary storage configuration for company logos
const logoCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'miride/logos', // Folder for company logos
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'svg'],
    transformation: [
      { width: 400, height: 400, crop: 'limit', quality: 'auto' }
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `logo-${uniqueSuffix}`;
    }
  }
});

// Create multer upload middleware for logos
export const logoUpload = multer({
  storage: logoCloudinaryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Helper function to delete logo from Cloudinary
export const deleteLogoFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from Cloudinary URL
    const matches = imageUrl.match(/\/miride\/logos\/([^/.]+)/);
    if (matches && matches[1]) {
      const publicId = `miride/logos/${matches[1]}`;
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Deleted logo from Cloudinary:', publicId, result);
      return result;
    }
  } catch (error) {
    console.error('Error deleting logo from Cloudinary:', error);
  }
};

export { cloudinary };
export default logoUpload;
