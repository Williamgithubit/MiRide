import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure upload directory exists - try multiple paths for different deployment structures
const possiblePaths = [
  path.join(__dirname, '../../public/uploads/cars'),  // Development: utils/../../public/uploads/cars
  path.join(__dirname, '../public/uploads/cars'),     // Render: utils/../public/uploads/cars
  path.join(process.cwd(), 'public/uploads/cars')     // Current working directory
];

let uploadDir = possiblePaths[0];
for (const testPath of possiblePaths) {
  const parentDir = path.dirname(testPath);
  if (fs.existsSync(parentDir)) {
    uploadDir = testPath;
    break;
  }
}

// Create directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`📁 Created upload directory: ${uploadDir}`);
} else {
  console.log(`📁 Using existing upload directory: ${uploadDir}`);
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'car-' + uniqueSuffix + ext);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'));
  }
};

// Initialize multer with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 4 // Maximum of 4 files
  }
}).array('images', 4); // 'images' is the field name, 4 is max files

// Middleware to handle file upload
const uploadFiles = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ message: 'Maximum of 4 images allowed' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      // An unknown error occurred
      return res.status(500).json({ message: err.message });
    }
    next();
  });
};

export { uploadFiles };
