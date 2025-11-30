import db from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get owner profile with statistics
 * GET /api/owners/profile/:ownerId
 */
export const getOwnerProfile = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Verify the requesting user is the owner or an admin
    if (req.user.id !== ownerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the owner
    const owner = await db.User.findByPk(ownerId, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'dateOfBirth', 'avatar', 'role', 'createdAt'],
    });

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (owner.role !== 'owner') {
      return res.status(400).json({ message: 'User is not an owner' });
    }

    // Count registered cars
    const carsCount = await db.Car.count({
      where: { ownerId },
    });

    // Count active bookings (pending_approval, approved, active)
    const activeBookingsCount = await db.Rental.count({
      where: {
        ownerId,
        status: {
          [Op.in]: ['pending_approval', 'approved', 'active'],
        },
      },
    });

    // Prepare profile response
    const profile = {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      dateOfBirth: owner.dateOfBirth,
      avatar: owner.avatar,
      role: owner.role,
      createdAt: owner.createdAt,
      carsCount,
      activeBookingsCount,
    };

    res.status(200).json({
      message: 'Owner profile fetched successfully',
      profile,
    });
  } catch (error) {
    console.error('Error fetching owner profile:', error);
    res.status(500).json({
      message: 'Failed to fetch owner profile',
      error: error.message,
    });
  }
};

/**
 * Update owner profile
 * PUT /api/owners/profile/update/:ownerId
 */
export const updateOwnerProfile = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { name, phone, address, dateOfBirth } = req.body;

    // Verify the requesting user is the owner
    if (req.user.id !== ownerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find the owner
    const owner = await db.User.findByPk(ownerId);

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (owner.role !== 'owner') {
      return res.status(400).json({ message: 'User is not an owner' });
    }

    // Update fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;

    await owner.update(updateData);

    // Count registered cars
    const carsCount = await db.Car.count({
      where: { ownerId },
    });

    // Count active bookings
    const activeBookingsCount = await db.Rental.count({
      where: {
        ownerId,
        status: {
          [Op.in]: ['pending_approval', 'approved', 'active'],
        },
      },
    });

    // Prepare updated profile response
    const profile = {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      dateOfBirth: owner.dateOfBirth,
      avatar: owner.avatar,
      role: owner.role,
      createdAt: owner.createdAt,
      carsCount,
      activeBookingsCount,
    };

    res.status(200).json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    console.error('Error updating owner profile:', error);
    res.status(500).json({
      message: 'Failed to update owner profile',
      error: error.message,
    });
  }
};

/**
 * Upload owner profile picture
 * POST /api/owners/profile/upload/:ownerId
 */
export const uploadOwnerAvatar = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Verify the requesting user is the owner
    if (req.user.id !== ownerId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Find the owner
    const owner = await db.User.findByPk(ownerId);

    if (!owner) {
      return res.status(404).json({ message: 'Owner not found' });
    }

    if (owner.role !== 'owner') {
      return res.status(400).json({ message: 'User is not an owner' });
    }

    // Update avatar path
    // Store the path relative to the uploads directory
    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    await owner.update({ avatar: avatarPath });

    // Count registered cars
    const carsCount = await db.Car.count({
      where: { ownerId },
    });

    // Count active bookings
    const activeBookingsCount = await db.Rental.count({
      where: {
        ownerId,
        status: {
          [Op.in]: ['pending_approval', 'approved', 'active'],
        },
      },
    });

    // Prepare updated profile response
    const profile = {
      id: owner.id,
      name: owner.name,
      email: owner.email,
      phone: owner.phone,
      address: owner.address,
      dateOfBirth: owner.dateOfBirth,
      avatar: owner.avatar,
      role: owner.role,
      createdAt: owner.createdAt,
      carsCount,
      activeBookingsCount,
    };

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      profile,
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({
      message: 'Failed to upload avatar',
      error: error.message,
    });
  }
};
