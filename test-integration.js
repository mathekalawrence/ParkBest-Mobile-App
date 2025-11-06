// Test Integration Script
// Run this with: node test-integration.js

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testIntegration() {
  console.log('🚀 Testing ParkBest Integration...\n');

  // Test 1: Server Health Check
  try {
    const response = await axios.get('http://localhost:5000/');
    console.log('✅ Server Health:', response.data.message);
  } catch (error) {
    console.log('❌ Server Health: Failed -', error.message);
    return;
  }

  // Test 2: User Registration
  const testUser = {
    email: `test${Date.now()}@parkbest.com`,
    password: 'test123456',
    full_name: 'Test User',
    phone: '+254700000000'
  };

  try {
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    console.log('✅ User Registration:', registerResponse.data.message);
  } catch (error) {
    console.log('❌ User Registration:', error.response?.data?.error || error.message);
  }

  // Test 3: User Login
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ User Login:', loginResponse.data.message);
    
    const token = loginResponse.data.token;
    
    // Test 4: Protected Route (Reports)
    try {
      const reportsResponse = await axios.get(`${API_BASE}/reports/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected Route Access: Success');
    } catch (error) {
      console.log('❌ Protected Route Access:', error.response?.data?.error || error.message);
    }

    // Test 5: Report Logging
    try {
      await axios.post(`${API_BASE}/reports/auth`, {
        type: 'AUTH',
        event: 'TEST_LOGIN',
        data: { test: true, timestamp: new Date().toISOString() }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Report Logging: Success');
    } catch (error) {
      console.log('❌ Report Logging:', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.log('❌ User Login:', error.response?.data?.error || error.message);
  }

  console.log('\n🎉 Integration test completed!');
  console.log('\n📱 Next steps:');
  console.log('1. Start the mobile app: npx expo start');
  console.log('2. Test registration and login in the app');
  console.log('3. Check Integration Report screen for activity logs');
}

testIntegration();