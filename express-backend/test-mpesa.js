const axios = require('axios');

// Official M-Pesa Sandbox Test Credentials
const SANDBOX_CONSUMER_KEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const SANDBOX_CONSUMER_SECRET = 'A49c2c1f2f3c';

async function testMpesaAuth() {
  const auth = Buffer.from(`${SANDBOX_CONSUMER_KEY}:${SANDBOX_CONSUMER_SECRET}`).toString('base64');
  
  try {
    console.log('🔄 Testing M-Pesa sandbox authentication...');
    
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS! Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('❌ FAILED:', error.response?.status, error.response?.data);
  }
}

testMpesaAuth();