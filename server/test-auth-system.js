import db from './models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

async function testAuthSystem() {
  try {
    console.log('🔍 Testing Authentication System...\n');

    // Test 1: Check database connection
    console.log('1. Testing database connection...');
    await db.sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Test 2: Check existing users
    console.log('2. Checking existing users...');
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive'],
      limit: 5
    });
    
    if (users.length > 0) {
      console.log(`✅ Found ${users.length} existing users:`);
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
      });
    } else {
      console.log('⚠️  No users found in database');
    }
    console.log('');

    // Test 3: Create a test user if none exist
    let testUser = users.find(u => u.email === 'test@miride.com');
    
    if (!testUser) {
      console.log('3. Creating test user...');
      testUser = await db.User.create({
        name: 'Test Customer',
        email: 'test@miride.com',
        password: 'password123', // Will be hashed automatically
        phone: '+1234567890',
        role: 'customer',
        isActive: true
      });
      console.log(`✅ Test user created with ID: ${testUser.id}`);
      
      // Create customer profile
      await db.CustomerProfile.create({
        userId: testUser.id,
        driverLicense: 'DL123456789',
        address: '123 Test Street, Test City, TC 12345'
      });
      console.log('✅ Customer profile created');
    } else {
      console.log(`3. Test user already exists with ID: ${testUser.id}`);
    }
    console.log('');

    // Test 4: Test JWT token creation and verification
    console.log('4. Testing JWT token system...');
    const token = jwt.sign(
      { 
        id: testUser.id, 
        email: testUser.email, 
        role: testUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log('✅ JWT token created');

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ JWT token verified');
    console.log(`   Decoded ID: ${decoded.id} (Type: ${typeof decoded.id})`);
    console.log(`   Decoded Email: ${decoded.email}`);
    console.log(`   Decoded Role: ${decoded.role}`);
    console.log('');

    // Test 5: Test user lookup by ID
    console.log('5. Testing user lookup by ID...');
    const foundUser = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: db.CustomerProfile, as: 'customerProfile' }
      ]
    });
    
    if (foundUser) {
      console.log('✅ User found by ID');
      console.log(`   Name: ${foundUser.name}`);
      console.log(`   Email: ${foundUser.email}`);
      console.log(`   Role: ${foundUser.role}`);
      console.log(`   ID: ${foundUser.id} (Type: ${typeof foundUser.id})`);
      console.log(`   Has Profile: ${!!foundUser.customerProfile}`);
    } else {
      console.log('❌ User not found by ID');
    }
    console.log('');

    // Test 6: Test password validation
    console.log('6. Testing password validation...');
    const isValidPassword = await foundUser.validPassword('password123');
    console.log(`✅ Password validation: ${isValidPassword ? 'PASS' : 'FAIL'}`);
    console.log('');

    console.log('🎉 Authentication system test completed successfully!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   - Database: Connected`);
    console.log(`   - Users in DB: ${users.length}`);
    console.log(`   - Test User ID: ${testUser.id}`);
    console.log(`   - JWT System: Working`);
    console.log(`   - User Lookup: Working`);
    console.log(`   - Password Validation: ${isValidPassword ? 'Working' : 'Failed'}`);
    
    console.log('\n🔑 Test Login Credentials:');
    console.log(`   Email: test@miride.com`);
    console.log(`   Password: password123`);
    console.log(`   User ID: ${testUser.id}`);

  } catch (error) {
    console.error('❌ Authentication system test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testAuthSystem();
