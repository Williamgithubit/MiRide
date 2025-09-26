import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import db from '../models/index.js';
import NotificationService from '../services/notificationService.js';
import auth from '../middleware/auth.js';
dotenv.config();

const paymentRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

// Create Checkout Session for car rental booking
paymentRouter.post('/create-checkout-session', auth(), async (req, res) => {
  try {
    console.log('Creating checkout session with request body:', req.body);
    
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
      selectedCar 
    } = req.body;

    console.log('Extracted data:', {
      carId, startDate, endDate, totalDays, totalPrice, selectedCar: selectedCar ? 'present' : 'missing'
    });

    if (!carId || !startDate || !endDate || !totalPrice || !selectedCar) {
      console.log('Missing required fields validation failed');
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    // Create line items for the booking
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${selectedCar.year} ${selectedCar.brand} ${selectedCar.model}`,
            description: `Car rental from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
            images: selectedCar.imageUrl ? [selectedCar.imageUrl] : [],
          },
          unit_amount: Math.round(selectedCar.rentalPricePerDay * totalDays * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Add extras as separate line items
    if (insurance) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Full Insurance Coverage',
            description: `Insurance for ${totalDays} days`,
          },
          unit_amount: Math.round(15 * totalDays * 100), // $15/day in cents
        },
        quantity: 1,
      });
    }

    if (gps) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'GPS Navigation System',
            description: `GPS rental for ${totalDays} days`,
          },
          unit_amount: Math.round(5 * totalDays * 100), // $5/day in cents
        },
        quantity: 1,
      });
    }

    if (childSeat) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Child Safety Seat',
            description: `Child seat rental for ${totalDays} days`,
          },
          unit_amount: Math.round(8 * totalDays * 100), // $8/day in cents
        },
        quantity: 1,
      });
    }

    if (additionalDriver) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Additional Driver',
            description: 'One-time fee for additional driver',
          },
          unit_amount: 2500, // $25 in cents
        },
        quantity: 1,
      });
    }

    // Create the checkout session
    console.log('Creating Stripe session with line items:', lineItems);
    console.log('Using CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5173');
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/booking-cancelled`,
      metadata: {
        carId: carId.toString(),
        customerId: req.user.id, // Add authenticated user ID
        startDate,
        endDate,
        totalDays: totalDays.toString(),
        insurance: insurance.toString(),
        gps: gps.toString(),
        childSeat: childSeat.toString(),
        additionalDriver: additionalDriver.toString(),
        pickupLocation,
        dropoffLocation,
        specialRequests: specialRequests || '',
      },
    });

    console.log('Stripe session created successfully:', session.id);
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for handling successful payments
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // For testing: bypass signature verification in development
    if (process.env.NODE_ENV === 'development' && sig === 'test_signature') {
      console.log('Using test mode - bypassing signature verification');
      console.log('Raw body type:', typeof req.body);
      console.log('Raw body:', req.body);
      
      // Handle both Buffer and string inputs
      let bodyString;
      if (Buffer.isBuffer(req.body)) {
        bodyString = req.body.toString('utf8');
      } else if (typeof req.body === 'string') {
        bodyString = req.body;
      } else {
        bodyString = JSON.stringify(req.body);
      }
      
      console.log('Body string:', bodyString);
      event = JSON.parse(bodyString);
    } else {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    console.error('Error details:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      console.log('Payment successful for session:', session.id);
      console.log('Booking metadata:', session.metadata);
      
      // Extract booking details from session metadata
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
        specialRequests
      } = session.metadata;

      // Get car details to find the owner
      const car = await db.Car.findByPk(carId);
      if (!car) {
        throw new Error(`Car with ID ${carId} not found`);
      }

      // Get customer ID from session metadata first, then fall back to email lookup
      let customerId = metadataCustomerId;
      
      console.log('Customer ID from metadata:', metadataCustomerId);
      console.log('Session customer email:', session.customer_details?.email);
      
      if (!customerId && session.customer_details?.email) {
        console.log('Customer ID not in metadata, looking up by email:', session.customer_details.email);
        const customer = await db.User.findOne({ 
          where: { email: session.customer_details.email } 
        });
        customerId = customer?.id;
        console.log('Customer found by email:', customer?.name, customer?.id);
      }
      
      // Ensure we have a customer ID
      if (!customerId) {
        console.error('No customer ID found for session:', session.id);
        throw new Error('Customer ID not found');
      }

      console.log('Creating rental with customer ID:', customerId);

      // Create the rental booking record
      const rental = await db.Rental.create({
        customerId: customerId,
        carId: parseInt(carId),
        ownerId: car.ownerId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalDays: parseInt(totalDays),
        totalCost: session.amount_total / 100, // Legacy field - required by model
        totalAmount: session.amount_total / 100, // Convert from cents
        status: 'pending_approval', // Initial status - waiting for owner approval
        paymentStatus: 'paid',
        paymentIntentId: session.payment_intent,
        stripeSessionId: session.id,
        pickupLocation: pickupLocation || 'Not specified',
        dropoffLocation: dropoffLocation || 'Not specified',
        specialRequests: specialRequests || null,
        // Add-ons
        hasInsurance: insurance === 'true',
        hasGPS: gps === 'true',
        hasChildSeat: childSeat === 'true',
        hasAdditionalDriver: additionalDriver === 'true',
        insuranceCost: insurance === 'true' ? 15 * parseInt(totalDays) : 0,
        gpsCost: gps === 'true' ? 5 * parseInt(totalDays) : 0,
        childSeatCost: childSeat === 'true' ? 8 * parseInt(totalDays) : 0,
        additionalDriverCost: additionalDriver === 'true' ? 25 : 0
      });

      console.log('Rental booking created:', rental.id);

      // Update car availability status to 'reserved' during pending approval
      await car.update({ 
        isAvailable: false,
        status: 'reserved' // You may need to add this field to Car model
      });
      console.log(`Car ${car.id} marked as reserved`);

      // Send notification to car owner
      const notificationResult = await NotificationService.notifyOwnerNewBooking(rental);
      if (notificationResult.success) {
        console.log(`✅ Owner notification sent successfully for rental ${rental.id}`);
      } else {
        console.error(`❌ Failed to send owner notification: ${notificationResult.error}`);
      }
      
    } catch (error) {
      console.error('Error processing successful payment:', error);
    }
  }

  res.json({ received: true });
});

// Legacy Payment Intent endpoint (keeping for backward compatibility)
paymentRouter.post('/create-payment-intent', async (req, res) => {
  const { paymentMethodId, amount, carId } = req.body;

  if (!paymentMethodId || !amount || !carId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
    });

    if (paymentIntent.status === 'requires_action' && paymentIntent.next_action) {
      return res.json({
        requiresAction: true,
        paymentIntentClientSecret: paymentIntent.client_secret,
      });
    } else if (paymentIntent.status === 'succeeded') {
      // Insert DB logic here to create rental record
      return res.json({ success: true });
    } else {
      return res.status(400).json({ error: 'Payment failed or unknown status' });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

export default paymentRouter;
