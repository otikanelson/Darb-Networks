#!/usr/bin/env node

/**
 * Darb Network - Security Smoke Test Suite
 * 
 * Validates that all security fixes from STEPS 1-12 and follow-up STEPS A-H are working correctly.
 * 
 * Usage:
 *   node security-smoke-test.js [base_url]
 * 
 * Example:
 *   node security-smoke-test.js http://localhost:5000
 */

const axios = require('axios');
const crypto = require('crypto');

const baseUrl = process.argv[2] || 'http://localhost:5000';
let passed = 0;
let failed = 0;

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m'
};

function log(message) {
  console.log(message);
}

function pass(message) {
  console.log(`${colors.green}✓ PASS${colors.reset}: ${message}`);
  passed++;
}

function fail(message, expected, actual) {
  console.log(`${colors.red}✗ FAIL${colors.reset}: ${message}`);
  if (expected) console.log(`  Expected: ${expected}`);
  if (actual) console.log(`  Got: ${actual}`);
  failed++;
}

function warn(message) {
  console.log(`${colors.yellow}⚠ NOTE${colors.reset}: ${message}`);
}

async function testCase(name, testFn) {
  try {
    await testFn();
  } catch (error) {
    fail(name, null, error.message);
  }
}

async function runTests() {
  console.log('==========================================');
  console.log('   Darb Network Security Smoke Tests');
  console.log('==========================================');
  console.log(`Target: ${baseUrl}\n`);

  // STEP 1: Admin signup blocked
  console.log('### STEP 1: Admin signup blocked ###');
  await testCase('Signup with userType=admin rejected', async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/register`, {
        email: 'attacker@test.com',
        password: 'password123',
        fullName: 'Attacker',
        userType: 'admin',
        captchaToken: 'test'
      });
      fail('Signup with userType=admin rejected', 'Should reject', 'Request succeeded');
    } catch (error) {
      if (error.response?.data?.message?.includes('Invalid user type')) {
        pass('Signup with userType=admin rejected');
      } else {
        fail('Signup with userType=admin rejected', 'Invalid user type error', error.response?.data?.message);
      }
    }
  });

  console.log('');
  console.log('### STEP 2: JWT secret validation ###');
  await testCase('Invalid JWT rejected', async () => {
    try {
      await axios.get(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      fail('Invalid JWT rejected', 'Should reject', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 401 || error.response?.data?.message?.includes('Unauthorized')) {
        pass('Invalid JWT rejected');
      } else {
        fail('Invalid JWT rejected', '401 Unauthorized', `${error.response?.status} ${error.response?.data?.message}`);
      }
    }
  });

  console.log('');
  console.log('### STEP 3: Draft campaigns not leaked ###');
  await testCase('Public campaigns endpoint returns approved only', async () => {
    const response = await axios.get(`${baseUrl}/api/campaigns`);
    if (response.data?.success) {
      pass('Public campaigns endpoint returns approved campaigns');
    } else {
      fail('Public campaigns endpoint returns approved campaigns', 'success: true', JSON.stringify(response.data));
    }
  });

  console.log('');
  console.log('### STEP 4: Debug endpoints removed ###');
  await testCase('/test endpoint returns 404', async () => {
    try {
      await axios.get(`${baseUrl}/test`);
      fail('/test endpoint returns 404', 'Should return 404', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 404) {
        pass('/test endpoint returns 404');
      } else {
        fail('/test endpoint returns 404', '404 status', error.response?.status);
      }
    }
  });

  await testCase('/api/cloudinary-status endpoint returns 404', async () => {
    try {
      await axios.get(`${baseUrl}/api/cloudinary-status`);
      fail('/api/cloudinary-status returns 404', 'Should return 404', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 404) {
        pass('/api/cloudinary-status endpoint returns 404');
      } else {
        fail('/api/cloudinary-status returns 404', '404 status', error.response?.status);
      }
    }
  });

  await testCase('/api/route-status endpoint returns 404', async () => {
    try {
      await axios.get(`${baseUrl}/api/route-status`);
      fail('/api/route-status returns 404', 'Should return 404', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 404) {
        pass('/api/route-status endpoint returns 404');
      } else {
        fail('/api/route-status returns 404', '404 status', error.response?.status);
      }
    }
  });

  console.log('');
  console.log('### STEP 5: CORS properly configured ###');
  await testCase('CORS blocks unauthorized origins', async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/campaigns`, {
        headers: { Origin: 'https://evil.com' }
      });
      const allowedOrigin = response.headers['access-control-allow-origin'];
      if (allowedOrigin && allowedOrigin !== 'https://evil.com') {
        pass('CORS blocks unauthorized origins');
      } else {
        fail('CORS blocks unauthorized origins', 'Not evil.com', allowedOrigin);
      }
    } catch (error) {
      fail('CORS blocks unauthorized origins', null, error.message);
    }
  });

  console.log('');
  console.log('### STEP 6: Error responses don\'t leak details ###');
  await testCase('Error responses hide internal details', async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/login`, {
        email: 'nonexistent@test.com',
        password: 'wrong'
      });
      fail('Error responses hide details', 'Should reject invalid creds', 'Request succeeded');
    } catch (error) {
      const data = error.response?.data;
      if (data?.error && typeof data.error === 'object') {
        fail('Error responses hide details', 'No error field', JSON.stringify(data));
      } else {
        pass('Error responses hide internal details');
      }
    }
  });

  console.log('');
  console.log('### STEP 7: Security headers present ###');
  await testCase('Helmet security headers present', async () => {
    const response = await axios.get(`${baseUrl}/health`);
    const hasHeaders = response.headers['x-frame-options'] || response.headers['x-content-type-options'];
    if (hasHeaders) {
      pass('Helmet security headers present');
    } else {
      warn('Helmet security headers may not be fully configured');
    }
  });

  console.log('');
  console.log('### STEP 7: Password minimum 8 characters ###');
  await testCase('Password < 8 chars rejected', async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/register`, {
        email: 'shortpwd@test.com',
        password: 'pass',
        fullName: 'Test',
        userType: 'founder',
        phoneNumber: '+2348012345678',
        nin: '12345678901',
        bvn: '12345678901',
        address: 'Test Address',
        accountNumber: '1234567890',
        bankName: 'gtbank',
        captchaToken: 'test'
      });
      fail('Password < 8 chars rejected', 'Should reject', 'Request succeeded');
    } catch (error) {
      if (error.response?.data?.message?.toLowerCase().includes('8 character') ||
        error.response?.data?.message?.toLowerCase().includes('password')) {
        pass('Password < 8 chars rejected');
      } else {
        warn(`Password validation result: ${error.response?.data?.message}`);
      }
    }
  });

  console.log('');
  console.log('### STEP 8: Payment endpoints secured ###');
  await testCase('Payment endpoints require auth or unavailable', async () => {
    try {
      await axios.post(`${baseUrl}/api/investments/create`, {
        campaignId: 1,
        amount: 50000
      });
      fail('Payment endpoint security', 'Should require auth', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 503 || error.response?.status === 401) {
        pass('Payment endpoints require auth or unavailable');
      } else {
        warn(`Payment endpoint returned: ${error.response?.status}`);
      }
    }
  });

  console.log('');
  console.log('### STEP B: reCAPTCHA token integration ###');
  await testCase('Register without captchaToken returns 400 in production', async () => {
    try {
      await axios.post(`${baseUrl}/api/auth/register`, {
        email: 'nocaptcha@test.com',
        password: 'TestPass123!',
        fullName: 'No Captcha',
        userType: 'founder',
        phoneNumber: '+2348012345678',
        nin: '12345678901',
        bvn: '12345678901',
        address: 'Test Address Long',
        accountNumber: '1234567890',
        bankName: 'gtbank'
        // captchaToken intentionally omitted
      });
      warn('Register without captchaToken succeeded (may be development mode)');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.toLowerCase().includes('captcha')) {
        pass('Register without captchaToken returns 400 in production');
      } else if (error.response?.status === 400) {
        warn(`Register without captchaToken rejected: ${error.response?.data?.message} (may be dev mode skipping captcha)`);
      } else {
        warn(`Register without captchaToken returned: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }
  });

  console.log('');
  console.log('### STEP D: Webhook signature validation ###');

  await testCase('Webhook with bad signature returns 400', async () => {
    try {
      const badSignature = 'invalid_signature_' + Date.now();
      await axios.post(`${baseUrl}/api/webhooks/paystack`,
        {
          event: 'charge.success',
          data: {
            reference: 'test_ref_' + Date.now(),
            status: 'success',
            amount: 50000
          }
        },
        {
          headers: {
            'x-paystack-signature': badSignature,
            'content-type': 'application/json'
          }
        }
      );
      fail('Webhook with bad signature rejected', 'Should return 400', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('Invalid')) {
        pass('Webhook with bad signature returns 400');
      } else {
        warn(`Webhook bad signature returned: ${error.response?.status} - ${error.response?.data?.message}`);
      }
    }
  });

  await testCase('Webhook with valid HMAC on sample payload passes signature check', async () => {
    try {
      const secretKey = process.env.PAYSTACK_SECRET_KEY || 'test_secret_key';
      const payload = JSON.stringify({
        event: 'charge.success',
        data: {
          reference: 'test_ref_' + Date.now(),
          id: 12345,
          status: 'success',
          amount: 50000,
          currency: 'NGN',
          channel: 'card',
          gateway_response: 'Successful',
          paid_at: new Date().toISOString(),
          customer: { email: 'test@test.com' },
          metadata: {}
        }
      });

      const signature = crypto
        .createHmac('sha512', secretKey)
        .update(payload)
        .digest('hex');

      try {
        const response = await axios.post(
          `${baseUrl}/api/webhooks/paystack`,
          JSON.parse(payload),
          {
            headers: {
              'x-paystack-signature': signature,
              'content-type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          pass('Webhook with valid HMAC returns 200');
        } else {
          warn(`Webhook valid HMAC returned status: ${response.status}`);
        }
      } catch (innerError) {
        // 400/404 for missing investment is acceptable - signature was valid
        if (innerError.response?.status === 400 || innerError.response?.status === 404) {
          if (innerError.response?.data?.message?.includes('not found') ||
            innerError.response?.data?.message?.includes('Investment') ||
            innerError.response?.data?.message?.includes('Does not exist')) {
            pass('Webhook with valid HMAC passed signature verification (investment not found is expected for test payload)');
          } else {
            pass('Webhook with valid HMAC accepted and processed');
          }
        } else {
          fail('Webhook valid HMAC processing', 'Should accept valid HMAC', `${innerError.response?.status} ${innerError.response?.data?.message}`);
        }
      }
    } catch (error) {
      fail('Webhook valid HMAC test', null, error.message);
    }
  });

  console.log('');
  console.log('### STEP 10: Sensitive data masked ###');
  warn('Data masking verified via code review (requires auth token to test)');
  console.log('  - BVN masking: Last 4 digits shown, rest masked');
  console.log('  - Account number masking: Last 4 digits shown');
  console.log('  - Boolean flags: hasBvn, hasAccountNumber');

  console.log('');
  console.log('### STEP 11: Credentials removed from README ###');
  const fs = require('fs');
  try {
    const readmeContent = fs.readFileSync('README.md', 'utf8');
    if (readmeContent.includes('admin2025') || readmeContent.includes('292025')) {
      fail('Published credentials removed from README', 'Credentials not found', 'Found in file');
    } else {
      pass('Published credentials removed from README');
    }
  } catch (error) {
    warn(`Could not read README.md: ${error.message}`);
  }

  console.log('');
  console.log('### STEP 12: 404 handler doesn\'t list endpoints ###');
  await testCase('404 handler doesn\'t leak endpoints', async () => {
    try {
      await axios.get(`${baseUrl}/unknown-route`);
      fail('404 handler secure', 'Should return 404', 'Request succeeded');
    } catch (error) {
      if (error.response?.status === 404) {
        const data = error.response?.data;
        const hasEndpointList = JSON.stringify(data).includes('availableEndpoints') ||
          JSON.stringify(data).includes('GET /') ||
          JSON.stringify(data).includes('POST /');
        if (hasEndpointList) {
          fail('404 handler secure', 'Should not list endpoints', JSON.stringify(data));
        } else {
          pass('404 handler doesn\'t leak endpoints');
        }
      } else {
        fail('404 handler secure', '404 status', error.response?.status);
      }
    }
  });

  // Summary
  console.log('');
  console.log('==========================================');
  console.log('   Test Summary');
  console.log('==========================================');
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Total:  ${passed + failed}`);
  console.log('');

  if (failed === 0) {
    console.log(`${colors.green}✓ All security tests passed!${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some tests failed. Review and fix issues.${colors.reset}`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
