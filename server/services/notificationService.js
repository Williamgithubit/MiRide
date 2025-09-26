import db from '../models/index.js';
import nodemailer from 'nodemailer';

// Email transporter configuration (you'll need to configure this with your email service)
const createEmailTransporter = () => {
  // For development, you can use a service like Gmail, SendGrid, or Mailgun
  // For production, use a proper email service
  return nodemailer.createTransporter({
    service: 'gmail', // or your preferred email service
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

class NotificationService {
  
  /**
   * Create a notification in the database
   */
  static async createNotification({
    userId,
    type,
    title,
    message,
    data = null,
    priority = 'medium'
  }) {
    try {
      const notification = await db.Notification.create({
        userId,
        type,
        title,
        message,
        data,
        priority
      });
      
      console.log(`✅ Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  static async sendEmail({ to, subject, html, text }) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('📧 Email credentials not configured, skipping email notification');
        return { success: false, reason: 'Email not configured' };
      }

      const transporter = createEmailTransporter();
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
        text
      };

      const result = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}: ${subject}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify owner about new booking request
   */
  static async notifyOwnerNewBooking(rental) {
    try {
      // Get owner, customer, and car details
      const owner = await db.User.findByPk(rental.ownerId);
      const customer = await db.User.findByPk(rental.customerId);
      const car = await db.Car.findByPk(rental.carId);

      if (!owner || !customer || !car) {
        throw new Error('Missing required data for notification');
      }

      // Create in-app notification
      const notificationData = {
        rentalId: rental.id,
        carId: rental.carId,
        customerId: rental.customerId,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalAmount: rental.totalAmount
      };

      await this.createNotification({
        userId: owner.id,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${customer.name} has requested to book your ${car.year} ${car.brand} ${car.model} from ${new Date(rental.startDate).toLocaleDateString()} to ${new Date(rental.endDate).toLocaleDateString()}. Total: $${rental.totalAmount}`,
        data: notificationData,
        priority: 'high'
      });

      // Send email notification
      const emailSubject = `New Booking Request - ${car.year} ${car.brand} ${car.model}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Booking Request</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Booking Details</h3>
            <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
            <p><strong>Vehicle:</strong> ${car.year} ${car.brand} ${car.model}</p>
            <p><strong>Rental Period:</strong> ${new Date(rental.startDate).toLocaleDateString()} to ${new Date(rental.endDate).toLocaleDateString()}</p>
            <p><strong>Total Days:</strong> ${rental.totalDays}</p>
            <p><strong>Total Amount:</strong> $${rental.totalAmount}</p>
            
            ${rental.hasInsurance ? '<p>✅ Insurance included</p>' : ''}
            ${rental.hasGPS ? '<p>✅ GPS included</p>' : ''}
            ${rental.hasChildSeat ? '<p>✅ Child seat included</p>' : ''}
            ${rental.hasAdditionalDriver ? '<p>✅ Additional driver included</p>' : ''}
            
            ${rental.specialRequests ? `<p><strong>Special Requests:</strong> ${rental.specialRequests}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #059669; font-weight: bold;">💳 Payment has been received and is being held securely.</p>
            <p>Please review and approve this booking request.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/owner-dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Booking
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from MiRide. Please log in to your dashboard to approve or reject this booking.
          </p>
        </div>
      `;

      await this.sendEmail({
        to: owner.email,
        subject: emailSubject,
        html: emailHtml,
        text: `New booking request from ${customer.name} for your ${car.year} ${car.brand} ${car.model}. Please check your dashboard to review.`
      });

      console.log(`✅ Owner notification sent for rental ${rental.id}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error notifying owner:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify customer about booking status change
   */
  static async notifyCustomerBookingStatus(rental, status, rejectionReason = null) {
    try {
      const customer = await db.User.findByPk(rental.customerId);
      const car = await db.Car.findByPk(rental.carId);

      if (!customer || !car) {
        throw new Error('Missing required data for customer notification');
      }

      let title, message, type, emailSubject, emailHtml;

      switch (status) {
        case 'approved':
          type = 'booking_approved';
          title = 'Booking Approved! 🎉';
          message = `Your booking for ${car.year} ${car.brand} ${car.model} has been approved! You can pick up your car on ${new Date(rental.startDate).toLocaleDateString()}.`;
          emailSubject = 'Booking Approved - Your Car is Ready!';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">🎉 Booking Approved!</h2>
              <p>Great news! Your booking has been approved.</p>
              
              <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
                <h3 style="margin-top: 0; color: #059669;">Your Booking Details</h3>
                <p><strong>Vehicle:</strong> ${car.year} ${car.brand} ${car.model}</p>
                <p><strong>Pickup Date:</strong> ${new Date(rental.startDate).toLocaleDateString()}</p>
                <p><strong>Return Date:</strong> ${new Date(rental.endDate).toLocaleDateString()}</p>
                <p><strong>Pickup Location:</strong> ${rental.pickupLocation}</p>
                <p><strong>Total Amount:</strong> $${rental.totalAmount}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}/customer-dashboard" 
                   style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  View Booking Details
                </a>
              </div>
            </div>
          `;
          break;

        case 'rejected':
          type = 'booking_rejected';
          title = 'Booking Request Declined';
          message = `Unfortunately, your booking request for ${car.year} ${car.brand} ${car.model} has been declined. ${rejectionReason ? `Reason: ${rejectionReason}` : ''} Your payment will be refunded within 3-5 business days.`;
          emailSubject = 'Booking Request Declined';
          emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Booking Request Declined</h2>
              <p>We're sorry to inform you that your booking request has been declined.</p>
              
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p><strong>Vehicle:</strong> ${car.year} ${car.brand} ${car.model}</p>
                <p><strong>Requested Dates:</strong> ${new Date(rental.startDate).toLocaleDateString()} to ${new Date(rental.endDate).toLocaleDateString()}</p>
                ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
              </div>
              
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px;">
                <p style="margin: 0; color: #0369a1;">💳 Your payment of $${rental.totalAmount} will be refunded within 3-5 business days.</p>
              </div>
            </div>
          `;
          break;

        default:
          throw new Error(`Unknown status: ${status}`);
      }

      // Create in-app notification
      await this.createNotification({
        userId: customer.id,
        type,
        title,
        message,
        data: {
          rentalId: rental.id,
          carId: rental.carId,
          status,
          rejectionReason
        },
        priority: 'high'
      });

      // Send email notification
      await this.sendEmail({
        to: customer.email,
        subject: emailSubject,
        html: emailHtml,
        text: message
      });

      console.log(`✅ Customer notification sent for rental ${rental.id} - status: ${status}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error notifying customer:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notify owner about booking cancellation
   */
  static async notifyOwnerBookingCancelled(rental, reason = null) {
    try {
      const owner = await db.User.findByPk(rental.ownerId);
      const customer = await db.User.findByPk(rental.customerId);
      const car = await db.Car.findByPk(rental.carId);

      if (!owner || !customer || !car) {
        throw new Error('Missing required data for owner cancellation notification');
      }

      // Create in-app notification
      const notificationData = {
        rentalId: rental.id,
        carId: rental.carId,
        customerId: rental.customerId,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalAmount: rental.totalAmount,
        cancellationReason: reason
      };

      await this.createNotification({
        userId: owner.id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `${customer.name} has cancelled their booking for your ${car.year} ${car.brand} ${car.model} (${new Date(rental.startDate).toLocaleDateString()} - ${new Date(rental.endDate).toLocaleDateString()}). ${reason ? `Reason: ${reason}` : ''}`,
        data: notificationData,
        priority: 'medium'
      });

      // Send email notification
      const emailSubject = `Booking Cancelled - ${car.year} ${car.brand} ${car.model}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Booking Cancelled</h2>
          
          <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="margin-top: 0;">Cancellation Details</h3>
            <p><strong>Customer:</strong> ${customer.name} (${customer.email})</p>
            <p><strong>Vehicle:</strong> ${car.year} ${car.brand} ${car.model}</p>
            <p><strong>Original Rental Period:</strong> ${new Date(rental.startDate).toLocaleDateString()} to ${new Date(rental.endDate).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${rental.totalAmount}</p>
            ${reason ? `<p><strong>Cancellation Reason:</strong> ${reason}</p>` : ''}
          </div>
          
          <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; color: #0369a1;">📅 Your car is now available for booking again during these dates.</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/owner-dashboard" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Dashboard
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated notification from MiRide.
          </p>
        </div>
      `;

      await this.sendEmail({
        to: owner.email,
        subject: emailSubject,
        html: emailHtml,
        text: `Booking cancelled by ${customer.name} for your ${car.year} ${car.brand} ${car.model}. ${reason ? `Reason: ${reason}` : ''}`
      });

      console.log(`✅ Owner cancellation notification sent for rental ${rental.id}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Error notifying owner about cancellation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId, { limit = 20, offset = 0, unreadOnly = false } = {}) {
    try {
      const whereClause = { userId };
      if (unreadOnly) {
        whereClause.isRead = false;
      }

      const notifications = await db.Notification.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      const [updatedRows] = await db.Notification.update(
        { isRead: true },
        { 
          where: { 
            id: notificationId, 
            userId 
          } 
        }
      );

      return updatedRows > 0;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      const [updatedRows] = await db.Notification.update(
        { isRead: true },
        { 
          where: { 
            userId,
            isRead: false
          } 
        }
      );

      return updatedRows;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark notification as unread
   */
  static async markAsUnread(notificationId, userId) {
    try {
      const [updatedRows] = await db.Notification.update(
        { isRead: false },
        { 
          where: { 
            id: notificationId, 
            userId 
          } 
        }
      );

      return updatedRows > 0;
    } catch (error) {
      console.error('❌ Error marking notification as unread:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const deletedRows = await db.Notification.destroy({
        where: { 
          id: notificationId, 
          userId 
        }
      });

      return deletedRows > 0;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications for a user
   */
  static async clearAllNotifications(userId) {
    try {
      const deletedRows = await db.Notification.destroy({
        where: { userId }
      });

      return deletedRows;
    } catch (error) {
      console.error('❌ Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Enhanced getUserNotifications with advanced filtering
   */
  static async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 20,
        offset = 0,
        unreadOnly = false,
        readOnly = false,
        type,
        priority,
        search
      } = options;

      const whereClause = { userId };

      // Status filters
      if (unreadOnly) {
        whereClause.isRead = false;
      } else if (readOnly) {
        whereClause.isRead = true;
      }

      // Type filter
      if (type) {
        whereClause.type = type;
      }

      // Priority filter
      if (priority) {
        whereClause.priority = priority;
      }

      // Search filter
      if (search) {
        const { Op } = await import('sequelize');
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { message: { [Op.iLike]: `%${search}%` } },
          { type: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const notifications = await db.Notification.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications with filters:', error);
      throw error;
    }
  }
}

export default NotificationService;
