import db from '../models/index.js';
import { uploadFiles } from '../utils/uploadConfig.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Car, CarImage } = db;
const { Op } = db.Sequelize;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to handle file uploads for car images
const uploadCarImagesMiddleware = (req, res, next) => {
  uploadFiles(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

// Upload car images
const uploadCarImages = async (req, res) => {
  try {
    const { carId } = req.params;
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Check if car exists
    const car = await Car.findByPk(carId);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Get existing images count
    const existingImagesCount = await CarImage.count({ where: { carId } });
    const remainingSlots = 4 - existingImagesCount;

    if (remainingSlots <= 0) {
      return res.status(400).json({ 
        message: 'Maximum of 4 images per car reached. Please delete some images before adding new ones.' 
      });
    }

    // Limit the number of files to the remaining slots
    const filesToProcess = files.slice(0, remainingSlots);
    
    // Create image records
    const imagePromises = filesToProcess.map((file, index) => {
      return CarImage.create({
        imageUrl: `/uploads/cars/${file.filename}`,
        carId,
        isPrimary: existingImagesCount === 0 && index === 0, // First image is primary by default
        order: existingImagesCount + index
      });
    });

    const images = await Promise.all(imagePromises);
    
    res.status(201).json(images);
  } catch (error) {
    console.error('Error uploading car images:', error);
    res.status(500).json({ message: 'Error uploading car images', error: error.message });
  }
};

// Set primary image
const setPrimaryImage = async (req, res) => {
  try {
    const { carId, imageId } = req.params;
    
    // Start a transaction
    const result = await db.sequelize.transaction(async (t) => {
      // Reset all primary flags for this car
      await CarImage.update(
        { isPrimary: false },
        { where: { carId }, transaction: t }
      );
      
      // Set the selected image as primary
      const [updated] = await CarImage.update(
        { isPrimary: true },
        { 
          where: { 
            id: imageId, 
            carId 
          },
          returning: true,
          transaction: t 
        }
      );
      
      if (updated === 0) {
        throw new Error('Image not found or not updated');
      }
      
      return updated;
    });
    
    res.json({ message: 'Primary image updated successfully' });
  } catch (error) {
    console.error('Error setting primary image:', error);
    res.status(500).json({ message: 'Error setting primary image', error: error.message });
  }
};

// Delete car image
const deleteCarImage = async (req, res) => {
  try {
    const { carId, imageId } = req.params;
    
    // Find the image first
    const image = await CarImage.findOne({
      where: { id: imageId, carId }
    });
    
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    
    // Start a transaction
    await db.sequelize.transaction(async (t) => {
      // Delete the image record
      await image.destroy({ transaction: t });
      
      // If the deleted image was primary, set another image as primary
      if (image.isPrimary) {
        const nextImage = await CarImage.findOne({
          where: { 
            carId,
            id: { [Op.ne]: imageId } // Not the deleted image
          },
          order: [['createdAt', 'ASC']],
          transaction: t
        });
        
        if (nextImage) {
          await nextImage.update({ isPrimary: true }, { transaction: t });
        }
      }
    });
    
    // Delete the actual file
    const filePath = path.join(__dirname, '../../public', image.imageUrl);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting car image:', error);
    res.status(500).json({ message: 'Error deleting car image', error: error.message });
  }
};

// Get all images for a car
const getCarImages = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const images = await CarImage.findAll({
      where: { carId },
      order: [['isPrimary', 'DESC'], ['order', 'ASC']]
    });
    
    res.json(images);
  } catch (error) {
    console.error('Error fetching car images:', error);
    res.status(500).json({ message: 'Error fetching car images', error: error.message });
  }
};

// Reorder images
const reorderImages = async (req, res) => {
  try {
    const { carId } = req.params;
    const { orderedImageIds } = req.body;
    
    if (!Array.isArray(orderedImageIds) || orderedImageIds.length === 0) {
      return res.status(400).json({ message: 'Invalid image order data' });
    }
    
    // Start a transaction
    await db.sequelize.transaction(async (t) => {
      // Update the order of each image
      const updatePromises = orderedImageIds.map((imageId, index) => {
        return CarImage.update(
          { order: index },
          { 
            where: { 
              id: imageId, 
              carId 
            },
            transaction: t 
          }
        );
      });
      
      await Promise.all(updatePromises);
    });
    
    res.json({ message: 'Image order updated successfully' });
  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ message: 'Error reordering images', error: error.message });
  }
};

export {
  uploadCarImagesMiddleware,
  uploadCarImages,
  setPrimaryImage,
  deleteCarImage,
  getCarImages,
  reorderImages
};

export default {
  uploadCarImagesMiddleware,
  uploadCarImages,
  setPrimaryImage,
  deleteCarImage,
  getCarImages,
  reorderImages
};
