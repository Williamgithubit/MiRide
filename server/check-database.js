import db from './models/index.js';

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Check Cars
    console.log('=== CARS ===');
    const cars = await db.Car.findAll({
      attributes: ['id', 'name', 'brand', 'model', 'year', 'ownerId', 'isAvailable'],
      limit: 10
    });
    
    if (cars.length === 0) {
      console.log('❌ No cars found in database');
    } else {
      console.log(`✅ Found ${cars.length} cars:`);
      cars.forEach(car => {
        console.log(`  - ID: ${car.id}, Name: ${car.name}, Brand: ${car.brand}, Model: ${car.model}, Owner: ${car.ownerId}, Available: ${car.isAvailable}`);
      });
    }
    
    // Check Users
    console.log('\n=== USERS ===');
    const users = await db.User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      limit: 10
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    // Check Rentals
    console.log('\n=== RENTALS ===');
    const rentals = await db.Rental.findAll({
      attributes: ['id', 'customerId', 'carId', 'ownerId', 'status', 'startDate', 'endDate'],
      limit: 10
    });
    
    if (rentals.length === 0) {
      console.log('❌ No rentals found in database');
    } else {
      console.log(`✅ Found ${rentals.length} rentals:`);
      rentals.forEach(rental => {
        console.log(`  - ID: ${rental.id}, Car: ${rental.carId}, Customer: ${rental.customerId}, Owner: ${rental.ownerId}, Status: ${rental.status}`);
      });
    }
    
    console.log('\n🔍 Database check complete!');
    
  } catch (error) {
    console.error('💥 Error checking database:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();
