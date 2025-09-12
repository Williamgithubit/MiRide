// server/controllers/maintenanceController.js
import db from '../models/index.js';
import { Op } from 'sequelize';

// Get all maintenance records for owner's cars
export const getMaintenanceByOwner = async (req, res) => {
  try {
    console.log('=== getMaintenanceByOwner called ===');
    const ownerId = req.user?.id || req.params.ownerId;
    console.log('Owner ID:', ownerId);
    
    if (!ownerId) {
      console.log('No owner ID provided');
      return res.status(400).json({ message: 'Owner ID is required' });
    }

    // First, check if the owner has any cars
    console.log('Checking for owner cars...');
    const ownerCars = await db.Car.findAll({
      where: { ownerId },
      attributes: ['id', 'name']
    });
    console.log('Owner cars found:', ownerCars.length);

    if (!ownerCars || ownerCars.length === 0) {
      console.log('Owner has no cars, returning empty array');
      return res.json([]);
    }

    const carIds = ownerCars.map(car => car.id);
    console.log('Car IDs:', carIds);
    
    // Check if maintenance table exists and has records
    console.log('Fetching maintenance records...');
    const maintenanceRecords = await db.Maintenance.findAll({
      where: {
        carId: { [Op.in]: carIds }
      },
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    console.log('Maintenance records found:', maintenanceRecords.length);
    res.json(maintenanceRecords);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch maintenance records',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get maintenance records for a specific car
export const getMaintenanceByCar = async (req, res) => {
  try {
    const { carId } = req.params;
    
    const maintenanceRecords = await db.Maintenance.findAll({
      where: { carId },
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(maintenanceRecords);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create new maintenance record
export const createMaintenance = async (req, res) => {
  try {
    const {
      carId,
      type,
      description,
      cost,
      scheduledDate,
      serviceProvider,
      notes,
      mileage,
      priority,
    } = req.body;

    // Verify car ownership
    const car = await db.Car.findOne({
      where: { 
        id: carId, 
        ownerId: req.user?.id 
      },
    });

    if (!car) {
      return res.status(404).json({ message: 'Car not found or not owned by user' });
    }

    const maintenance = await db.Maintenance.create({
      carId,
      type,
      description,
      cost: cost || 0,
      scheduledDate,
      serviceProvider,
      notes,
      mileage,
      priority: priority || 'medium',
      status: 'scheduled',
    });

    const maintenanceWithCar = await db.Maintenance.findByPk(maintenance.id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
      ],
    });

    res.status(201).json(maintenanceWithCar);
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update maintenance record
export const updateMaintenance = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const maintenance = await db.Maintenance.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId: req.user?.id },
        },
      ],
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // If marking as completed, set completedDate
    if (updateData.status === 'completed' && !updateData.completedDate) {
      updateData.completedDate = new Date();
    }

    await maintenance.update(updateData);

    const updatedMaintenance = await db.Maintenance.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year', 'imageUrl'],
        },
      ],
    });

    res.json(updatedMaintenance);
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete maintenance record
export const deleteMaintenance = async (req, res) => {
  try {
    const { id } = req.params;

    const maintenance = await db.Maintenance.findByPk(id, {
      include: [
        {
          model: db.Car,
          as: 'car',
          where: { ownerId: req.user?.id },
        },
      ],
    });

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    await maintenance.destroy();
    res.json({ message: 'Maintenance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get maintenance statistics
export const getMaintenanceStats = async (req, res) => {
  try {
    console.log('=== getMaintenanceStats called ===');
    const ownerId = req.user?.id || req.params.ownerId;
    console.log('Owner ID for stats:', ownerId);
    
    if (!ownerId) {
      console.log('No owner ID provided for stats');
      return res.status(400).json({ message: 'Owner ID is required' });
    }

    // First, check if the owner has any cars
    console.log('Checking for owner cars for stats...');
    const ownerCars = await db.Car.findAll({
      where: { ownerId },
      attributes: ['id']
    });
    console.log('Owner cars found for stats:', ownerCars.length);

    if (!ownerCars || ownerCars.length === 0) {
      console.log('Owner has no cars, returning empty stats');
      return res.json({
        statusBreakdown: [],
        totalCost: 0,
        upcomingMaintenance: 0,
      });
    }

    const carIds = ownerCars.map(car => car.id);
    console.log('Car IDs for stats:', carIds);
    
    console.log('Fetching maintenance stats...');
    const stats = await db.Maintenance.findAll({
      where: {
        carId: { [Op.in]: carIds }
      },
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('Maintenance.id')), 'count'],
        [db.sequelize.fn('SUM', db.sequelize.col('cost')), 'totalCost'],
      ],
      group: ['status'],
      raw: true,
    });

    const totalCost = await db.Maintenance.sum('cost', {
      where: {
        carId: { [Op.in]: carIds }
      }
    });

    const upcomingMaintenance = await db.Maintenance.count({
      where: {
        carId: { [Op.in]: carIds },
        status: 'scheduled',
        scheduledDate: {
          [Op.gte]: new Date(),
          [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
        },
      },
    });

    console.log('Stats results:', { stats: stats.length, totalCost, upcomingMaintenance });
    res.json({
      statusBreakdown: stats,
      totalCost: totalCost || 0,
      upcomingMaintenance,
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to fetch maintenance statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
