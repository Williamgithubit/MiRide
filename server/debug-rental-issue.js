import db from './models/index.js';

async function debugRentalIssue() {
  try {
    console.log('🔍 Debugging Rental Issue...\n');

    // Test 1: Check if any rentals exist
    console.log('1. Checking all rentals in database...');
    const allRentals = await db.Rental.findAll({
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    console.log(`✅ Found ${allRentals.length} rentals in database`);
    allRentals.forEach(rental => {
      console.log(`   - Rental ID: ${rental.id}, Customer: ${rental.customer?.name} (${rental.customerId}), Car: ${rental.car?.brand} ${rental.car?.model}, Status: ${rental.status}`);
    });
    console.log('');

    // Test 2: Check specific test customer rentals
    console.log('2. Checking test customer rentals...');
    const testCustomer = await db.User.findOne({ 
      where: { email: 'test@miride.com' } 
    });
    
    if (testCustomer) {
      console.log(`✅ Test customer found: ${testCustomer.name} (${testCustomer.id})`);
      
      const customerRentals = await db.Rental.findAll({
        where: { customerId: testCustomer.id },
        include: [
          { 
            model: db.Car,
            as: 'car',
            attributes: ['id', 'name', 'model', 'brand', 'year']
          }
        ]
      });
      
      console.log(`✅ Found ${customerRentals.length} rentals for test customer`);
      customerRentals.forEach(rental => {
        console.log(`   - Rental ID: ${rental.id}, Car: ${rental.car?.brand} ${rental.car?.model}, Status: ${rental.status}, Amount: $${rental.totalAmount}`);
      });
    } else {
      console.log('❌ Test customer not found');
    }
    console.log('');

    // Test 3: Check recent rentals (last 24 hours)
    console.log('3. Checking recent rentals (last 24 hours)...');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRentals = await db.Rental.findAll({
      where: {
        createdAt: {
          [db.Sequelize.Op.gte]: yesterday
        }
      },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    console.log(`✅ Found ${recentRentals.length} recent rentals`);
    recentRentals.forEach(rental => {
      console.log(`   - Created: ${rental.createdAt}, Customer: ${rental.customer?.name}, Car: ${rental.car?.brand} ${rental.car?.model}, Status: ${rental.status}`);
    });
    console.log('');

    // Test 4: Check for any rentals with status 'pending_approval'
    console.log('4. Checking pending approval rentals...');
    const pendingRentals = await db.Rental.findAll({
      where: { status: 'pending_approval' },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        },
        {
          model: db.User,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    console.log(`✅ Found ${pendingRentals.length} pending approval rentals`);
    pendingRentals.forEach(rental => {
      console.log(`   - Rental ID: ${rental.id}, Customer: ${rental.customer?.name}, Car: ${rental.car?.brand} ${rental.car?.model}, Payment: ${rental.paymentStatus}`);
    });
    console.log('');

    // Test 5: Check all users to see customer IDs
    console.log('5. Checking all users...');
    const allUsers = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      limit: 10
    });
    
    console.log(`✅ Found ${allUsers.length} users`);
    allUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - ID: ${user.id}`);
    });
    console.log('');

    console.log('🎯 Debug Summary:');
    console.log(`   - Total rentals: ${allRentals.length}`);
    console.log(`   - Recent rentals: ${recentRentals.length}`);
    console.log(`   - Pending rentals: ${pendingRentals.length}`);
    
    // Test 6: Check Moses Johnson's rentals (the user in the dashboard)
    console.log('6. Checking Moses Johnson rentals...');
    const mosesUser = await db.User.findOne({ 
      where: { email: 'moses@gmail.com' } 
    });
    
    if (mosesUser) {
      console.log(`✅ Moses found: ${mosesUser.name} (${mosesUser.id})`);
      
      const mosesRentals = await db.Rental.findAll({
        where: { customerId: mosesUser.id },
        include: [
          { 
            model: db.Car,
            as: 'car',
            attributes: ['id', 'name', 'model', 'brand', 'year']
          }
        ]
      });
      
      console.log(`✅ Found ${mosesRentals.length} rentals for Moses`);
      mosesRentals.forEach(rental => {
        console.log(`   - Rental ID: ${rental.id}, Car: ${rental.car?.brand} ${rental.car?.model}, Status: ${rental.status}`);
      });
    } else {
      console.log('❌ Moses not found');
    }

    console.log(`   - Test customer rentals: ${testCustomer ? 1 : 'N/A'}`);
    console.log(`   - Moses rentals: ${mosesUser ? mosesRentals?.length || 0 : 'N/A'}`);

  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the debug
debugRentalIssue();
