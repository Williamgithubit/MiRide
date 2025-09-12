import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Secret key for JWT token generation - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Helper function to handle legacy user login from Customer model
const handleLegacyLogin = async (legacyUser, password, res) => {
  try {
    // Check password
    let isPasswordValid = false;
    
    if (typeof legacyUser.validatePassword === 'function') {
      isPasswordValid = await legacyUser.validatePassword(password);
    } else {
      isPasswordValid = await bcrypt.compare(password, legacyUser.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login time
    await legacyUser.update({ lastLogin: new Date() });
    
    // Create token
    const token = jwt.sign(
      { 
        id: legacyUser.id, 
        email: legacyUser.email, 
        role: legacyUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' } // Extend token expiration to 7 days
    );
    
    // Return user data (excluding password) and token
    const userData = legacyUser.toJSON();
    delete userData.password;
    
    return res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Legacy login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// JWT Secret and authentication functions

// Register a new user
export const register = async (req, res) => {
  console.log('Registration request received with body:', JSON.stringify(req.body));
  
  const { firstName, lastName, email, password, phone, role = 'customer', 
          // Additional profile fields
          address, driverLicense, // Customer fields
          businessName, businessAddress, taxId, businessPhone, businessEmail // Owner fields
        } = req.body;
  
  const name = req.body.name || (firstName ? `${firstName} ${lastName || ''}`.trim() : undefined);
  console.log('Extracted fields:', { name, email, phone, role });
  
  // Validate required fields
  if (!name) {
    console.error('Registration failed: name is missing or null');
    return res.status(400).json({ message: 'Name is required' });
  }
  
  try {
    // Check if user already exists
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user with specified role (default to customer if not specified)
    // Only allow admin creation if request is from an existing admin
    let userRole = role;
    
    console.log(`Processing registration with requested role: ${role}`);
    
    // Explicitly allow 'customer' and 'owner' roles without restrictions
    if (role === 'customer' || role === 'owner') {
      userRole = role; // Keep the requested role as is
      console.log(`Allowing requested role: ${userRole}`);
    }
    // Restrict 'admin' role creation - only allow if requested by an existing admin
    else if (role === 'admin') {
      // Check if request has a valid admin token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        userRole = 'customer'; // Default to customer if no token
        console.log('Admin role requested without token, defaulting to: customer');
      } else {
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          const requestingUser = await db.User.findByPk(decoded.id);
          
          // Only allow admin creation if requesting user is an admin
          if (!requestingUser || requestingUser.role !== 'admin') {
            userRole = 'customer';
            console.log('Admin role requested by non-admin user, defaulting to: customer');
          }
        } catch (error) {
          userRole = 'customer';
          console.log('Error verifying admin token, defaulting to: customer');
        }
      }
    } 
    // For any other role values, default to customer
    else {
      userRole = 'customer';
      console.log(`Unrecognized role '${role}', defaulting to: customer`);
    }
    
    // Use a transaction to ensure all operations succeed or fail together
    const result = await db.sequelize.transaction(async (t) => {
      // Create the new user with hashed password
      const newUser = await db.User.create({
        name,
        email,
        password, // Will be hashed in the model's beforeCreate hook
        phone,
        role: userRole,
        isActive: true
      }, { transaction: t });
      
      // Create the appropriate profile based on role
      if (userRole === 'customer') {
        await db.CustomerProfile.create({
          userId: newUser.id,
          driverLicense,
          address
        }, { transaction: t });
      } else if (userRole === 'owner') {
        await db.OwnerProfile.create({
          userId: newUser.id,
          businessName,
          businessAddress,
          taxId,
          businessPhone: businessPhone || phone,
          businessEmail: businessEmail || email
        }, { transaction: t });
      }
      
      return newUser;
    });
    
    // Create token
    const token = jwt.sign(
      { id: result.id, email: result.email, role: result.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user data (excluding password) and token
    const userData = result.toJSON();
    delete userData.password;
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for email:', email);
  
  try {
    // Find user in the User model
    const user = await db.User.findOne({ 
      where: { email },
      include: [
        { model: db.CustomerProfile, as: 'customerProfile' },
        { model: db.OwnerProfile, as: 'ownerProfile' }
      ]
    });
    
    // Log the user ID and its type for debugging
    if (user) {
      console.log('User ID:', user.id, 'ID type:', typeof user.id);
    }
    
    // If user not found
    if (!user) {
      // For backward compatibility, check the Customer model
      const legacyUser = await db.Customer.findOne({ where: { email } });
      if (legacyUser) {
        console.log('User found in legacy Customer model');
        // Handle legacy user login
        return handleLegacyLogin(legacyUser, password, res);
      }
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({ message: 'Account is deactivated. Please contact support.' });
    }
    
    // Check password
    let isPasswordValid = false;
    
    if (typeof user.validPassword === 'function') {
      isPasswordValid = await user.validPassword(password);
    } else {
      // Fallback to direct bcrypt comparison
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Update last login time if the field exists
    if ('lastLogin' in user) {
      await user.update({ lastLogin: new Date() });
    }
    
    // Prepare user data with profile information
    let userData = user.toJSON();
    delete userData.password;
    
    // Add profile-specific data based on user role
    if (user.role === 'customer' && user.customerProfile) {
      userData = {
        ...userData,
        driverLicense: user.customerProfile.driverLicense,
        address: user.customerProfile.address
      };
    } else if (user.role === 'owner' && user.ownerProfile) {
      userData = {
        ...userData,
        businessName: user.ownerProfile.businessName,
        businessAddress: user.ownerProfile.businessAddress,
        businessPhone: user.ownerProfile.businessPhone || user.phone,
        businessEmail: user.ownerProfile.businessEmail || user.email
      };
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    // User ID comes from the authenticated middleware
    const userId = req.userId;
    console.log('Getting current user with ID:', userId, 'Type:', typeof userId);
    
    // Try to find user in User model with profile data
    let user = null;
    
    try {
      user = await db.User.findByPk(userId, {
        attributes: { exclude: ['password'] },
        include: [
          { model: db.CustomerProfile, as: 'customerProfile' },
          { model: db.OwnerProfile, as: 'ownerProfile' }
        ]
      });
      
      if (user) {
        console.log(`User found in User model with ID: ${user.id}`);
        
        // Prepare user data with profile information
        let userData = user.toJSON();
        
        // Add profile-specific data based on user role
        if (user.role === 'customer' && user.customerProfile) {
          userData = {
            ...userData,
            driverLicense: user.customerProfile.driverLicense,
            address: user.customerProfile.address
          };
        } else if (user.role === 'owner' && user.ownerProfile) {
          userData = {
            ...userData,
            businessName: user.ownerProfile.businessName,
            businessAddress: user.ownerProfile.businessAddress,
            businessPhone: user.ownerProfile.businessPhone || user.phone,
            businessEmail: user.ownerProfile.businessEmail || user.email
          };
        }
        
        return res.status(200).json(userData);
      }
    } catch (userErr) {
      console.error('Error finding user in User model:', userErr);
    }
    
    // For backward compatibility, check the Customer model
    try {
      const legacyUser = await db.Customer.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
      
      if (legacyUser) {
        console.log(`User found in legacy Customer model with ID: ${legacyUser.id}`);
        return res.status(200).json({
          ...legacyUser.toJSON(),
          _modelType: 'legacy_customer'
        });
      }
    } catch (customerErr) {
      console.error('Error finding user in Customer model:', customerErr);
    }
    
    console.error('User not found with ID:', userId);
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded successfully for user ID:', decoded.id, 'Type:', typeof decoded.id);
    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      throw tokenError;
    }
    
    // Verify that the user exists in either Customer or User model
    let userExists = false;
    let userModel = null;
    
    // Check User model (Customer model was removed, now using User model only)
    try {
      const user = await db.User.findByPk(decoded.id);
      if (user) {
        userExists = true;
        userModel = 'user';
        console.log('User found in User model with ID:', decoded.id);
      }
    } catch (userErr) {
      console.error('Error checking User model:', userErr);
    }
    
    
    if (!userExists) {
      console.error('Authentication failed: User not found with ID:', decoded.id);
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Set user ID, role, and model in request for use in other middleware/routes
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userModel = userModel;
    
    console.log('Authentication successful for user:', { id: decoded.id, role: decoded.role, model: userModel });
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Role-based access control middleware
export const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (roles.length && !roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access forbidden: insufficient permissions' });
    }
    
    next();
  };
};

// Check if user can access dashboard
export const checkDashboardAccess = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Try to find user in User model first (for admin users)
    let user = await db.User.findByPk(userId);
    let isAdmin = false;
    
    // If found in User model, it's an admin user
    if (user) {
      isAdmin = user.role === 'admin';
    } else {
      // If not found in User model, try Customer model
      user = await db.Customer.findByPk(userId);
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For admin users, always grant access
    const canAccess = isAdmin || (typeof user.canAccessDashboard === 'function' ? user.canAccessDashboard() : user.role === 'owner');
    
    return res.status(200).json({
      canAccess,
      dashboardType: isAdmin ? 'admin' : (user.role === 'owner' ? 'owner' : 'customer'),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Dashboard access check error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Reset password request
export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  
  try {
    const user = await db.Customer.findOne({ where: { email } });
    if (!user) {
      // For security, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
    }
    
    // In a real application, you would:
    // 1. Generate a secure token
    // 2. Store it in the database with an expiration
    // 3. Send an email with a reset link
    
    // For this example, we'll just acknowledge the request
    return res.status(200).json({ message: 'If your email exists in our system, you will receive a password reset link' });
  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update user's own profile
export const updateProfile = async (req, res) => {
  const { name, phone, address, currentPassword, newPassword } = req.body;
  const userId = req.userId;
  
  try {
    const user = await db.Customer.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create update object with allowed fields
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    
    // If password change is requested, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new password' });
      }
      
      const isPasswordValid = await user.validatePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      updates.password = newPassword; // Will be hashed in the beforeUpdate hook
    }
    
    // Update user profile
    await user.update(updates);
    
    // Return updated user data (excluding password)
    const userData = user.toJSON();
    delete userData.password;
    
    return res.status(200).json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};