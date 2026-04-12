// Test script for campaign creation
// Run with: node test-create-campaign.js

// Configuration
const API_URL = 'http://localhost:5001/api';
const TEST_EMAIL = 'somtootika@gmail.com';
const TEST_PASSWORD = 'RAD$on2005';

async function testCreateCampaign() {
  try {
    console.log('🧪 ===== TESTING CAMPAIGN CREATION =====\n');

    // Step 1: Login to get auth token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      console.log('\n💡 Make sure you have a founder account with:');
      console.log(`   Email: ${TEST_EMAIL}`);
      console.log(`   Password: ${TEST_PASSWORD}`);
      console.log('\n💡 Or update TEST_EMAIL and TEST_PASSWORD in this file');
      return;
    }

    const token = loginData.token || loginData.data?.accessToken || loginData.accessToken;
    const userName = loginData.data?.fullName || loginData.fullName || 'Unknown';
    const userType = loginData.data?.userType || loginData.userType || 'Unknown';
    
    console.log('✅ Login successful!');
    console.log('   User:', userName);
    console.log('   Type:', userType);
    if (token) {
      console.log('   Token:', token.substring(0, 20) + '...\n');
    } else {
      console.error('❌ No token received!');
      console.log('   Response:', JSON.stringify(loginData, null, 2));
      return;
    }

    // Step 2: Create a draft campaign
    console.log('2️⃣ Creating draft campaign...');
    const campaignData = {
      title: 'Test Campaign ' + Date.now(),
      description: 'This is a test campaign created via API',
      category: 'Technology',
      location: 'Lagos, Nigeria',
      targetAmount: 0,
      minimumInvestment: 0,
      maximumInvestment: null,
      problemStatement: '',
      solution: '',
      businessPlan: '',
      marketAnalysis: '',
      competitiveAdvantage: '',
      financialProjections: '',
      teamInformation: '',
      risksAndChallenges: '',
      videoUrl: '',
      endDate: null,
      durationDays: 90,
      milestones: [],
      isDraft: true
    };

    console.log('📦 Campaign Data:');
    console.log(JSON.stringify(campaignData, null, 2));
    console.log('');

    const createResponse = await fetch(`${API_URL}/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(campaignData)
    });

    const createData = await createResponse.json();
    
    console.log('📡 Response Status:', createResponse.status);
    console.log('📡 Response Data:');
    console.log(JSON.stringify(createData, null, 2));
    console.log('');

    if (!createResponse.ok || !createData.success) {
      console.error('❌ Campaign creation failed!');
      console.error('   Error:', createData.message || createData.error);
      return;
    }

    console.log('✅ Campaign created successfully!');
    console.log('   ID:', createData.data.id);
    console.log('   Title:', createData.data.title);
    console.log('   Status:', createData.data.status);
    console.log('');

    // Step 3: Verify the campaign was created
    console.log('3️⃣ Verifying campaign...');
    const verifyResponse = await fetch(`${API_URL}/campaigns/${createData.data.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const verifyData = await verifyResponse.json();
    
    if (verifyResponse.ok && verifyData.success) {
      console.log('✅ Campaign verified!');
      console.log('   Title:', verifyData.data.title);
      console.log('   Status:', verifyData.data.status);
      console.log('   Founder:', verifyData.data.creator?.fullName);
    } else {
      console.log('⚠️ Could not verify campaign');
    }

    console.log('\n🧪 ===== TEST COMPLETED SUCCESSFULLY =====');

  } catch (error) {
    console.error('\n❌ ===== TEST FAILED =====');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testCreateCampaign();
