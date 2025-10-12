import db from './models/index.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to create an admin user in the database
 * Usage: node createAdmin.js
 */

const createAdminUser = async () => {
  try {
    console.log('🔄 Connecting to database...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Admin credentials - CHANGE THESE VALUES
    const adminData = {
      name: 'Admin User',
      email: 'admin@miride.com',
      phone: '+231778711864',
      password: 'Admin@123456', // Change this to a secure password
      role: 'admin',
      isActive: true
    };

    console.log('\n📝 Creating admin user with the following details:');
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Phone: ${adminData.phone}`);
    console.log(`   Role: ${adminData.role}`);

    // Check if admin already exists
    const existingAdmin = await db.User.findOne({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('\n⚠️  Admin user with this email already exists!');
      console.log(`   User ID: ${existingAdmin.id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      const readline = await import('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise((resolve) => {
        rl.question('\n❓ Do you want to update this user to admin? (yes/no): ', resolve);
      });
      rl.close();

      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await existingAdmin.update({
          role: 'admin',
          isActive: true
        });
        console.log('\n✅ User updated to admin successfully!');
      } else {
        console.log('\n❌ Operation cancelled.');
      }
      
      process.exit(0);
    }

    // Create new admin user
    const admin = await db.User.create(adminData);

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created At: ${admin.createdAt}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.name === 'SequelizeValidationError') {
      console.error('\n📝 Validation errors:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    }
    process.exit(1);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run the script
console.log('🚀 MiRide Admin User Creation Script\n');
console.log('=' .repeat(50));

createAdminUser();
