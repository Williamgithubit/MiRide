import db from '../models/index.js';
import { calculateCommission } from '../controllers/stripeConnectController.js';

/**
 * Fix existing payment records that have 0 platform fees
 * This script recalculates and updates platform fees and owner amounts
 */
async function fixPaymentPlatformFees() {
  try {
    console.log('🔧 Starting payment platform fees fix...\n');

    // Find all payments with 0 platform fee
    const paymentsToFix = await db.Payment.findAll({
      where: {
        platformFee: 0.00,
      },
      include: [
        {
          model: db.Rental,
          as: 'rental',
          attributes: ['id', 'totalAmount', 'platformFee', 'ownerPayout'],
        },
      ],
    });

    console.log(`Found ${paymentsToFix.length} payment(s) with 0 platform fee\n`);

    if (paymentsToFix.length === 0) {
      console.log('✅ No payments need fixing!');
      return;
    }

    let fixedCount = 0;
    let errorCount = 0;

    for (const payment of paymentsToFix) {
      try {
        const totalAmount = parseFloat(payment.totalAmount);
        
        // Calculate correct commission
        const { platformFee, ownerPayout } = calculateCommission(totalAmount);

        console.log(`Payment ID: ${payment.id}`);
        console.log(`  Rental ID: ${payment.rentalId}`);
        console.log(`  Total Amount: $${totalAmount}`);
        console.log(`  OLD Platform Fee: $${payment.platformFee}`);
        console.log(`  NEW Platform Fee: $${platformFee}`);
        console.log(`  OLD Owner Amount: $${payment.ownerAmount}`);
        console.log(`  NEW Owner Amount: $${ownerPayout}`);

        // Update payment record
        await payment.update({
          platformFee: platformFee,
          ownerAmount: ownerPayout,
        });

        // Update rental record if it exists and has 0 fees
        if (payment.rental && parseFloat(payment.rental.platformFee) === 0) {
          await db.Rental.update(
            {
              platformFee: platformFee,
              ownerPayout: ownerPayout,
            },
            {
              where: { id: payment.rentalId },
            }
          );
          console.log(`  ✅ Updated rental record as well`);
        }

        // Update owner profile balance
        const ownerProfile = await db.OwnerProfile.findOne({
          where: { userId: payment.ownerId },
        });

        if (ownerProfile) {
          // Add the owner payout to their balance
          const newTotalEarnings = parseFloat(ownerProfile.totalEarnings || 0) + parseFloat(ownerPayout);
          const newAvailableBalance = parseFloat(ownerProfile.availableBalance || 0) + parseFloat(ownerPayout);

          await ownerProfile.update({
            totalEarnings: newTotalEarnings,
            availableBalance: newAvailableBalance,
          });

          console.log(`  ✅ Updated owner balance: +$${ownerPayout}`);
        }

        console.log(`  ✅ Fixed!\n`);
        fixedCount++;
      } catch (error) {
        console.error(`  ❌ Error fixing payment ${payment.id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  Total payments found: ${paymentsToFix.length}`);
    console.log(`  Successfully fixed: ${fixedCount}`);
    console.log(`  Errors: ${errorCount}`);
    console.log('\n✅ Fix completed!');
  } catch (error) {
    console.error('❌ Error running fix script:', error);
    throw error;
  }
}

// Run the fix if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  fixPaymentPlatformFees()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export default fixPaymentPlatformFees;
