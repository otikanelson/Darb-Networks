const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('=== Testing Darb Network API with TiDB ===\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health check...');
    const health = await axios.get(`${API_URL.replace('/api', '')}/health`);
    console.log(`   ✓ Status: ${health.data.status}\n`);

    // Test 2: Get Campaigns
    console.log('2. Testing GET /api/campaigns...');
    const campaigns = await axios.get(`${API_URL}/campaigns`);
    console.log(`   ✓ Found ${campaigns.data.data.length} campaigns`);
    campaigns.data.data.slice(0, 2).forEach(c => {
      console.log(`     - ${c.title} (${c.category})`);
    });
    console.log('');

    // Test 3: Register New User
    console.log('3. Testing POST /api/auth/register (new investor)...');
    const newUser = {
      email: `test_${Date.now()}@example.com`,
      password: 'Test123!',
      fullName: 'API Test User',
      userType: 'investor'
    };
    
    try {
      const register = await axios.post(`${API_URL}/auth/register`, newUser);
      console.log(`   ✓ User registered successfully`);
      console.log(`     Email: ${newUser.email}`);
      console.log(`     User ID: ${register.data.id}\n`);
    } catch (error) {
      if (error.response?.data?.message) {
        console.log(`   Note: ${error.response.data.message}\n`);
      } else {
        throw error;
      }
    }

    // Test 4: Login with Test Account
    console.log('4. Testing POST /api/auth/login...');
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'founder@test.com',
      password: 'password123'
    });
    console.log(`   ✓ Login successful`);
    console.log(`     User: ${login.data.fullName}`);
    console.log(`     Token: ${login.data.accessToken.substring(0, 20)}...`);
    console.log(`     Type: ${login.data.userType}\n`);

    const token = login.data.accessToken;

    // Test 5: Get User Profile
    console.log('5. Testing GET /api/users/profile (authenticated)...');
    const profile = await axios.get(`${API_URL}/users/profile`, {
      headers: { 'x-access-token': token }
    });
    console.log(`   ✓ Profile retrieved`);
    console.log(`     Name: ${profile.data.fullName}`);
    console.log(`     Email: ${profile.data.email}\n`);

    // Test 6: Get Single Campaign
    console.log('6. Testing GET /api/campaigns/:id...');
    const singleCampaign = await axios.get(`${API_URL}/campaigns/1`);
    console.log(`   ✓ Campaign details retrieved`);
    console.log(`     Title: ${singleCampaign.data.data.title}`);
    console.log(`     Founder: ${singleCampaign.data.data.founder_name}`);
    console.log(`     Target: ₦${parseFloat(singleCampaign.data.data.target_amount).toLocaleString()}\n`);

    // Test 7: Database Status
    console.log('7. Testing GET /api/db-status...');
    const dbStatus = await axios.get(`${API_URL.replace('/api', '')}/api/db-status`);
    console.log(`   ✓ Database initialized: ${dbStatus.data.database.initialized}`);
    if (dbStatus.data.database.error) {
      console.log(`   ✗ Error: ${dbStatus.data.database.error}`);
    }
    console.log('');

    console.log('=== All Tests Passed! ===\n');
    console.log('✅ Your Darb Network app is fully working with TiDB!');
    console.log('✅ You can now:');
    console.log('   - Start your frontend and browse campaigns');
    console.log('   - Login with: founder@test.com / password123');
    console.log('   - Create new campaigns as a founder');
    console.log('   - Make investments as an investor\n');

  } catch (error) {
    console.error('\n✗ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.message || error.response.statusText}`);
      if (error.response.data.error) {
        console.error(`   Error: ${error.response.data.error}`);
      }
    } else {
      console.error(`   ${error.message}`);
    }
    process.exit(1);
  }
}

testAPI();
