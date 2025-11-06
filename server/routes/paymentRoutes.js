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
      carId, startDate, endDate, totalDays, totalPrice, 
      selectedCar: selectedCar ? {
        id: selectedCar.id,
        brand: selectedCar.brand,
        model: selectedCar.model,
        year: selectedCar.year,
        imageUrl: selectedCar.imageUrl,
        rentalPricePerDay: selectedCar.rentalPricePerDay
      } : 'missing'
    });

    if (!carId || !startDate || !endDate || !totalPrice || !selectedCar) {
      console.log('Missing required fields validation failed');
      return res.status(400).json({ error: 'Missing required booking information' });
    }

    // Validate selectedCar has required fields
    if (!selectedCar.brand || !selectedCar.model || !selectedCar.year || !selectedCar.rentalPricePerDay) {
      console.log('Selected car missing required fields:', selectedCar);
      return res.status(400).json({ error: 'Invalid car information' });
    }

    // Prepare image URL - ensure it's a full URL if provided
    let imageUrls = [];
    if (selectedCar.imageUrl) {
      // Check if it's a relative URL and convert to absolute
      const imageUrl = selectedCar.imageUrl.startsWith('http') 
        ? selectedCar.imageUrl 
        : `${process.env.CLIENT_URL || 'http://localhost:4000'}${selectedCar.imageUrl}`;
      imageUrls = [imageUrl];
      console.log('Using image URL:', imageUrl);
    }

    // Create line items for the booking
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${selectedCar.year} ${selectedCar.brand} ${selectedCar.model}`,
            description: `Car rental from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`,
            images: imageUrls,
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
    console.log('Creating Stripe session with line items:', JSON.stringify(lineItems, null, 2));
    console.log('Using CLIENT_URL:', process.env.CLIENT_URL || 'http://localhost:5173');
    console.log('Stripe API Key configured:', !!process.env.STRIPE_SECRET_KEY);
    
    try {
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
          pickupLocation: pickupLocation || '',
          dropoffLocation: dropoffLocation || '',
          specialRequests: specialRequests || '',
        },
      });

      console.log('Stripe session created successfully:', session.id);
      console.log('Stripe checkout URL:', session.url);
      res.json({ 
        sessionId: session.id,
        url: session.url // Return the checkout URL for direct redirect
      });
    } catch (stripeError) {
      console.error('Stripe API Error:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
        raw: stripeError.raw
      });
      throw stripeError;
    }
  } catch (error) {
    console.error('Error creating checkout session:', {
      message: error.message,
      stack: error.stack,
      type: error.type,
      code: error.code
    });
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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
        console.log(`Owner notification sent successfully for rental ${rental.id}`);
      } else {
        console.error(`Failed to send owner notification: ${notificationResult.error}`);
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

// Development fallback endpoint to create booking when webhook doesn't work
paymentRouter.post('/create-booking-fallback', auth(), async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    console.log('Creating booking fallback for session:', sessionId);

    // Retrieve the session from Stripe to get the metadata
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Check if booking already exists
    const existingRental = await db.Rental.findOne({
      where: { stripeSessionId: sessionId }
    });

    if (existingRental) {
      console.log('Booking already exists for session:', sessionId);
      return res.json({ 
        success: true, 
        message: 'Booking already exists',
        rentalId: existingRental.id 
      });
    }

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

    // Use customer ID from metadata or authenticated user
    const customerId = metadataCustomerId || req.user.id;

    console.log('Creating rental with customer ID:', customerId);

    // Create the rental booking record
    const rental = await db.Rental.create({
      customerId: customerId,
      carId: parseInt(carId),
      ownerId: car.ownerId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      totalDays: parseInt(totalDays),
      totalCost: session.amount_total / 100, // Legacy field
      totalAmount: session.amount_total / 100, // Convert from cents
      status: 'pending_approval',
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

    console.log('Rental booking created via fallback:', rental.id);

    // Update car availability
    await car.update({ isAvailable: false });
    console.log(`Car ${car.id} marked as unavailable`);

    // Send notification to car owner
    try {
      const notificationResult = await NotificationService.notifyOwnerNewBooking(rental);
      if (notificationResult.success) {
        console.log(`Owner notification sent successfully for rental ${rental.id}`);
      } else {
        console.error(`Failed to send owner notification: ${notificationResult.error}`);
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
      // Don't fail the booking creation if notification fails
    }

    res.json({ 
      success: true, 
      message: 'Booking created successfully',
      rentalId: rental.id,
      sessionDetails: {
        sessionId: session.id,
        carDetails: {
          year: car.year,
          make: car.brand, // Note: using brand as make for consistency
          model: car.model,
          image: car.imageUrl
        },
        bookingInfo: {
          startDate,
          endDate,
          totalDays: parseInt(totalDays),
          pickupLocation: pickupLocation || 'Not specified',
          dropoffLocation: dropoffLocation || 'Not specified',
          specialRequests: specialRequests || null
        },
        pricing: {
          basePrice: car.rentalPricePerDay * parseInt(totalDays),
          insurance: insurance === 'true' ? 15 * parseInt(totalDays) : 0,
          gps: gps === 'true' ? 5 * parseInt(totalDays) : 0,
          childSeat: childSeat === 'true' ? 8 * parseInt(totalDays) : 0,
          additionalDriver: additionalDriver === 'true' ? 25 : 0,
          totalAmount: session.amount_total / 100
        },
        addOns: {
          insurance: insurance === 'true',
          gps: gps === 'true',
          childSeat: childSeat === 'true',
          additionalDriver: additionalDriver === 'true'
        },
        paymentInfo: {
          paymentMethod: session.payment_method_types[0] || 'card',
          transactionId: session.payment_intent || session.id.substring(0, 16),
          paymentDate: new Date(session.created * 1000).toLocaleString()
        }
      }
    });

  } catch (error) {
    console.error('Error in booking fallback:', error);
    res.status(500).json({ error: error.message });
  }
});

export default paymentRouter;
