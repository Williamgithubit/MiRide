import db from '../models/index.js';
import NotificationService from './notificationService.js';
import Stripe from 'stripe';
import { Op } from 'sequelize';

// Initialize Stripe for refunds
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// ============================================
// PENDING BOOKING TIMEOUT CONFIGURATION
// ============================================
const PENDING_TIMEOUT_CONFIG = {
  // Hours before a pending_approval booking expires if owner doesn't respond
  OWNER_RESPONSE_HOURS: 24,
  // Hours before an approved booking expires if customer doesn't start the rental
  APPROVED_EXPIRY_HOURS: 48,
  // Send reminder to owner after this many hours
  OWNER_REMINDER_HOURS: 12,
  // Send reminder to customer for approved booking after this many hours
  CUSTOMER_REMINDER_HOURS: 24,
};

class BookingExpirationService {
  
  /**
   * Check for expired bookings and send notifications
   */
  static async checkExpiredBookings() {
    try {
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today

      // Find all active or approved bookings that have passed their end date
      const expiredRentals = await db.Rental.findAll({
        where: {
          status: {
            [Op.in]: ['active', 'approved']
          },
          endDate: {
            [Op.lt]: now
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
          },
          {
            model: db.User,
            as: 'owner',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      console.log(`Found ${expiredRentals.length} expired bookings to process`);

      for (const rental of expiredRentals) {
        try {
          // Update rental status to completed
          await rental.update({ status: 'completed' });

          // Send notification to customer
          await NotificationService.notifyCustomerBookingExpired(rental);

          // Send notification to owner
          await NotificationService.notifyOwnerRentalExpired(rental);

          // Update car availability
          await db.Car.update(
            { isAvailable: true },
            { where: { id: rental.carId } }
          );

          console.log(`Processed expired rental ${rental.id}`);
        } catch (error) {
          console.error(`Error processing expired rental ${rental.id}:`, error);
        }
      }

      return {
        success: true,
        processedCount: expiredRentals.length
      };

    } catch (error) {
      console.error('Error checking expired bookings:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get time remaining until booking expires
   * @param {Date} endDate - The end date of the booking
   * @returns {Object} - Object containing time remaining info
   */
  static getTimeRemaining(endDate) {
    const now = new Date();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // End of the day

    const totalMilliseconds = end - now;
    
    if (totalMilliseconds <= 0) {
      return {
        expired: true,
        totalMilliseconds: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        percentage: 0
      };
    }

    const days = Math.floor(totalMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((totalMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    return {
      expired: false,
      totalMilliseconds,
      days,
      hours,
      minutes
    };
  }

  /**
   * Calculate expiration percentage for a booking
   * @param {Date} startDate - The start date of the booking
   * @param {Date} endDate - The end date of the booking
   * @returns {number} - Percentage of time elapsed (0-100)
   */
  static getExpirationPercentage(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const totalDuration = end - start;
    const elapsed = now - start;

    if (elapsed <= 0) return 0;
    if (elapsed >= totalDuration) return 100;

    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  /**
   * Check for pending bookings that have timed out (owner didn't respond)
   * Auto-cancels and refunds these bookings
   */
  static async checkPendingTimeouts() {
    try {
      const now = new Date();
      const timeoutThreshold = new Date(now - PENDING_TIMEOUT_CONFIG.OWNER_RESPONSE_HOURS * 60 * 60 * 1000);

      // Find pending_approval bookings older than the timeout threshold
      const timedOutBookings = await db.Rental.findAll({
        where: {
          status: 'pending_approval',
          createdAt: {
            [Op.lt]: timeoutThreshold
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
          },
          {
            model: db.User,
            as: 'owner',
            attributes: ['id', 'name', 'email']
          }
        ]
      });

      console.log(`⏰ Found ${timedOutBookings.length} pending bookings that timed out`);

      for (const rental of timedOutBookings) {
        try {
          await this.expirePendingBooking(rental, 'Owner did not respond within 24 hours');
          console.log(`✅ Expired pending booking ${rental.id} - owner timeout`);
        } catch (error) {
          console.error(`❌ Error expiring pending booking ${rental.id}:`, error);
        }
      }

      return {
        success: true,
        expiredCount: timedOutBookings.length
      };

    } catch (error) {
      console.error('Error checking pending timeouts:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Expire a pending booking and process refund
   */
  static async expirePendingBooking(rental, reason) {
    const transaction = await db.sequelize.transaction();
    
    try {
      // Update rental status
      await rental.update({
        status: 'cancelled',
        rejectionReason: reason,
        paymentStatus: 'refunded'
      }, { transaction });

      // Make car available again
      await db.Car.update(
        { isAvailable: true, status: 'available' },
        { where: { id: rental.carId }, transaction }
      );

      // Process refund if payment exists
      const payment = await db.Payment.findOne({
        where: { rentalId: rental.id },
        transaction
      });

      if (payment && payment.stripePaymentIntentId && payment.paymentStatus === 'succeeded') {
        try {
          // Full refund for timeout (not customer's fault)
          const refund = await stripe.refunds.create({
            payment_intent: payment.stripePaymentIntentId,
            reason: 'requested_by_customer',
            metadata: {
              reason: 'pending_timeout',
              rental_id: rental.id.toString(),
            }
          });

          console.log(`💰 Refund created for timed-out booking ${rental.id}:`, refund.id);

          // Update payment record
          await payment.update({
            paymentStatus: 'refunded',
            metadata: {
              ...payment.metadata,
              refundedAt: new Date(),
              refundReason: reason,
              stripeRefundId: refund.id,
            }
          }, { transaction });

          // Reverse owner balance if already credited
          if (payment.payoutStatus === 'paid') {
            const ownerProfile = await db.OwnerProfile.findOne({
              where: { userId: rental.ownerId },
              transaction
            });

            if (ownerProfile) {
              const ownerAmount = parseFloat(payment.ownerAmount || 0);
              await ownerProfile.update({
                totalEarnings: Math.max(0, parseFloat(ownerProfile.totalEarnings || 0) - ownerAmount),
                availableBalance: Math.max(0, parseFloat(ownerProfile.availableBalance || 0) - ownerAmount),
              }, { transaction });
            }
          }

          // Create refund audit record
          await db.Refund.create({
            paymentId: payment.id,
            rentalId: rental.id,
            ownerId: rental.ownerId,
            customerId: rental.customerId,
            stripeRefundId: refund.id,
            amount: parseFloat(payment.totalAmount || 0),
            currency: payment.currency || 'usd',
            reason: reason,
            metadata: { type: 'pending_timeout' }
          }, { transaction });

        } catch (stripeError) {
          console.error(`Stripe refund failed for booking ${rental.id}:`, stripeError.message);
        }
      }

      await transaction.commit();

      // Send notifications (outside transaction)
      try {
        await NotificationService.notifyCustomerBookingExpired(rental, reason);
        await NotificationService.notifyOwnerBookingExpired(rental, reason);
      } catch (notifError) {
        console.error('Error sending timeout notifications:', notifError);
      }

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Send reminders to owners who haven't responded to pending bookings
   */
  static async sendOwnerReminders() {
    try {
      const now = new Date();
      const reminderThreshold = new Date(now - PENDING_TIMEOUT_CONFIG.OWNER_REMINDER_HOURS * 60 * 60 * 1000);
      const timeoutThreshold = new Date(now - PENDING_TIMEOUT_CONFIG.OWNER_RESPONSE_HOURS * 60 * 60 * 1000);

      // Find pending bookings that are past reminder time but not yet timed out
      const pendingBookings = await db.Rental.findAll({
        where: {
          status: 'pending_approval',
          createdAt: {
            [Op.lt]: reminderThreshold,
            [Op.gte]: timeoutThreshold
          }
        },
        include: [
          {
            model: db.Car,
            as: 'car',
            attributes: ['id', 'name', 'model', 'brand']
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

      console.log(`📧 Sending reminders for ${pendingBookings.length} pending bookings`);

      for (const rental of pendingBookings) {
        try {
          const hoursRemaining = Math.round(
            (PENDING_TIMEOUT_CONFIG.OWNER_RESPONSE_HOURS * 60 * 60 * 1000 - (now - new Date(rental.createdAt))) / (60 * 60 * 1000)
          );
          
          await NotificationService.notifyOwnerPendingReminder(rental, hoursRemaining);
          console.log(`📧 Reminder sent to owner for booking ${rental.id}`);
        } catch (error) {
          console.error(`Error sending reminder for booking ${rental.id}:`, error);
        }
      }

      return {
        success: true,
        reminderCount: pendingBookings.length
      };

    } catch (error) {
      console.error('Error sending owner reminders:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check for approved bookings approaching their start date without being activated
   */
  static async checkApprovedBookingsNearStart() {
    try {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      // Find approved bookings starting today or tomorrow (not past dates)
      const upcomingBookings = await db.Rental.findAll({
        where: {
          status: 'approved',
          startDate: {
            [Op.gte]: today,  // Start date must be today or later
            [Op.lte]: tomorrow
          }
        },
        include: [
          {
            model: db.Car,
            as: 'car',
            attributes: ['id', 'name', 'model', 'brand']
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

      console.log(`🚗 Found ${upcomingBookings.length} approved bookings starting soon`);

      for (const rental of upcomingBookings) {
        try {
          // Send reminder to customer
          await NotificationService.notifyCustomerUpcomingRental(rental);
          console.log(`📧 Upcoming rental reminder sent for booking ${rental.id}`);
        } catch (error) {
          console.error(`Error sending upcoming reminder for booking ${rental.id}:`, error);
        }
      }

      return {
        success: true,
        reminderCount: upcomingBookings.length
      };

    } catch (error) {
      console.error('Error checking approved bookings near start:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get pending booking timeout info
   */
  static getPendingTimeoutInfo(rental) {
    const now = new Date();
    const createdAt = new Date(rental.createdAt);
    const timeoutAt = new Date(createdAt.getTime() + PENDING_TIMEOUT_CONFIG.OWNER_RESPONSE_HOURS * 60 * 60 * 1000);
    
    const msRemaining = timeoutAt - now;
    const hoursRemaining = Math.max(0, msRemaining / (60 * 60 * 1000));
    const minutesRemaining = Math.max(0, (msRemaining % (60 * 60 * 1000)) / (60 * 1000));

    return {
      createdAt,
      timeoutAt,
      hoursRemaining: Math.floor(hoursRemaining),
      minutesRemaining: Math.floor(minutesRemaining),
      isExpired: msRemaining <= 0,
      timeoutHours: PENDING_TIMEOUT_CONFIG.OWNER_RESPONSE_HOURS
    };
  }

  /**
   * Start the expiration check interval
   * @param {number} intervalMinutes - How often to check (default: 60 minutes)
   */
  static startExpirationChecker(intervalMinutes = 60) {
    console.log(`🕐 Starting booking expiration checker (interval: ${intervalMinutes} minutes)`);
    
    // Run all checks immediately on start
    this.runAllChecks();

    // Then run at specified interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      this.runAllChecks();
    }, intervalMs);
  }

  /**
   * Run all expiration and reminder checks
   */
  static async runAllChecks() {
    console.log('🔄 Running booking expiration checks...');
    
    try {
      // Check completed rentals (end date passed)
      const expiredResult = await this.checkExpiredBookings();
      console.log(`  ✓ Expired bookings: ${expiredResult.processedCount || 0} processed`);

      // Check pending bookings that timed out
      const pendingResult = await this.checkPendingTimeouts();
      console.log(`  ✓ Pending timeouts: ${pendingResult.expiredCount || 0} expired`);

      // Send reminders to owners
      const reminderResult = await this.sendOwnerReminders();
      console.log(`  ✓ Owner reminders: ${reminderResult.reminderCount || 0} sent`);

      // Check approved bookings near start date
      const upcomingResult = await this.checkApprovedBookingsNearStart();
      console.log(`  ✓ Upcoming reminders: ${upcomingResult.reminderCount || 0} sent`);

      console.log('✅ All booking checks completed');
    } catch (error) {
      console.error('❌ Error running booking checks:', error);
    }
  }
}

export default BookingExpirationService;
