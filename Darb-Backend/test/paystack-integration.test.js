const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

/**
 * Test Paystack Integration
 * Run this script to test the complete investment flow
 */

class PaystackIntegrationTest {
  constructor() {
    this.authToken = null;
    this.testInvestment = null;
  }

  async runAllTests() {
    console.log('🚀 Starting Paystack Integration Tests...\n');

    try {
      // Step 1: Test API Documentation
      await this.testApiDocs();

      // Step 2: Login as test user
      await this.loginTestUser();

      // Step 3: Test investment creation
      await this.testInvestmentCreation();

      // Step 4: Test payment status check
      await this.testPaymentStatus();

      // Step 5: Test investment history
      await this.testInvestmentHistory();

      // Step 6: Test admin endpoints
      await this.testAdminEndpoints();

      console.log('\n✅ All tests completed successfully!');
      console.log('\n📝 Next Steps:');
      console.log('1. Set up Paystack webhook URL in dashboard');
      console.log('2. Test actual payment flow with test cards');
      console.log('3. Verify webhook notifications');

    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testApiDocs() {
    console.log('📚 Testing API Documentation...');
    
    try {
      const response = await axios.get(`${API_BASE}/investments/docs`);
      
      if (response.data.success) {
        console.log('✅ API documentation accessible');
        console.log(`   Version: ${response.data.data.version}`);
        console.log(`   Endpoints: ${Object.keys(response.data.data.endpoints).length} categories`);
      } else {
        throw new Error('API docs not accessible');
      }
    } catch (error) {
      throw new Error(`API docs test failed: ${error.message}`);
    }
  }

  async loginTestUser() {
    console.log('\n🔐 Logging in test user...');
    
    try {
      // Try to login with existing test user
      const loginData = {
        email: 'investor@test.com',
        password: 'password123'
      };

      const response = await axios.post(`${API_BASE}/auth/login`, loginData);
      
      if (response.data.success && response.data.token) {
        this.authToken = response.data.token;
        console.log('✅ Login successful');
        console.log(`   User: ${response.data.data.fullName} (${response.data.data.userType})`);
      } else {
        throw new Error('Login failed - user may not exist');
      }
    } catch (error) {
      console.log('ℹ️  Test user not found, you may need to create one manually');
      console.log('   Email: investor@test.com, Password: password123');
      throw new Error(`Login test failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testInvestmentCreation() {
    console.log('\n💰 Testing investment creation...');
    
    if (!this.authToken) {
      throw new Error('No auth token available');
    }

    try {
      const investmentData = {
        campaignId: 1, // Assuming campaign 1 exists
        amount: 50000,
        investorMessage: 'Test investment from automated script'
      };

      const response = await axios.post(
        `${API_BASE}/investments/create`,
        investmentData,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        this.testInvestment = response.data.data;
        console.log('✅ Investment creation successful');
        console.log(`   Investment ID: ${this.testInvestment.investmentId}`);
        console.log(`   Payment Reference: ${this.testInvestment.paymentReference}`);
        console.log(`   Amount: ₦${this.testInvestment.amount.toLocaleString()}`);
        
        if (this.testInvestment.payment) {
          console.log(`   Paystack URL: ${this.testInvestment.payment.authorization_url}`);
          console.log('   ⚠️  Note: You can use this URL to test payment flow manually');
        }
      } else {
        throw new Error('Investment creation failed');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('ℹ️  Campaign 1 not found, you may need to create a test campaign first');
      }
      throw new Error(`Investment creation test failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testPaymentStatus() {
    console.log('\n🔍 Testing payment status check...');
    
    if (!this.testInvestment || !this.authToken) {
      throw new Error('No test investment or auth token available');
    }

    try {
      const response = await axios.get(
        `${API_BASE}/investments/status/${this.testInvestment.paymentReference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Payment status check successful');
        console.log(`   Status: ${response.data.data.payment_status}`);
        console.log(`   Reference: ${response.data.data.payment_reference}`);
      } else {
        throw new Error('Payment status check failed');
      }
    } catch (error) {
      throw new Error(`Payment status test failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testInvestmentHistory() {
    console.log('\n📊 Testing investment history...');
    
    if (!this.authToken) {
      throw new Error('No auth token available');
    }

    try {
      const response = await axios.get(
        `${API_BASE}/investments/my-investments`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Investment history retrieval successful');
        console.log(`   Total investments: ${response.data.data.length}`);
        
        if (response.data.summary) {
          console.log(`   Total invested: ₦${response.data.summary.total_invested?.toLocaleString() || 0}`);
          console.log(`   Success rate: ${response.data.summary.total_investments > 0 ? 
            Math.round((response.data.summary.total_investments - response.data.summary.failed_payments) / response.data.summary.total_investments * 100) : 0}%`);
        }
      } else {
        throw new Error('Investment history retrieval failed');
      }
    } catch (error) {
      throw new Error(`Investment history test failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testAdminEndpoints() {
    console.log('\n👑 Testing admin endpoints...');
    
    try {
      // Test admin stats endpoint (this will fail if user is not admin, which is expected)
      const response = await axios.get(
        `${API_BASE}/admin/investments/stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Admin stats accessible (user has admin privileges)');
        console.log(`   Total investments: ${response.data.data.total_investments}`);
        console.log(`   Success rate: ${response.data.data.success_rate}%`);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ️  Admin endpoints protected (user is not admin) - This is expected');
      } else {
        console.log(`⚠️  Admin endpoint test inconclusive: ${error.response?.data?.message || error.message}`);
      }
    }
  }

  async simulatePayment() {
    console.log('\n💳 Simulating payment (development only)...');
    
    if (!this.testInvestment || !this.authToken || process.env.NODE_ENV !== 'development') {
      console.log('ℹ️  Payment simulation only available in development mode');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/investments/test/simulate-payment`,
        {
          paymentReference: this.testInvestment.paymentReference
        },
        {
          headers: {
            'Authorization': `Bearer ${this.authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        console.log('✅ Payment simulation successful');
        console.log('   Investment should now be marked as completed');
      }
    } catch (error) {
      console.log(`⚠️  Payment simulation failed: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Helper function to check environment variables
function checkEnvironmentVariables() {
  console.log('🔧 Checking environment variables...');
  
  const required = ['PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(key => console.log(`   ${key}`));
    console.log('\nPlease add these to your .env file and restart the server.');
    return false;
  }
  
  console.log('✅ All required environment variables present');
  
  // Check if using test keys
  if (process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_')) {
    console.log('ℹ️  Using Paystack test keys (good for development)');
  } else if (process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_live_')) {
    console.log('⚠️  Using Paystack live keys (be careful!)');
  }
  
  return true;
}

// Main execution
async function main() {
  console.log('🎯 Paystack Integration Test Suite');
  console.log('=====================================\n');
  
  if (!checkEnvironmentVariables()) {
    process.exit(1);
  }
  
  const tester = new PaystackIntegrationTest();
  await tester.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  });
}

module.exports = PaystackIntegrationTest;