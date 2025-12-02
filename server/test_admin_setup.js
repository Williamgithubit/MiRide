/**
 * Test script for admin setup endpoint
 * Run this locally to test the endpoint before using in production
 */

const API_URL = process.env.API_URL || 'http://localhost:3000';
const SECRET = process.env.ADMIN_SETUP_SECRET || 'change-this-secret-key-in-production';

console.log('🧪 Testing Admin Setup Endpoint');
console.log('API URL:', API_URL);
console.log('=' .repeat(60));

// Test 1: Health Check
async function testHealthCheck() {
  console.log('\n1️⃣ Testing Health Check...');
  try {
    const response = await fetch(`${API_URL}/api/admin-setup/health`);
    const data = await response.json();
    console.log('✅ Health Check Response:', data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

// Test 2: Create Admin User
async function testCreateAdmin() {
  console.log('\n2️⃣ Testing Create Admin...');
  try {
    const response = await fetch(`${API_URL}/api/admin-setup/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: SECRET,
        email: 'admin@miride.com',
        password: 'Admin@123456',
        name: 'Admin User',
        phone: '+231778711864'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin Created/Updated:', data);
      return true;
    } else {
      console.error('❌ Failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Create Admin Failed:', error.message);
    return false;
  }
}

// Test 3: Verify Password
async function testVerifyPassword() {
  console.log('\n3️⃣ Testing Password Verification...');
  try {
    const response = await fetch(`${API_URL}/api/admin-setup/verify-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: SECRET,
        email: 'admin@miride.com',
        password: 'Admin@123456'
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Password Verification:', data);
      if (data.passwordMatch) {
        console.log('🎉 Password matches! Login should work.');
      } else {
        console.log('⚠️ Password does NOT match. There may be an issue.');
      }
      return data.passwordMatch;
    } else {
      console.error('❌ Failed:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Verify Password Failed:', error.message);
    return false;
  }
}

// Test 4: Test Invalid Secret
async function testInvalidSecret() {
  console.log('\n4️⃣ Testing Invalid Secret (should fail)...');
  try {
    const response = await fetch(`${API_URL}/api/admin-setup/create-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        secret: 'wrong-secret',
        email: 'admin@miride.com',
        password: 'Admin@123456',
        name: 'Admin User'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 403) {
      console.log('✅ Correctly rejected invalid secret:', data.message);
      return true;
    } else {
      console.error('❌ Should have rejected invalid secret');
      return false;
    }
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting Tests...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    createAdmin: await testCreateAdmin(),
    verifyPassword: await testVerifyPassword(),
    invalidSecret: await testInvalidSecret()
  };
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Results:');
  console.log('='.repeat(60));
  console.log('Health Check:', results.healthCheck ? '✅ PASS' : '❌ FAIL');
  console.log('Create Admin:', results.createAdmin ? '✅ PASS' : '❌ FAIL');
  console.log('Verify Password:', results.verifyPassword ? '✅ PASS' : '❌ FAIL');
  console.log('Invalid Secret:', results.invalidSecret ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! The endpoint is working correctly.');
    console.log('\n📝 Next Steps:');
    console.log('1. Deploy to Render');
    console.log('2. Set ADMIN_SETUP_SECRET environment variable');
    console.log('3. Use the endpoint to create admin in production');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
