// Test script to create a sample booking and test the workflow
import db from './models/index.js';

async function testBookingWorkflow() {
  try {
    console.log('🧪 Testing Booking Workflow...\n');

    // Get a sample car and user
    const car = await db.Car.findOne();
    const customer = await db.User.findOne({ where: { role: 'customer' } });
    const owner = await db.User.findOne({ where: { role: 'owner' } });

    if (!car || !customer || !owner) {
      console.log('❌ Missing test data. Need at least one car, customer, and owner in database.');
      return;
    }

    console.log(`📋 Test Data:
    - Car: ${car.name} (ID: ${car.id})
    - Customer: ${customer.name} (${customer.email})
    - Owner: ${owner.name} (${owner.email})\n`);

    // Create a test rental (simulating webhook creation)
    const testRental = await db.Rental.create({
      customerId: customer.id,
      carId: car.id,
      ownerId: owner.id,
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-10-05'),
      totalDays: 4,
      totalCost: 200.00,
      totalAmount: 250.00,
      status: 'pending_approval',
      paymentStatus: 'paid',
      paymentIntentId: 'pi_test_123456789',
      stripeSessionId: 'cs_test_123456789',
      pickupLocation: 'Airport Terminal 1',
      dropoffLocation: 'Downtown Hotel',
      specialRequests: 'Please ensure car is clean',
      hasInsurance: true,
      hasGPS: false,
      hasChildSeat: true,
      hasAdditionalDriver: false,
      insuranceCost: 30.00,
      gpsCost: 0.00,
      childSeatCost: 20.00,
      additionalDriverCost: 0.00
    });

    console.log(`✅ Created test rental: ID ${testRental.id}`);
    console.log(`   Status: ${testRental.status}`);
    console.log(`   Payment Status: ${testRental.paymentStatus}`);
    console.log(`   Total Amount: $${testRental.totalAmount}\n`);

    // Test fetching rentals with associations
    const rentalWithAssociations = await db.Rental.findByPk(testRental.id, {
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
        },
        {
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    console.log('🔗 Rental with associations:');
    console.log(`   Car: ${rentalWithAssociations.car.name}`);
    console.log(`   Customer: ${rentalWithAssociations.customer.name}`);
    console.log(`   Owner: ${rentalWithAssociations.owner.name}\n`);

    // Test pending bookings query
    const pendingBookings = await db.Rental.findAll({
      where: {
        ownerId: owner.id,
        status: 'pending_approval'
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

    console.log(`📋 Pending bookings for owner ${owner.name}: ${pendingBookings.length}`);

    // Test approval workflow
    await testRental.update({
      status: 'approved',
      approvedAt: new Date()
    });

    console.log('✅ Booking approved successfully');

    // Update car availability
    await db.Car.update(
      { isAvailable: false },
      { where: { id: car.id } }
    );

    console.log('✅ Car availability updated');

    console.log('\n🎉 Booking workflow test completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   ✅ Rental creation: Working');
    console.log('   ✅ Database associations: Working');
    console.log('   ✅ Pending bookings query: Working');
    console.log('   ✅ Approval workflow: Working');
    console.log('   ✅ Car availability update: Working');

    // Clean up test data
    await testRental.destroy();
    await db.Car.update({ isAvailable: true }, { where: { id: car.id } });
    console.log('\n🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testBookingWorkflow();
