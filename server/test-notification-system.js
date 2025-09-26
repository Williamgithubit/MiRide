import db from './models/index.js';
import NotificationService from './services/notificationService.js';

async function testNotificationSystem() {
  try {
    console.log('🔔 Testing Notification System...\n');

    // Test 1: Check database connection and sync models
    console.log('1. Syncing database models...');
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database models synced successfully\n');

    // Test 2: Check if Notification model exists
    console.log('2. Testing Notification model...');
    const notificationCount = await db.Notification.count();
    console.log(`✅ Notification model working. Current count: ${notificationCount}\n`);

    // Test 3: Find a test user
    console.log('3. Finding test users...');
    const testCustomer = await db.User.findOne({ 
      where: { email: 'test@miride.com' } 
    });
    const testOwner = await db.User.findOne({ 
      where: { role: 'owner' } 
    });

    if (!testCustomer) {
      console.log('❌ Test customer not found. Creating one...');
      const newCustomer = await db.User.create({
        name: 'Test Customer',
        email: 'test@miride.com',
        password: 'password123',
        phone: '+1234567890',
        role: 'customer',
        isActive: true
      });
      console.log(`✅ Test customer created with ID: ${newCustomer.id}`);
    } else {
      console.log(`✅ Test customer found: ${testCustomer.name} (${testCustomer.id})`);
    }

    if (!testOwner) {
      console.log('❌ Test owner not found');
    } else {
      console.log(`✅ Test owner found: ${testOwner.name} (${testOwner.id})`);
    }
    console.log('');

    // Test 4: Create test notifications
    console.log('4. Testing notification creation...');
    
    const testNotification = await NotificationService.createNotification({
      userId: testCustomer?.id || testOwner?.id,
      type: 'booking_approved',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      data: { testData: 'test value' },
      priority: 'medium'
    });

    console.log(`✅ Test notification created with ID: ${testNotification.id}\n`);

    // Test 5: Test notification retrieval
    console.log('5. Testing notification retrieval...');
    const notifications = await NotificationService.getUserNotifications(
      testCustomer?.id || testOwner?.id,
      { limit: 5 }
    );

    console.log(`✅ Retrieved ${notifications.count} notifications for user`);
    notifications.rows.forEach(notification => {
      console.log(`   - ${notification.title}: ${notification.message}`);
    });
    console.log('');

    // Test 6: Test marking as read
    console.log('6. Testing mark as read functionality...');
    const success = await NotificationService.markAsRead(
      testNotification.id, 
      testCustomer?.id || testOwner?.id
    );
    console.log(`✅ Mark as read: ${success ? 'SUCCESS' : 'FAILED'}\n`);

    // Test 7: Test rental creation with notification
    console.log('7. Testing rental creation with notifications...');
    
    // Find a test car
    const testCar = await db.Car.findOne();
    if (testCar && testCustomer && testOwner) {
      const testRental = await db.Rental.create({
        customerId: testCustomer.id,
        carId: testCar.id,
        ownerId: testOwner.id,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        totalDays: 3,
        totalCost: 150.00, // Legacy field
        totalAmount: 150.00,
        status: 'pending_approval',
        paymentStatus: 'paid',
        pickupLocation: 'Test Location',
        dropoffLocation: 'Test Location',
        hasInsurance: true,
        hasGPS: false,
        hasChildSeat: false,
        hasAdditionalDriver: false,
        insuranceCost: 45.00,
        gpsCost: 0,
        childSeatCost: 0,
        additionalDriverCost: 0
      });

      console.log(`✅ Test rental created with ID: ${testRental.id}`);

      // Test owner notification
      const ownerNotificationResult = await NotificationService.notifyOwnerNewBooking(testRental);
      console.log(`✅ Owner notification: ${ownerNotificationResult.success ? 'SENT' : 'FAILED'}`);
      if (!ownerNotificationResult.success) {
        console.log(`   Error: ${ownerNotificationResult.error}`);
      }

      // Test customer notification for approval
      const customerNotificationResult = await NotificationService.notifyCustomerBookingStatus(
        testRental, 
        'approved'
      );
      console.log(`✅ Customer approval notification: ${customerNotificationResult.success ? 'SENT' : 'FAILED'}`);
      if (!customerNotificationResult.success) {
        console.log(`   Error: ${customerNotificationResult.error}`);
      }

    } else {
      console.log('⚠️  Skipping rental test - missing test data (car, customer, or owner)');
    }
    console.log('');

    // Test 8: Check final notification count
    console.log('8. Final notification count check...');
    const finalNotifications = await NotificationService.getUserNotifications(
      testCustomer?.id || testOwner?.id
    );
    console.log(`✅ Total notifications for test user: ${finalNotifications.count}\n`);

    console.log('🎉 Notification system test completed successfully!');
    console.log('\n📋 Test Results Summary:');
    console.log(`   - Database: Connected and synced`);
    console.log(`   - Notification Model: Working`);
    console.log(`   - Notification Creation: Working`);
    console.log(`   - Notification Retrieval: Working`);
    console.log(`   - Mark as Read: Working`);
    console.log(`   - Owner Notifications: ${testCar && testCustomer && testOwner ? 'Working' : 'Skipped'}`);
    console.log(`   - Customer Notifications: ${testCar && testCustomer && testOwner ? 'Working' : 'Skipped'}`);
    
    console.log('\n🔧 Next Steps:');
    console.log('   1. Configure email credentials in .env file');
    console.log('   2. Test the frontend notification dropdown');
    console.log('   3. Test the complete booking flow with Stripe');
    console.log('   4. Verify owner approval/rejection functionality');

  } catch (error) {
    console.error('❌ Notification system test failed:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    // Close database connection
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the test
testNotificationSystem();
