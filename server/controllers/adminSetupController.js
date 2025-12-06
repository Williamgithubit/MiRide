import db from '../models/index.js';
import bcrypt from 'bcryptjs';

// Secret key for admin setup - MUST match environment variable
const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'change-this-secret-key-in-production';

/**
 * Secure endpoint to create/update admin user in production
 * Requires a secret key to prevent unauthorized access
 * 
 * POST /api/admin-setup/create-admin
 */
export const createAdminUser = async (req, res) => {
  try {
    const { secret, email, password, name, phone } = req.body;
    
    // Debug logging
    console.log('🔍 Debug Info:');
    console.log('Received secret length:', secret ? secret.length : 0);
    console.log('Expected secret length:', ADMIN_SETUP_SECRET.length);
    console.log('Received secret:', JSON.stringify(secret));
    console.log('Expected secret:', JSON.stringify(ADMIN_SETUP_SECRET));
    console.log('Secrets match:', secret === ADMIN_SETUP_SECRET);
    
    // Validate secret key
    if (!secret || secret !== ADMIN_SETUP_SECRET) {
      console.warn('⚠️ Unauthorized admin setup attempt');
      return res.status(403).json({ 
        message: 'Forbidden: Invalid setup secret' 
      });
    }
    
    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ 
        message: 'Missing required fields: email, password, name' 
      });
    }
    
    console.log('🔧 Admin setup initiated for:', email);
    console.log('📊 Database info:', {
      dialect: db.sequelize.options.dialect,
      database: db.sequelize.config.database,
      host: db.sequelize.config.host
    });
    
    // Check if admin already exists
    console.log('🔍 Checking if user exists...');
    const existingAdmin = await db.User.findOne({ where: { email } });
    console.log('Existing admin found:', !!existingAdmin);
    
    if (existingAdmin) {
      console.log('📝 Updating existing admin user...');
      
      // Update existing admin
      // Hash the password manually to avoid double-hashing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      await existingAdmin.update({
        name,
        phone: phone || existingAdmin.phone,
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        termsAccepted: false,
        termsAcceptedAt: new Date()
      }, {
        // Skip hooks to prevent double-hashing
        hooks: false
      });
      
      console.log('✅ Admin user updated successfully');
      
      return res.status(200).json({
        success: true,
        message: 'Admin user updated successfully',
        user: {
          id: existingAdmin.id,
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    } else {
      console.log('➕ Creating new admin user...');
      
      // Create new admin user
      // Hash the password manually
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log('✅ Password hashed, length:', hashedPassword.length);
      
      console.log('💾 Attempting to create user in database...');
      const newAdmin = await db.User.create({
        name,
        email,
        phone: phone || '+231778711864',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        termsAccepted: false,
        termsAcceptedAt: new Date()
      }, {
        // Skip hooks to prevent double-hashing
        hooks: false
      });
      
      console.log('✅ Admin user created successfully');
      console.log('📝 Created user details:', {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
        isActive: newAdmin.isActive
      });
      
      // Verify the user was actually saved
      const verifyUser = await db.User.findOne({ where: { email } });
      console.log('🔍 Verification - User exists in DB:', !!verifyUser);
      if (!verifyUser) {
        throw new Error('User creation succeeded but user not found in database!');
      }
      
      return res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          name: newAdmin.name,
          role: newAdmin.role
        }
      });
    }
  } catch (error) {
    console.error('❌ Admin setup error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      sql: error.sql || 'N/A'
    });
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Verify admin setup endpoint is working
 * GET /api/admin-setup/health
 */
export const healthCheck = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin setup endpoint is active',
    timestamp: new Date().toISOString()
  });
};

/**
 * Test password hash verification
 */
export const verifyPassword = async (req, res) => {
  try {
    const { secret, email, password } = req.body;
    
    // Validate secret key
    if (!secret || secret !== ADMIN_SETUP_SECRET) {
      return res.status(403).json({ 
        message: 'Forbidden: Invalid setup secret' 
      });
    }
    
    // Find user
    const user = await db.User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    return res.status(200).json({
      success: true,
      email: user.email,
      passwordMatch: isValid,
      message: isValid ? 'Password is correct' : 'Password does not match',
      userDetails: {
        id: user.id,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Password verification error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};
