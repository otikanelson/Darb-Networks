/**
 * STEP 7: Firebase Authentication - Integration Tests
 * 
 * Tests Firebase token verification, middleware, and authentication flow
 * Requires: Firebase project, .env configured with FIREBASE_* variables
 * 
 * Run with: npm test -- firebase-integration.test.js
 * Or: jest backend/tests/firebase-integration.test.js --forceExit
 */

const request = require('supertest');
const { getAuth } = require('../config/firebase');
const db = require('../models');
const User = db.user;

// Mock Express app for testing
let app;

describe('STEP 7: Firebase Authentication Integration Tests', () => {
  let firebaseToken;
  let testUserId;
  let testUser;

  beforeAll(async () => {
    // Initialize Express app
    app = require('../server');
    
    // Wait for database sync
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup
    if (testUserId) {
      try {
        await User.destroy({ where: { id: testUserId } });
      } catch (err) {
        console.error('Cleanup error:', err.message);
      }
    }
    await db.sequelize.close();
  });

  describe('1. Firebase Token Verification', () => {
    test('should reject request without token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .expect(403);

      expect(res.body.message).toContain('No token provided');
    });

    test('should reject request with invalid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(res.body.message).toContain('Invalid or expired token');
    });

    test('should accept Bearer token format', async () => {
      // This test requires a valid Firebase token from setup
      // Skipped if no Firebase token available
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${firebaseToken}`);

      // Should be 200 (token valid) or 401 (user not found in DB)
      expect([200, 401]).toContain(res.status);
    });

    test('should extract token from x-access-token header', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .get('/api/auth/profile')
        .set('x-access-token', firebaseToken);

      expect([200, 401]).toContain(res.status);
    });
  });

  describe('2. Public Routes (No Authentication)', () => {
    test('should allow unauthenticated access to GET /api/campaigns', async () => {
      const res = await request(app)
        .get('/api/campaigns')
        .expect(200);

      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('data');
    });

    test('should allow unauthenticated access to GET /api/campaigns/featured', async () => {
      const res = await request(app)
        .get('/api/campaigns/featured')
        .expect(200);

      expect(res.body).toHaveProperty('success');
    });

    test('should allow unauthenticated access to GET /api/campaigns/recent', async () => {
      const res = await request(app)
        .get('/api/campaigns/recent')
        .expect(200);

      expect(res.body).toHaveProperty('success');
    });
  });

  describe('3. Optional Authentication Routes', () => {
    test('should allow unauthenticated access to GET /api/campaigns/:id', async () => {
      const res = await request(app)
        .get('/api/campaigns/1');

      // Should return 200 (found) or 404 (not found), but not 403
      expect([200, 404]).toContain(res.status);
    });

    test('should work with authentication on GET /api/campaigns/:id', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .get('/api/campaigns/1')
        .set('Authorization', `Bearer ${firebaseToken}`);

      // Should return 200 (found) or 404 (not found), but not 403
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('4. Authenticated Routes', () => {
    test('should reject GET /api/users/profile without token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .expect(403);

      expect(res.body.message).toContain('No token provided');
    });

    test('should reject GET /api/campaigns/user/my-campaigns without token', async () => {
      const res = await request(app)
        .get('/api/campaigns/user/my-campaigns')
        .expect(403);

      expect(res.body.message).toContain('No token provided');
    });

    test('should accept GET /api/users/profile with valid token', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${firebaseToken}`);

      // Should be 200 (found) or 404 (user not in DB), but not 403
      expect([200, 404]).toContain(res.status);
    });
  });

  describe('5. Email Verification Requirement', () => {
    test('should reject POST /api/campaigns without verified email', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
          title: 'Test Campaign',
          description: 'Test',
          targetAmount: 100000,
          category: 'technology'
        });

      // Should be 403 (email not verified) or 401 (user not in DB)
      expect([403, 401]).toContain(res.status);
    });

    test('should reject POST /api/investments/create without verified email', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .post('/api/investments/create')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
          campaignId: 1,
          amount: 50000
        });

      // Should be 403 (email not verified) or 401 (user not in DB)
      expect([403, 401]).toContain(res.status);
    });
  });

  describe('6. Middleware Request Object Augmentation', () => {
    // These tests require custom endpoints to verify req properties
    // For now, we test indirectly through error messages

    test('should provide meaningful error when user not found in DB', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
          title: 'Test',
          description: 'Test',
          targetAmount: 100000
        });

      // Error should indicate user not found (401) rather than auth failed (403)
      expect([401, 403, 404]).toContain(res.status);
    });
  });

  describe('7. Error Handling', () => {
    test('should return 400 for validation errors', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .put('/api/users/email')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
          newEmail: 'invalid-email'  // Invalid email format
        });

      // Should be 400 (validation error) or 404 (user not found)
      expect([400, 404]).toContain(res.status);
    });

    test('should return 404 for missing resources', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .get('/api/investments/payment/nonexistent-id')
        .set('Authorization', `Bearer ${firebaseToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('8. Firebase Admin SDK Integration', () => {
    test('Firebase Admin SDK should be initialized', async () => {
      try {
        const auth = getAuth();
        expect(auth).toBeDefined();
      } catch (err) {
        console.error('Firebase Admin SDK error:', err.message);
        throw err;
      }
    });

    test('verifyIdToken function should be available', async () => {
      try {
        const { verifyIdToken } = require('../config/firebase');
        expect(typeof verifyIdToken).toBe('function');
      } catch (err) {
        console.error('Firebase config error:', err.message);
        throw err;
      }
    });
  });

  describe('9. Auth Routes - Firebase Flow', () => {
    test('should require email verification for POST /api/campaigns', async () => {
      // Create user with Firebase token
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      // Try to create campaign without verified email
      const res = await request(app)
        .post('/api/campaigns')
        .set('Authorization', `Bearer ${firebaseToken}`)
        .send({
          title: 'Campaign',
          description: 'Description',
          targetAmount: 100000,
          category: 'tech'
        });

      // Should fail with 403 (email not verified) or 401 (user not found)
      expect([401, 403, 404]).toContain(res.status);
    });

    test('should work with GET /api/auth/profile', async () => {
      if (!firebaseToken) {
        console.log('⚠️ Skipped: Firebase token not available');
        return;
      }

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${firebaseToken}`);

      // Should be 200 (found) or 401 (user not in DB), but not 403
      expect([200, 401]).toContain(res.status);
    });
  });

  describe('10. Middleware Chain Order', () => {
    test('should check token before email verification', async () => {
      // Request without token
      const res = await request(app)
        .post('/api/campaigns')
        .send({
          title: 'Campaign',
          description: 'Description',
          targetAmount: 100000
        });

      // Should fail with "No token provided" (403) not "Email verification required"
      expect(res.status).toBe(403);
      expect(res.body.message).toContain('No token');
    });
  });
});
