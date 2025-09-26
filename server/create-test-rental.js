import db from './models/index.js';

async function createTestRental() {
  try {
    console.log('🚗 Creating test rental for Moses Johnson...\n');

    // Find Moses Johnson
    const moses = await db.User.findOne({ 
      where: { email: 'moses@gmail.com' } 
    });

    if (!moses) {
      console.log('❌ Moses Johnson not found');
      return;
    }

    // Find a car
    const car = await db.Car.findOne();
    if (!car) {
      console.log('❌ No cars found');
      return;
    }

    console.log(`✅ Moses found: ${moses.name} (${moses.id})`);
    console.log(`✅ Car found: ${car.brand} ${car.model} (${car.id})`);

    // Create a test rental for Moses
    const rental = await db.Rental.create({
      customerId: moses.id,
      carId: car.id,
      ownerId: car.ownerId,
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      totalDays: 3,
      totalCost: 180.00, // Legacy field
      totalAmount: 180.00,
      status: 'pending_approval',
      paymentStatus: 'paid',
      paymentIntentId: 'pi_test_moses_' + Date.now(),
      stripeSessionId: 'cs_test_moses_' + Date.now(),
      pickupLocation: 'Test Location Moses',
      dropoffLocation: 'Test Location Moses',
      specialRequests: 'Test rental for Moses Johnson',
      hasInsurance: true,
      hasGPS: false,
      hasChildSeat: false,
      hasAdditionalDriver: false,
      insuranceCost: 45.00,
      gpsCost: 0,
      childSeatCost: 0,
      additionalDriverCost: 0
    });

    console.log(`✅ Test rental created for Moses: ID ${rental.id}`);

    // Verify the rental was created
    const mosesRentals = await db.Rental.findAll({
      where: { customerId: moses.id },
      include: [
        { 
          model: db.Car,
          as: 'car',
          attributes: ['id', 'name', 'model', 'brand', 'year']
        }
      ]
    });

    console.log(`✅ Moses now has ${mosesRentals.length} rentals:`);
    mosesRentals.forEach(rental => {
      console.log(`   - Rental ID: ${rental.id}, Car: ${rental.car?.brand} ${rental.car?.model}, Status: ${rental.status}, Amount: $${rental.totalAmount}`);
    });

    console.log('\n🎉 Test rental created successfully!');
    console.log('Now Moses Johnson should see this rental in his dashboard.');

  } catch (error) {
    console.error('❌ Failed to create test rental:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
createTestRental();
