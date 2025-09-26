import fetch from 'node-fetch';
import crypto from 'crypto';

// Test webhook payload that simulates a successful Stripe checkout
const testWebhookPayload = {
  "id": "evt_test_webhook",
  "object": "event",
  "api_version": "2022-11-15",
  "created": Math.floor(Date.now() / 1000),
  "data": {
    "object": {
      "id": "cs_test_session_123",
      "object": "checkout.session",
      "amount_total": 25900, // $259.00 in cents
      "currency": "usd",
      "customer_details": {
        "email": "test@customer.com"
      },
      "payment_intent": "pi_test_123",
      "payment_status": "paid",
      "metadata": {
        "carId": "1",
        "customerId": "test-customer-id",
        "startDate": "2025-09-26", // Tomorrow
        "endDate": "2025-09-28",   // Day after tomorrow
        "totalDays": "2",
        "insurance": "true",
        "gps": "true", 
        "childSeat": "true",
        "additionalDriver": "true",
        "pickupLocation": "Downtown Office",
        "dropoffLocation": "Airport Terminal",
        "specialRequests": "Test booking request"
      }
    }
  },
  "livemode": false,
  "pending_webhooks": 1,
  "request": {
    "id": "req_test_123",
    "idempotency_key": null
  },
  "type": "checkout.session.completed"
};

// Create a test signature (this won't be valid but will help us test)
const webhookSecret = "whsec_test_51SA6HqQjFTr5CkpGsAsj9kRjgsLEuUgyuNPuNtLuBWw1SPOJvMU1EJcmzaXRlRW8oQkVVnTfoT4twWPnYViIpI2K00Pft1pKQ1";
const payload = JSON.stringify(testWebhookPayload);
const timestamp = Math.floor(Date.now() / 1000);

// Create signature (simplified for testing)
const signature = crypto
  .createHmac('sha256', webhookSecret)
  .update(timestamp + '.' + payload, 'utf8')
  .digest('hex');

const testSignature = `t=${timestamp},v1=${signature}`;

async function testWebhook() {
  try {
    console.log('🧪 Testing webhook endpoint...');
    console.log('📦 Payload:', JSON.stringify(testWebhookPayload, null, 2));
    
    const response = await fetch('http://localhost:3000/api/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': testSignature
      },
      body: payload
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📊 Response Body:', responseText);

    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed!');
    }
  } catch (error) {
    console.error('💥 Error testing webhook:', error.message);
  }
}

// Run the test
testWebhook();
