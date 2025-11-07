import db from './models/index.js';

async function checkAnalyticsData() {
  try {
    console.log('=== Checking Analytics Data ===\n');
    
    // Get all cars with owner info
    const cars = await db.Car.findAll({
      attributes: ['id', 'brand', 'model', 'year', 'isAvailable', 'ownerId'],
      include: [{
        model: db.User,
        as: 'owner',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });
    
    console.log(`Total cars in database: ${cars.length}\n`);
    
    // Group by owner
    const carsByOwner = {};
    cars.forEach(car => {
      const ownerId = car.ownerId;
      if (!carsByOwner[ownerId]) {
        carsByOwner[ownerId] = {
          owner: car.owner,
          cars: [],
          activeCars: 0,
          inactiveCars: 0
        };
      }
      carsByOwner[ownerId].cars.push(car);
      if (car.isAvailable) {
        carsByOwner[ownerId].activeCars++;
      } else {
        carsByOwner[ownerId].inactiveCars++;
      }
    });
    
    // Display results
    for (const [ownerId, data] of Object.entries(carsByOwner)) {
      console.log(`Owner: ${data.owner?.name || 'Unknown'} (ID: ${ownerId})`);
      console.log(`  Email: ${data.owner?.email || 'N/A'}`);
      console.log(`  Role: ${data.owner?.role || 'N/A'}`);
      console.log(`  Total Cars: ${data.cars.length}`);
      console.log(`  Active Cars (isAvailable=true): ${data.activeCars}`);
      console.log(`  Inactive Cars (isAvailable=false): ${data.inactiveCars}`);
      console.log('  Cars:');
      data.cars.forEach(car => {
        console.log(`    - ${car.brand} ${car.model} ${car.year} (ID: ${car.id}) - isAvailable: ${car.isAvailable}`);
      });
      console.log('');
    }
    
    // Check rentals
    console.log('=== Checking Rentals ===\n');
    const rentals = await db.Rental.findAll({
      include: [{
        model: db.Car,
        as: 'car',
        attributes: ['id', 'brand', 'model', 'ownerId']
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    console.log(`Total recent rentals: ${rentals.length}\n`);
    rentals.forEach(rental => {
      console.log(`Rental ID: ${rental.id}`);
      console.log(`  Car: ${rental.car?.brand} ${rental.car?.model} (Owner ID: ${rental.car?.ownerId})`);
      console.log(`  Status: ${rental.status}`);
      console.log(`  Total Cost: $${rental.totalCost}`);
      console.log(`  Start: ${rental.startDate}`);
      console.log(`  End: ${rental.endDate}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking analytics data:', error);
    process.exit(1);
  }
}

checkAnalyticsData();
