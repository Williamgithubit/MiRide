import db from './models/index.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

/**
 * Interactive script to create an admin user
 * Usage: node createAdminInteractive.js
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

const createAdminUser = async () => {
  try {
    console.log('🚀 MiRide Admin User Creation Script\n');
    console.log('=' .repeat(50));
    console.log('🔄 Connecting to database...');
    
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.\n');

    // Collect admin information interactively
    console.log('📝 Please provide admin user details:\n');
    
    const name = await question('👤 Full Name: ');
    const email = await question('📧 Email: ');
    const phone = await question('📱 Phone (optional, press Enter to skip): ');
    const password = await question('🔐 Password: ');
    const confirmPassword = await question('🔐 Confirm Password: ');

    // Validate inputs
    if (!name || !email || !password) {
      console.log('\n❌ Name, email, and password are required!');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.log('\n❌ Passwords do not match!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.log('\n❌ Password must be at least 6 characters long!');
      process.exit(1);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('\n❌ Invalid email format!');
      process.exit(1);
    }

    const adminData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      password: password,
      role: 'admin',
      isActive: true
    };

    console.log('\n📋 Creating admin user with:');
    console.log(`   Name: ${adminData.name}`);
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Phone: ${adminData.phone || 'Not provided'}`);
    console.log(`   Role: ${adminData.role}`);

    // Check if user already exists
    const existingUser = await db.User.findOne({
      where: { email: adminData.email }
    });

    if (existingUser) {
      console.log('\n⚠️  A user with this email already exists!');
      console.log(`   Current Role: ${existingUser.role}`);
      
      if (existingUser.role === 'admin') {
        console.log('\n❌ This user is already an admin!');
        process.exit(0);
      }

      const update = await question('\n❓ Do you want to upgrade this user to admin? (yes/no): ');

      if (update.toLowerCase() === 'yes' || update.toLowerCase() === 'y') {
        await existingUser.update({
          role: 'admin',
          isActive: true,
          password: password // Update password if provided
        });
        console.log('\n✅ User upgraded to admin successfully!');
        console.log(`   User ID: ${existingUser.id}`);
      } else {
        console.log('\n❌ Operation cancelled.');
      }
      
      rl.close();
      process.exit(0);
    }

    // Create new admin user
    const admin = await db.User.create(adminData);

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📋 Admin Details:');
    console.log(`   ID: ${admin.id}`);
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Phone: ${admin.phone || 'Not provided'}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Created At: ${admin.createdAt}`);
    
    console.log('\n🔐 Login Credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: [Hidden for security]`);
    console.log('\n⚠️  IMPORTANT: Store these credentials securely!');
    console.log('✅ You can now login to the admin dashboard.');

  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.name === 'SequelizeValidationError') {
      console.error('\n📝 Validation errors:');
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`);
      });
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      console.error('\n⚠️  A user with this email already exists!');
    }
    process.exit(1);
  } finally {
    // Close readline and database connection
    rl.close();
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run the script
createAdminUser();
