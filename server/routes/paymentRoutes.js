import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const paymentRouter = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' });

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
