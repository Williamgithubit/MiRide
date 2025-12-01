import db from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';

// Get paginated users list with filters
export const getUsers = async (req, res) => {
  try {
    console.log('getUsers - Request details:', {
      userId: req.userId,
      userRole: req.userRole,
      headers: req.headers.authorization ? 'Token present' : 'No token'
    });

    // Verify user is admin
    if (req.userRole !== 'admin') {
      console.log('getUsers - Access denied. User role:', req.userRole);
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const {
      search = '',
      role = 'all',
      status = 'all',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build where clause
    const whereClause = {};

    // Search filter
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Role filter
    if (role !== 'all') {
      whereClause.role = role;
    }

    // Status filter
    if (status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log('getUsers - Query parameters:', {
      whereClause,
      sortBy,
      sortOrder,
      limit: parseInt(limit),
      offset
    });

    // Get users with pagination
    const { count, rows: users } = await db.User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: offset
    });

    console.log('getUsers - Query results:', {
      count,
      usersCount: users.length
    });

    // Calculate pagination info
    const totalPages = Math.ceil(count / parseInt(limit));

    res.status(200).json({
      users,
      totalCount: count,
      currentPage: parseInt(page),
      totalPages,
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    });

  } catch (error) {
    console.error('Error fetching users - Full error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;

    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    const { name, email, role, isActive, phone } = req.body;

    // Find user
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.userId && isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    // Update user
    const updatedUser = await user.update({
      name: name || user.name,
      email: email || user.email,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive,
      phone: phone || user.phone
    });

    // Return updated user without password
    const { password, ...userWithoutPassword } = updatedUser.toJSON();
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Find user
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user (force: true for hard delete, bypassing paranoid mode)
    await user.destroy({ force: true });

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Toggle user status (activate/deactivate)
export const toggleUserStatus = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    // Prevent admin from deactivating themselves
    if (userId === req.userId && isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own account' });
    }

    // Find user
    const user = await db.User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update status
    const updatedUser = await user.update({ isActive });

    // Return updated user without password
    const { password, ...userWithoutPassword } = updatedUser.toJSON();
    res.status(200).json(userWithoutPassword);

  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Bulk actions on users
export const bulkUserAction = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { userIds, action } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'User IDs array is required' });
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be activate, deactivate, or delete' });
    }

    // Prevent admin from performing bulk actions on themselves
    if (userIds.includes(req.userId)) {
      return res.status(400).json({ message: 'You cannot perform bulk actions on your own account' });
    }

    let affectedCount = 0;

    switch (action) {
      case 'activate':
        affectedCount = await db.User.update(
          { isActive: true },
          { where: { id: { [Op.in]: userIds } } }
        );
        break;

      case 'deactivate':
        affectedCount = await db.User.update(
          { isActive: false },
          { where: { id: { [Op.in]: userIds } } }
        );
        break;

      case 'delete':
        affectedCount = await db.User.destroy({
          where: { id: { [Op.in]: userIds } }
        });
        break;
    }

    res.status(200).json({
      message: `Bulk ${action} completed successfully`,
      affectedCount: Array.isArray(affectedCount) ? affectedCount[0] : affectedCount
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get user counts
    const totalUsers = await db.User.count();
    const activeUsers = await db.User.count({ where: { isActive: true } });
    const inactiveUsers = await db.User.count({ where: { isActive: false } });

    // Get role counts
    const adminCount = await db.User.count({ where: { role: 'admin' } });
    const ownerCount = await db.User.count({ where: { role: 'owner' } });
    const customerCount = await db.User.count({ where: { role: 'customer' } });

    // Get new users this month
    const newUsersThisMonth = await db.User.count({
      where: {
        createdAt: { [Op.gte]: startOfMonth }
      }
    });

    res.status(200).json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminCount,
      ownerCount,
      customerCount,
      newUsersThisMonth
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Create new user (admin only)
export const createUser = async (req, res) => {
  try {
    // Verify user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const { name, email, password, role = 'customer', phone, isActive = true } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Create user (password will be hashed automatically by the model hook)
    const newUser = await db.User.create({
      name,
      email,
      password, // Don't hash here - the beforeCreate hook in the model will hash it
      role,
      phone,
      isActive
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    res.status(201).json(userWithoutPassword);

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
