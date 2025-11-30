// server/routes/maintenanceRoutes.js
import express from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get maintenance records for owner's cars
router.get('/owner/:ownerId', auth(), maintenanceController.getMaintenanceByOwner);
router.get('/owner', auth(), maintenanceController.getMaintenanceByOwner);

// Get maintenance records for specific car
router.get('/car/:carId', auth(), maintenanceController.getMaintenanceByCar);

// Get maintenance statistics
router.get('/stats', auth(), maintenanceController.getMaintenanceStats);
router.get('/stats/:ownerId', auth(), maintenanceController.getMaintenanceStats);

// Create new maintenance record
router.post('/', auth(), maintenanceController.createMaintenance);

// Update maintenance record
router.put('/:id', auth(), maintenanceController.updateMaintenance);

// Delete maintenance record
router.delete('/:id', auth(), maintenanceController.deleteMaintenance);

export default router;
