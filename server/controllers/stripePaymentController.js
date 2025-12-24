import Stripe from "stripe";
import dotenv from "dotenv";
import db from "../models/index.js";
import NotificationService from "../services/notificationService.js";
import { calculateCommission } from "./stripeConnectController.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2022-11-15",
});

/**
 * Create PaymentIntent with Stripe Connect (commission + transfer)
 * Includes pre-payment availability check to prevent double-booking
 */
export const createPaymentIntent = async (req, res) => {
  const { Op } = db.Sequelize;
  
  try {
    const {
      carId,
      startDate,
      endDate,
      totalDays,
      totalPrice,
      insurance,
      gps,
      childSeat,
      additionalDriver,
      pickupLocation,
      dropoffLocation,
      specialRequests,
    } = req.body;

    const customerId = req.user.id;

    // Validate required fields
    if (!carId || !startDate || !endDate || !totalPrice) {
      return res
        .status(400)
        .json({ error: "Missing required booking information" });
    }

    // Get car and owner details
    const car = await db.Car.findByPk(carId, {
      include: [
        {
          model: db.User,
          as: "owner",
          include: [{ model: db.OwnerProfile, as: "ownerProfile" }],
        },
      ],
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    if (!car.owner || !car.owner.ownerProfile) {
      return res.status(400).json({ error: "Car owner profile not found" });
    }

    // ============================================
    // PRE-PAYMENT AVAILABILITY CHECK
    // Check for overlapping rentals BEFORE creating payment intent
    // ============================================
    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);

    const overlappingRental = await db.Rental.findOne({
      where: {
        carId: parseInt(carId),
        status: {
          [Op.in]: ['pending_approval', 'approved', 'active']
        },
        [Op.or]: [
          // Case 1: Existing rental starts during requested period
          {
            startDate: {
              [Op.between]: [requestedStartDate, requestedEndDate]
            }
          },
          // Case 2: Existing rental ends during requested period
          {
            endDate: {
              [Op.between]: [requestedStartDate, requestedEndDate]
            }
          },
          // Case 3: Existing rental completely encompasses requested period
          {
            [Op.and]: [
              { startDate: { [Op.lte]: requestedStartDate } },
              { endDate: { [Op.gte]: requestedEndDate } }
            ]
          }
        ]
      }
    });

    if (overlappingRental) {
      console.log("⚠️ Car not available for requested dates:", {
        carId,
        requestedDates: { startDate, endDate },
        conflictingRental: {
          id: overlappingRental.id,
          startDate: overlappingRental.startDate,
          endDate: overlappingRental.endDate,
          status: overlappingRental.status
        }
      });
      
      return res.status(409).json({
        error: "This car is not available for the selected dates.",
        code: "CAR_NOT_AVAILABLE",
        message: "Please select different dates or choose another car."
      });
    }

    const ownerProfile = car.owner.ownerProfile;

    // Check if owner has completed Stripe onboarding
    if (!ownerProfile.stripeAccountId) {
      return res.status(400).json({
        error:
          "Car owner has not completed payment setup. Please contact support.",
      });
    }

    if (!ownerProfile.stripeChargesEnabled) {
      return res.status(400).json({
        error:
          "Car owner payment account is not active. Please contact support.",
      });
    }

    // Calculate commission
    const totalAmount = parseFloat(totalPrice);
    const { platformFee, ownerPayout } = calculateCommission(totalAmount);

    console.log("Payment breakdown:", {
      totalAmount,
      platformFee,
      ownerPayout,
      stripeAccountId: ownerProfile.stripeAccountId,
    });

    // Create PaymentIntent with application fee and transfer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: "usd",
      application_fee_amount: Math.round(platformFee * 100), // Platform commission
      transfer_data: {
        destination: ownerProfile.stripeAccountId, // Owner's connected account
      },
      metadata: {
        carId: carId.toString(),
        customerId,
        ownerId: car.ownerId,
        startDate,
        endDate,
        totalDays: totalDays.toString(),
        insurance: insurance ? "true" : "false",
        gps: gps ? "true" : "false",
        childSeat: childSeat ? "true" : "false",
        additionalDriver: additionalDriver ? "true" : "false",
        pickupLocation: pickupLocation || "",
        dropoffLocation: dropoffLocation || "",
        specialRequests: specialRequests || "",
        platformFee: platformFee.toString(),
        ownerPayout: ownerPayout.toString(),
      },
    });

    console.log("PaymentIntent created:", paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      platformFee,
      ownerPayout,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Confirm payment and create rental booking
 * Includes double-booking prevention with database transaction
 */
export const confirmPayment = async (req, res) => {
  const { Op } = db.Sequelize;
  
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: "Payment intent ID is required" });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        error: "Payment not completed",
        status: paymentIntent.status,
      });
    }

    // Check if rental already exists for this payment
    const existingRental = await db.Rental.findOne({
      where: { paymentIntentId },
    });

    if (existingRental) {
      return res.json({
        success: true,
        message: "Booking already exists",
        rentalId: existingRental.id,
      });
    }

    // Extract metadata
    const {
      carId,
      customerId,
      ownerId,
      startDate,
      endDate,
      totalDays,
      insurance,
      gps,
      childSeat,
      additionalDriver,
      pickupLocation,
      dropoffLocation,
      specialRequests,
      platformFee: metadataPlatformFee,
      ownerPayout: metadataOwnerPayout,
    } = paymentIntent.metadata;

    // Parse dates for overlap check
    const requestedStartDate = new Date(startDate);
    const requestedEndDate = new Date(endDate);

    // Use a database transaction to prevent race conditions
    const result = await db.sequelize.transaction(async (t) => {
      // ============================================
      // DOUBLE-BOOKING PREVENTION
      // Check for overlapping rentals within the transaction
      // ============================================
      const overlappingRental = await db.Rental.findOne({
        where: {
          carId: parseInt(carId),
          status: {
            [Op.in]: ['pending_approval', 'approved', 'active']
          },
          // Check for date overlap using standard overlap logic
          [Op.or]: [
            // Case 1: Existing rental starts during requested period
            {
              startDate: {
                [Op.between]: [requestedStartDate, requestedEndDate]
              }
            },
            // Case 2: Existing rental ends during requested period
            {
              endDate: {
                [Op.between]: [requestedStartDate, requestedEndDate]
              }
            },
            // Case 3: Existing rental completely encompasses requested period
            {
              [Op.and]: [
                { startDate: { [Op.lte]: requestedStartDate } },
                { endDate: { [Op.gte]: requestedEndDate } }
              ]
            }
          ]
        },
        transaction: t,
        lock: t.LOCK.UPDATE // Lock the rows to prevent concurrent modifications
      });

      if (overlappingRental) {
        console.log("⚠️ Double-booking detected:", {
          carId,
          requestedDates: { startDate, endDate },
          conflictingRental: {
            id: overlappingRental.id,
            startDate: overlappingRental.startDate,
            endDate: overlappingRental.endDate,
            status: overlappingRental.status
          }
        });
        
        // Throw error to trigger refund
        throw new Error('DOUBLE_BOOKING_DETECTED');
      }

      // Get car details
      const car = await db.Car.findByPk(carId, { transaction: t });
      if (!car) {
        throw new Error(`Car with ID ${carId} not found`);
      }

      // Calculate commission from actual payment amount (fallback if metadata is missing)
      const totalAmount = paymentIntent.amount / 100;
      const {
        platformFee: calculatedPlatformFee,
        ownerPayout: calculatedOwnerPayout,
      } = calculateCommission(totalAmount);

      // Use metadata values if present and valid, otherwise use calculated values
      const platformFee =
        metadataPlatformFee && parseFloat(metadataPlatformFee) > 0
          ? parseFloat(metadataPlatformFee)
          : calculatedPlatformFee;
      const ownerPayout =
        metadataOwnerPayout && parseFloat(metadataOwnerPayout) > 0
          ? parseFloat(metadataOwnerPayout)
          : calculatedOwnerPayout;

      console.log("💰 Payment breakdown:", {
        totalAmount,
        metadataPlatformFee,
        metadataOwnerPayout,
        calculatedPlatformFee,
        calculatedOwnerPayout,
        finalPlatformFee: platformFee,
        finalOwnerPayout: ownerPayout,
      });

      // Create rental booking within transaction
      const rental = await db.Rental.create({
        customerId,
        carId: parseInt(carId),
        ownerId,
        startDate: requestedStartDate,
        endDate: requestedEndDate,
        totalDays: parseInt(totalDays),
        totalCost: paymentIntent.amount / 100,
        totalAmount: paymentIntent.amount / 100,
        status: "pending_approval",
        paymentStatus: "paid",
        paymentIntentId: paymentIntent.id,
        pickupLocation: pickupLocation || "Not specified",
        dropoffLocation: dropoffLocation || "Not specified",
        specialRequests: specialRequests || null,
        hasInsurance: insurance === "true",
        hasGPS: gps === "true",
        hasChildSeat: childSeat === "true",
        hasAdditionalDriver: additionalDriver === "true",
        insuranceCost: insurance === "true" ? 15 * parseInt(totalDays) : 0,
        gpsCost: gps === "true" ? 5 * parseInt(totalDays) : 0,
        childSeatCost: childSeat === "true" ? 8 * parseInt(totalDays) : 0,
        additionalDriverCost: additionalDriver === "true" ? 25 : 0,
        platformFee: parseFloat(platformFee),
        ownerPayout: parseFloat(ownerPayout),
        payoutStatus: "paid", // Transfer happens automatically with Stripe Connect
      }, { transaction: t });

      // Get owner profile for payment record
      const ownerProfile = await db.OwnerProfile.findOne({
        where: { userId: ownerId },
        transaction: t
      });

      // Create payment record within transaction
      const paymentRecord = await db.Payment.create({
        rentalId: rental.id,
        ownerId,
        customerId,
        stripePaymentIntentId: paymentIntent.id,
        stripeAccountId: ownerProfile?.stripeAccountId,
        totalAmount: totalAmount,
        platformFee: platformFee,
        ownerAmount: ownerPayout,
        currency: "usd",
        paymentStatus: "succeeded",
        payoutStatus: "paid",
        metadata: paymentIntent.metadata,
      }, { transaction: t });

      console.log("✅ Payment record created:", {
        id: paymentRecord.id,
        rentalId: paymentRecord.rentalId,
        totalAmount: paymentRecord.totalAmount,
        platformFee: paymentRecord.platformFee,
        ownerAmount: paymentRecord.ownerAmount,
      });

      // Update car availability within transaction
      await car.update({
        isAvailable: false,
        status: "reserved",
      }, { transaction: t });

      // Update owner balance within transaction
      if (ownerProfile) {
        const newTotalEarnings =
          parseFloat(ownerProfile.totalEarnings || 0) + parseFloat(ownerPayout);
        const newAvailableBalance =
          parseFloat(ownerProfile.availableBalance || 0) + parseFloat(ownerPayout);

        await ownerProfile.update({
          totalEarnings: newTotalEarnings,
          availableBalance: newAvailableBalance,
        }, { transaction: t });

        console.log("✅ Owner balance updated:", {
          ownerId,
          previousEarnings: ownerProfile.totalEarnings,
          addedAmount: ownerPayout,
          newTotalEarnings,
          newAvailableBalance,
        });
      }

      return { rental, paymentRecord, car, ownerProfile, ownerPayout };
    });

    // Transaction succeeded - send notification outside transaction
    const { rental } = result;

    // Send notification to owner (outside transaction to not block)
    try {
      await NotificationService.notifyOwnerNewBooking(rental);
      console.log("✅ Owner notification sent for rental:", rental.id);
    } catch (notifError) {
      console.error("Error sending notification:", notifError);
      // Don't fail the booking if notification fails
    }

    res.json({
      success: true,
      message: "Booking created successfully",
      rentalId: rental.id,
      rental: {
        id: rental.id,
        carId: rental.carId,
        startDate: rental.startDate,
        endDate: rental.endDate,
        totalAmount: rental.totalAmount,
        status: rental.status,
      },
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    
    // ============================================
    // HANDLE DOUBLE-BOOKING - AUTOMATIC REFUND
    // ============================================
    if (error.message === 'DOUBLE_BOOKING_DETECTED') {
      try {
        const { paymentIntentId } = req.body;
        console.log("🔄 Initiating automatic refund for double-booking:", paymentIntentId);
        
        // Create a full refund
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: 'duplicate', // Stripe refund reason
        });
        
        console.log("✅ Refund created successfully:", refund.id);
        
        return res.status(409).json({
          error: "This car is no longer available for the selected dates. Another booking was made while you were completing payment.",
          code: "DOUBLE_BOOKING",
          refundId: refund.id,
          refundStatus: refund.status,
          message: "Your payment has been automatically refunded. Please select different dates or another car."
        });
      } catch (refundError) {
        console.error("❌ Failed to create automatic refund:", refundError);
        return res.status(409).json({
          error: "This car is no longer available for the selected dates. Please contact support for a refund.",
          code: "DOUBLE_BOOKING_REFUND_FAILED",
          paymentIntentId: req.body.paymentIntentId,
          message: "We were unable to process an automatic refund. Please contact support."
        });
      }
    }
    
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// WEBHOOK SECURITY & IDEMPOTENCY
// ============================================

