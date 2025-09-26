// Simple webhook test using Node.js built-in modules
import http from 'http';
import crypto from 'crypto';

// Test webhook payload
const testWebhookPayload = {
  "id": "evt_test_webhook",
  "object": "event",
  "api_version": "2022-11-15",
  "created": Math.floor(Date.now() / 1000),
  "data": {
    "object": {
      "id": "cs_test_session_123",
      "object": "checkout.session",
      "amount_total": 25900,
      "currency": "usd",
      "customer_details": {
        "email": "moses@gmail.com"
      },
      "payment_intent": "pi_test_123",
      "payment_status": "paid",
      "metadata": {
        "carId": "4",
        "customerId": "cc617020-001a-45d9-8118-5be193b1b76c",
        "startDate": "2025-09-26",
        "endDate": "2025-09-28",
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

const payload = JSON.stringify(testWebhookPayload);
const timestamp = Math.floor(Date.now() / 1000);

// Create a simple test signature for development mode
const testSignature = 'test_signature';

const postData = payload;

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/payments/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'stripe-signature': testSignature,
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🧪 Testing webhook endpoint...');
console.log('📦 Sending payload to http://localhost:3000/api/payments/webhook');

const req = http.request(options, (res) => {
  console.log('📊 Response Status:', res.statusCode);
  console.log('📊 Response Headers:', res.headers);

  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });

  res.on('end', () => {
    console.log('📊 Response Body:', responseBody);
    
    if (res.statusCode === 200) {
      console.log('✅ Webhook endpoint is reachable!');
    } else {
      console.log('❌ Webhook returned error status:', res.statusCode);
    }
  });
});

req.on('error', (error) => {
  console.error('💥 Error testing webhook:', error.message);
});

req.write(postData);
req.end();
