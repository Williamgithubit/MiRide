import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Generate a test token for the owner
const ownerId = '3c5433a3-2a3c-4341-a231-cd67d98cb099';
const token = jwt.sign(
  { 
    userId: ownerId,
    role: 'owner',
    email: 'william@gmail.com'
  },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '1h' }
);

console.log('=== Test Analytics Endpoint ===\n');
console.log('Owner ID:', ownerId);
console.log('Token:', token);
console.log('\nTo test the endpoint, run this curl command:\n');
console.log(`curl -X GET "http://localhost:5000/api/dashboard/owner/analytics?period=monthly" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json"`);
console.log('\nOr use this in your browser console (if logged in):');
console.log(`
fetch('http://localhost:4000/api/dashboard/owner/analytics?period=monthly', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Analytics Data:', data))
.catch(err => console.error('Error:', err));
`);
