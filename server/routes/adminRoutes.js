import express from 'express';
const router = express.Router();
import db from '../models/index.js';
const { User, Customer, Notification } = db;
import { authenticate, authorize } from '../controllers/authController.js';

// Middleware to ensure user is an admin
const ensureAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

// Get all users (admin only)
router.get('/users', authenticate, ensureAdmin, async (req, res) => {
  try {
    // Get all users from both User and Customer models
    const adminOwnerUsers = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt', 'updatedAt']
    });
    
    const customers = await Customer.findAll({
      attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt']
    });
    
    // Map customers to have the same structure as users with role='customer'
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: 'customer',
      status: 'active', // Assuming all customers are active by default
      phone: customer.phone,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));
    
    // Combine both arrays
    const allUsers = [...adminOwnerUsers, ...formattedCustomers];
    
    res.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications (admin only)
router.get('/notifications', authenticate, ensureAdmin, async (req, res) => {
  try {
    // Check if Notification model exists, if not return empty array
    if (!Notification) {
      return res.json([]);
    }
    
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new user (admin only)
router.post('/users', authenticate, ensureAdmin, async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    
    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user based on role
    if (role === 'customer') {
      const customer = await Customer.create({
        name,
        email,
        password, // This will be hashed by hooks in the model
        phone: req.body.phone || ''
      });
      
      return res.status(201).json({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        role: 'customer',
        status: 'active',
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      });
    } else {
      // For admin or owner roles
      const user = await User.create({
        name,
        email,
        password, // This will be hashed by hooks in the model
        role,
        status: status || 'active'
      });
      
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a user (admin only)
router.put('/users/:id', authenticate, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;
    
    // First try to find in User model
    let user = await User.findByPk(id);
    let isCustomer = false;
    
    // If not found in User model, check Customer model
    if (!user) {
      user = await Customer.findByPk(id);
      isCustomer = true;
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password; // Will be hashed by model hooks
    
    // Role and status updates only apply to User model
    if (!isCustomer) {
      if (role) user.role = role;
      if (status) user.status = status;
    }
    
    await user.save();
    
    // Format response based on user type
    if (isCustomer) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'customer',
        status: 'active',
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } else {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user (admin only)
router.delete('/users/:id', authenticate, ensureAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to find and delete from User model
    let deleted = await User.destroy({ where: { id } });
    
    // If not found in User model, try Customer model
    if (deleted === 0) {
      deleted = await Customer.destroy({ where: { id } });
      
      if (deleted === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin dashboard stats
router.get('/dashboard/stats', authenticate, ensureAdmin, async (req, res) => {
  try {
    // Count users by role
    const adminOwnerCount = await User.count();
    const customerCount = await Customer.count();
    const totalUsers = adminOwnerCount + customerCount;
    
    // You would add more stats here based on your models
    // For example, car counts, rental counts, revenue, etc.
    
    res.json({
      totalUsers,
      usersByRole: {
        admin: await User.count({ where: { role: 'admin' } }),
        owner: await User.count({ where: { role: 'owner' } }),
        customer: customerCount
      },
      // Add more stats as needed
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
