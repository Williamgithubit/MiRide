// Script to update a rental's endDate to the past for testing reviews
import db from './models/index.js';

async function updateRentalForTesting() {
  try {
    // Find an approved rental
    const rental = await db.Rental.findOne({
      where: { 
        id: 3, // Rental ID 3 from your logs
        status: 'approved'
      }
    });

    if (!rental) {
      console.log('No approved rental found with ID 3');
      return;
    }

    console.log('Found rental:', {
      id: rental.id,
      status: rental.status,
      currentStartDate: rental.startDate,
      currentEndDate: rental.endDate
    });

    // Update dates to past dates (3 days ago to yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    await rental.update({
      startDate: threeDaysAgo.toISOString().split('T')[0], // Format: YYYY-MM-DD
      endDate: yesterday.toISOString().split('T')[0], // Format: YYYY-MM-DD
      status: 'completed' // Also mark as completed
    }, {
      validate: false // Bypass validations for testing
    });

    console.log('✅ Rental updated successfully!');
    console.log('New endDate:', rental.endDate);
    console.log('New status:', rental.status);
    console.log('\nYou can now test the review functionality in the My Reviews page.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating rental:', error);
    process.exit(1);
  }
}

updateRentalForTesting();
