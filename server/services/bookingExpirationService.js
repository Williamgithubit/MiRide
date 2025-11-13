import db from '../models/index.js';
import NotificationService from './notificationService.js';
import { Op } from 'sequelize';

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
   * Start the expiration check interval
   * @param {number} intervalMinutes - How often to check (default: 60 minutes)
   */
  static startExpirationChecker(intervalMinutes = 60) {
    console.log(`Starting booking expiration checker (interval: ${intervalMinutes} minutes)`);
    
    // Run immediately on start
    this.checkExpiredBookings();

    // Then run at specified interval
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      this.checkExpiredBookings();
    }, intervalMs);
  }
}

export default BookingExpirationService;