// In-memory cache for processed webhook events (for idempotency)
// In production, use Redis or database for distributed systems
const processedWebhookEvents = new Map();
const WEBHOOK_EVENT_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Clean up old processed events periodically
setInterval(() => {
  const now = Date.now();
  for (const [eventId, timestamp] of processedWebhookEvents.entries()) {
    if (now - timestamp > WEBHOOK_EVENT_TTL) {
      processedWebhookEvents.delete(eventId);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour

/**
 * Enhanced webhook handler for Stripe Connect events
 * Features:
 * - Signature verification (required in production)
 * - Idempotency (prevents duplicate processing)
 * - Structured logging
 * - Error handling with appropriate HTTP responses
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  // ============================================
  // STEP 1: SIGNATURE VERIFICATION
  // ============================================
  try {
    // SECURITY: In production, ALWAYS verify the signature
    if (process.env.NODE_ENV === "production" && !webhookSecret) {
      console.error("❌ CRITICAL: STRIPE_WEBHOOK_SECRET is not set in production!");
      return res.status(500).json({ error: "Webhook configuration error" });
    }

    if (!sig) {
      console.error("❌ Webhook request missing stripe-signature header");
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    // For testing: bypass signature verification in development only
    if (process.env.NODE_ENV === "development" && sig === "test_signature") {
      console.log("⚠️ DEV MODE: Bypassing signature verification");
      let bodyString;
      if (Buffer.isBuffer(req.body)) {
        bodyString = req.body.toString("utf8");
      } else if (typeof req.body === "string") {
        bodyString = req.body;
      } else {
        bodyString = JSON.stringify(req.body);
      }
      event = JSON.parse(bodyString);
    } else {
      // PRODUCTION: Verify webhook signature
      if (!webhookSecret) {
        console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
        return res.status(500).json({ error: "Webhook secret not configured" });
      }

      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        webhookSecret
      );
    }
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", {
      error: err.message,
      signatureHeader: sig ? sig.substring(0, 50) + "..." : "missing",
    });
    return res.status(400).json({ 
      error: "Webhook signature verification failed",
      message: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }

  // ============================================
  // STEP 2: IDEMPOTENCY CHECK
  // Prevent duplicate processing of the same event
  // ============================================
  const eventId = event.id;
  
  if (processedWebhookEvents.has(eventId)) {
    console.log(`⏭️ Webhook event ${eventId} already processed, skipping`);
    return res.json({ received: true, duplicate: true });
  }

  // Mark event as being processed
  processedWebhookEvents.set(eventId, Date.now());

  // ============================================
  // STEP 3: LOG WEBHOOK EVENT
  // ============================================
  console.log("📥 Webhook event received:", {
    id: event.id,
    type: event.type,
    created: new Date(event.created * 1000).toISOString(),
    livemode: event.livemode,
  });

  // ============================================
  // STEP 4: PROCESS EVENT
  // ============================================
  try {
    const startTime = Date.now();
    let processed = true;

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object);
        break;

      case "payment_intent.canceled":
        console.log("💳 Payment intent canceled:", event.data.object.id);
        break;

      case "account.updated":
        await handleAccountUpdated(event.data.object);
        break;

      case "payout.paid":
        await handlePayoutPaid(event.data.object);
        break;

      case "payout.failed":
        await handlePayoutFailed(event.data.object);
        break;

      case "charge.succeeded":
        console.log("💰 Charge succeeded:", event.data.object.id);
        break;

      case "charge.refunded":
        console.log("💸 Charge refunded:", event.data.object.id);
        await handleChargeRefunded(event.data.object);
        break;

      case "transfer.created":
        console.log("➡️ Transfer created:", event.data.object.id);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        console.log(`📋 Subscription event: ${event.type}`, event.data.object.id);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
        processed = false;
    }

    const processingTime = Date.now() - startTime;
    console.log(`✅ Webhook ${event.type} processed in ${processingTime}ms`);

    res.json({ 
      received: true, 
      eventId: event.id,
      type: event.type,
      processed,
      processingTime: `${processingTime}ms`
    });

  } catch (error) {
    console.error("❌ Error processing webhook:", {
      eventId: event.id,
      eventType: event.type,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });

    // Remove from processed events so it can be retried
    processedWebhookEvents.delete(eventId);

    // Return 500 so Stripe will retry the webhook
    res.status(500).json({ 
      error: "Webhook processing failed",
      eventId: event.id,
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/**
 * Handle charge.refunded event
 */
async function handleChargeRefunded(charge) {
  console.log("Processing charge refund:", charge.id);
  
  try {
    // Find payment by charge ID or payment intent
    const payment = await db.Payment.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { stripeChargeId: charge.id },
          { stripePaymentIntentId: charge.payment_intent }
        ]
      }
    });

    if (payment) {
      const refundAmount = charge.amount_refunded / 100;
      const isFullRefund = charge.refunded;

      await payment.update({
        paymentStatus: isFullRefund ? 'refunded' : 'partial_refund',
        metadata: {
          ...payment.metadata,
          refundedAt: new Date(),
          refundAmount,
          isFullRefund,
          stripeChargeId: charge.id,
        }
      });

      console.log(`✅ Payment ${payment.id} marked as ${isFullRefund ? 'refunded' : 'partial_refund'}`);
    } else {
      console.log(`⚠️ No payment found for charge ${charge.id}`);
    }
  } catch (error) {
    console.error("Error handling charge refund:", error);
    throw error;
  }
}

