import Stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../models/index.js';
import NotificationService from '../services/notificationService.js';
import { calculateCommission } from './stripeConnectController.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

/**
 * Create PaymentIntent with Stripe Connect (commission + transfer)
 */
export const createPaymentIntent = async (req, res) => {
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
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    // Get car and owner details
    const car = await db.Car.findByPk(carId, {
      include: [
        {
          model: db.User,
          as: 'owner',
          include: [{ model: db.OwnerProfile, as: 'ownerProfile' }],
        },
      ],
    });

    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    if (!car.owner || !car.owner.ownerProfile) {
      return res.status(400).json({ error: 'Car owner profile not found' });
    }

    const ownerProfile = car.owner.ownerProfile;

    // Check if owner has completed Stripe onboarding
    if (!ownerProfile.stripeAccountId) {
      return res.status(400).json({ 
        error: 'Car owner has not completed payment setup. Please contact support.',
      });
    }

    if (!ownerProfile.stripeChargesEnabled) {
      return res.status(400).json({ 
        error: 'Car owner payment account is not active. Please contact support.',
      });
    }

    // Calculate commission
    const totalAmount = parseFloat(totalPrice);
    const { platformFee, ownerPayout } = calculateCommission(totalAmount);

    console.log('Payment breakdown:', {
      totalAmount,
      platformFee,
      ownerPayout,
      stripeAccountId: ownerProfile.stripeAccountId,
    });

    // Create PaymentIntent with application fee and transfer
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency: 'usd',
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
        insurance: insurance ? 'true' : 'false',
        gps: gps ? 'true' : 'false',
        childSeat: childSeat ? 'true' : 'false',
        additionalDriver: additionalDriver ? 'true' : 'false',
        pickupLocation: pickupLocation || '',
        dropoffLocation: dropoffLocation || '',
        specialRequests: specialRequests || '',
        platformFee: platformFee.toString(),
        ownerPayout: ownerPayout.toString(),
      },
    });

    console.log('PaymentIntent created:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      platformFee,
      ownerPayout,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Confirm payment and create rental booking
 */
export const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        error: 'Payment not completed',
        status: paymentIntent.status,
      });
    }

    // Check if rental already exists
    const existingRental = await db.Rental.findOne({
      where: { paymentIntentId },
    });

    if (existingRental) {
      return res.json({
        success: true,
        message: 'Booking already exists',
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
      platformFee,
      ownerPayout,
    } = paymentIntent.metadata;

    // Get car details
    const car = await db.Car.findByPk(carId);
    if (!car) {
      throw new Error(`Car with ID ${carId} not found`);
    }

    // Create rental booking
    const rental = await db.Rental.create({
      customerId,
      carId: parseInt(carId),
      ownerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: parseInt(totalDays),
      totalCost: paymentIntent.amount / 100,
      totalAmount: paymentIntent.amount / 100,
      status: 'pending_approval',
      paymentStatus: 'paid',
      paymentIntentId: paymentIntent.id,
      pickupLocation: pickupLocation || 'Not specified',
      dropoffLocation: dropoffLocation || 'Not specified',
      specialRequests: specialRequests || null,
      hasInsurance: insurance === 'true',
      hasGPS: gps === 'true',
      hasChildSeat: childSeat === 'true',
      hasAdditionalDriver: additionalDriver === 'true',
      insuranceCost: insurance === 'true' ? 15 * parseInt(totalDays) : 0,
      gpsCost: gps === 'true' ? 5 * parseInt(totalDays) : 0,
      childSeatCost: childSeat === 'true' ? 8 * parseInt(totalDays) : 0,
      additionalDriverCost: additionalDriver === 'true' ? 25 : 0,
      platformFee: parseFloat(platformFee),
      ownerPayout: parseFloat(ownerPayout),
      payoutStatus: 'paid', // Transfer happens automatically with Stripe Connect
    });

    // Create payment record
    const ownerProfile = await db.OwnerProfile.findOne({
      where: { userId: ownerId },
    });

    await db.Payment.create({
      rentalId: rental.id,
      ownerId,
      customerId,
      stripePaymentIntentId: paymentIntent.id,
      stripeAccountId: ownerProfile?.stripeAccountId,
      totalAmount: paymentIntent.amount / 100,
      platformFee: parseFloat(platformFee),
      ownerAmount: parseFloat(ownerPayout),
      currency: 'usd',
      paymentStatus: 'succeeded',
      payoutStatus: 'paid',
      metadata: paymentIntent.metadata,
    });

    // Update car availability
    await car.update({ 
      isAvailable: false,
      status: 'reserved',
    });

    // Update owner balance
    if (ownerProfile) {
      await ownerProfile.update({
        totalEarnings: parseFloat(ownerProfile.totalEarnings) + parseFloat(ownerPayout),
        availableBalance: parseFloat(ownerProfile.availableBalance) + parseFloat(ownerPayout),
      });
    }

    // Send notification to owner
    try {
      await NotificationService.notifyOwnerNewBooking(rental);
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Booking created successfully',
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
    console.error('Error confirming payment:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Enhanced webhook handler for Stripe Connect events
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // For testing: bypass signature verification in development
    if (process.env.NODE_ENV === 'development' && sig === 'test_signature') {
      console.log('Using test mode - bypassing signature verification');
      let bodyString;
      if (Buffer.isBuffer(req.body)) {
        bodyString = req.body.toString('utf8');
      } else if (typeof req.body === 'string') {
        bodyString = req.body;
      } else {
        bodyString = JSON.stringify(req.body);
      }
      event = JSON.parse(bodyString);
    } else {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Webhook event received:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;

      case 'payout.paid':
        await handlePayoutPaid(event.data.object);
        break;

      case 'payout.failed':
        await handlePayoutFailed(event.data.object);
        break;

      case 'charge.succeeded':
        console.log('Charge succeeded:', event.data.object.id);
        break;

      case 'transfer.created':
        console.log('Transfer created:', event.data.object.id);
        break;

      case 'checkout.session.completed':
        // Handle legacy checkout session
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
};

// Webhook event handlers
async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);

  // Update payment record
  await db.Payment.update(
    { paymentStatus: 'succeeded' },
    { where: { stripePaymentIntentId: paymentIntent.id } }
  );

  // Update rental
  await db.Rental.update(
    { paymentStatus: 'paid' },
    { where: { paymentIntentId: paymentIntent.id } }
  );
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  // Update payment record
  await db.Payment.update(
    { 
      paymentStatus: 'failed',
      metadata: { ...paymentIntent.metadata, failureReason: paymentIntent.last_payment_error?.message },
    },
    { where: { stripePaymentIntentId: paymentIntent.id } }
  );

  // Update rental
  await db.Rental.update(
    { paymentStatus: 'failed' },
    { where: { paymentIntentId: paymentIntent.id } }
  );
}

async function handleAccountUpdated(account) {
  console.log('Account updated:', account.id);

  // Update owner profile with latest account status
  const ownerProfile = await db.OwnerProfile.findOne({
    where: { stripeAccountId: account.id },
  });

  if (ownerProfile) {
    await ownerProfile.update({
      stripeChargesEnabled: account.charges_enabled,
      stripePayoutsEnabled: account.payouts_enabled,
      stripeDetailsSubmitted: account.details_submitted,
      stripeOnboardingComplete: account.details_submitted && account.charges_enabled,
    });
  }
}

async function handlePayoutPaid(payout) {
  console.log('Payout paid:', payout.id);

  // Update withdrawal record
  await db.Withdrawal.update(
    { 
      status: 'completed',
      processedAt: new Date(payout.arrival_date * 1000),
    },
    { where: { stripePayoutId: payout.id } }
  );
}

async function handlePayoutFailed(payout) {
  console.log('Payout failed:', payout.id);

  // Update withdrawal record
  await db.Withdrawal.update(
    { 
      status: 'failed',
      failureReason: payout.failure_message,
    },
    { where: { stripePayoutId: payout.id } }
  );
}

async function handleCheckoutSessionCompleted(session) {
  // This handles the legacy checkout flow
  console.log('Checkout session completed:', session.id);

  // Check if rental already exists
  const existingRental = await db.Rental.findOne({
    where: { stripeSessionId: session.id },
  });

  if (existingRental) {
    console.log('Rental already exists for session:', session.id);
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
    throw new Error('Customer ID not found');
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
    status: 'pending_approval',
    paymentStatus: 'paid',
    paymentIntentId: session.payment_intent,
    stripeSessionId: session.id,
    pickupLocation: pickupLocation || 'Not specified',
    dropoffLocation: dropoffLocation || 'Not specified',
    specialRequests: specialRequests || null,
    hasInsurance: insurance === 'true',
    hasGPS: gps === 'true',
    hasChildSeat: childSeat === 'true',
    hasAdditionalDriver: additionalDriver === 'true',
    insuranceCost: insurance === 'true' ? 15 * parseInt(totalDays) : 0,
    gpsCost: gps === 'true' ? 5 * parseInt(totalDays) : 0,
    childSeatCost: childSeat === 'true' ? 8 * parseInt(totalDays) : 0,
    additionalDriverCost: additionalDriver === 'true' ? 25 : 0,
    platformFee,
    ownerPayout,
    payoutStatus: 'pending',
  });

  await car.update({ isAvailable: false, status: 'reserved' });

  try {
    await NotificationService.notifyOwnerNewBooking(rental);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}