// Webhook event handlers
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);

  // Update payment record
  await db.Payment.update(
    { paymentStatus: "succeeded" },
    { where: { stripePaymentIntentId: paymentIntent.id } }
  );

  // Update rental
  await db.Rental.update(
    { paymentStatus: "paid" },
    { where: { paymentIntentId: paymentIntent.id } }
  );
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log("Payment failed:", paymentIntent.id);

  // Update payment record
  await db.Payment.update(
    {
      paymentStatus: "failed",
      metadata: {
        ...paymentIntent.metadata,
        failureReason: paymentIntent.last_payment_error?.message,
      },
    },
    { where: { stripePaymentIntentId: paymentIntent.id } }
  );

  // Update rental
  await db.Rental.update(
    { paymentStatus: "failed" },
    { where: { paymentIntentId: paymentIntent.id } }
  );
}

async function handleAccountUpdated(account) {
  console.log("Account updated:", account.id);

  // Update owner profile with latest account status
  const ownerProfile = await db.OwnerProfile.findOne({
    where: { stripeAccountId: account.id },
  });

  if (ownerProfile) {
    await ownerProfile.update({
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeDetailsSubmitted: account.details_submitted,
      stripeOnboardingComplete:
        account.details_submitted && account.charges_enabled,
    });
  }
}

async function handlePayoutPaid(payout) {
  console.log("Payout paid:", payout.id);

  // Update withdrawal record
  await db.Withdrawal.update(
    {
      status: "completed",
      processedAt: new Date(payout.arrival_date * 1000),
    },
    { where: { stripePayoutId: payout.id } }
  );
}

async function handlePayoutFailed(payout) {
  console.log("Payout failed:", payout.id);

  // Update withdrawal record
  await db.Withdrawal.update(
    {
      status: "failed",
      failureReason: payout.failure_message,
    },
    { where: { stripePayoutId: payout.id } }
  );
}

async function handleCheckoutSessionCompleted(session) {
  // This handles the legacy checkout flow
  console.log("Checkout session completed:", session.id);

  // Check if rental already exists
  const existingRental = await db.Rental.findOne({
    where: { stripeSessionId: session.id },
  });

  if (existingRental) {
    console.log("Rental already exists for session:", session.id);
    return;
  }

  // Extract metadata and create rental (existing logic)
  const {
    carId,
    customerId: metadataCustomerId,
    startDate,
    endDate,
    totalDays,
    insurance,
    gps,
    childSeat,
    additionalDriver,
    pickupLocation,
    dropoffLocation,
    specialRequests,
  } = session.metadata;

  const car = await db.Car.findByPk(carId);
  if (!car) {
    throw new Error(`Car with ID ${carId} not found`);
  }

  let customerId = metadataCustomerId;
  if (!customerId && session.customer_details?.email) {
    const customer = await db.User.findOne({
      where: { email: session.customer_details.email },
    });
    customerId = customer?.id;
  }

  if (!customerId) {
    throw new Error("Customer ID not found");
  }

  // Calculate commission for legacy checkout
  const totalAmount = session.amount_total / 100;
  const { platformFee, ownerPayout } = calculateCommission(totalAmount);

  const rental = await db.Rental.create({
    customerId,
    carId: parseInt(carId),
    ownerId: car.ownerId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    totalDays: parseInt(totalDays),
    totalCost: totalAmount,
    totalAmount,
    status: "pending_approval",
    paymentStatus: "paid",
    paymentIntentId: session.payment_intent,
    stripeSessionId: session.id,
    pickupLocation: pickupLocation || "Not specified",
    dropoffLocation: dropoffLocation || "Not specified",
    specialRequests: specialRequests || null,
    hasInsurance: insurance === "true",
    hasGPS: gps === "true",
    hasChildSeat: childSeat === "true",
    hasAdditionalDriver: additionalDriver === "true",
    insuranceCost: insurance === "true" ? 15 * parseInt(totalDays) : 0,
    gpsCost: gps === "true" ? 5 * parseInt(totalDays) : 0,
    childSeatCost: childSeat === "true" ? 8 * parseInt(totalDays) : 0,
    additionalDriverCost: additionalDriver === "true" ? 25 : 0,
    platformFee,
    ownerPayout,
    payoutStatus: "pending",
  });

  await car.update({ isAvailable: false, status: "reserved" });

  try {
    await NotificationService.notifyOwnerNewBooking(rental);
  } catch (error) {
    console.error("Error sending notification:", error);
  }

  // Also create a Payment record for this checkout flow so Owner/Admin dashboards have a record
  try {
    const ownerProfile = await db.OwnerProfile.findOne({
      where: { userId: rental.ownerId },
    });

    const paymentRecord = await db.Payment.create({
      rentalId: rental.id,
      ownerId: rental.ownerId,
      customerId: rental.customerId,
      stripePaymentIntentId: rental.paymentIntentId || `legacy_${rental.id}`,
      stripeAccountId: ownerProfile?.stripeAccountId,
      totalAmount: rental.totalAmount,
      platformFee: rental.platformFee || 0,
      ownerAmount:
        rental.ownerPayout || rental.totalAmount - (rental.platformFee || 0),
      currency: "usd",
      paymentStatus: "succeeded",
      payoutStatus: rental.payoutStatus || "pending",
      metadata: {
        rentalId: rental.id,
        createdVia: "checkout_session_completed",
      },
    });

    // Update owner profile balances (if profile exists)
    if (ownerProfile) {
      const newTotalEarnings =
        parseFloat(ownerProfile.totalEarnings || 0) +
        parseFloat(paymentRecord.ownerAmount || 0);
      const newAvailableBalance =
        parseFloat(ownerProfile.availableBalance || 0) +
        parseFloat(paymentRecord.ownerAmount || 0);

      await ownerProfile.update({
        totalEarnings: newTotalEarnings,
        availableBalance: newAvailableBalance,
      });
    }

    console.log(
      "✅ Payment record created for checkout session:",
      paymentRecord.id
    );
  } catch (payErr) {
    console.error(
      "Error creating payment record for checkout session:",
      payErr
    );
  }
}
