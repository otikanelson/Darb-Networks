/**
 * Firebase Admin SDK Configuration
 * Initializes Firebase for backend authentication and verification
 * 
 * Uses environment variables:
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - FIREBASE_PRIVATE_KEY: Service account private key (with literal \n converted to real newlines)
 */

const admin = require('firebase-admin');

// Track if Firebase is already initialized
let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK once
 * Safe for serverless environments (Vercel) - reuses app if already initialized
 * 
 * @returns {admin.app.App} Firebase app instance
 * @throws {Error} If required environment variables are missing
 */
function initializeFirebase() {
  // Return existing app if already initialized (serverless safety)
  if (firebaseApp) {
    console.log('ℹ️  Firebase Admin SDK already initialized, reusing existing app');
    return firebaseApp;
  }

  let credentials = null;

  // Try to load credentials from Base64-encoded JSON (Vercel/production)
  if (process.env.FIREBASE_CREDENTIALS_BASE64) {
    try {
      const decoded = Buffer.from(process.env.FIREBASE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
      credentials = JSON.parse(decoded);
      console.log('✅ Loaded Firebase credentials from FIREBASE_CREDENTIALS_BASE64');
    } catch (error) {
      console.error('❌ Failed to decode FIREBASE_CREDENTIALS_BASE64:', error.message);
      throw new Error('Invalid FIREBASE_CREDENTIALS_BASE64. It must be a valid Base64-encoded JSON string.');
    }
  }

  // Fallback: Try to load from individual environment variables
  if (!credentials && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
    credentials = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey
    };
    console.log('✅ Loaded Firebase credentials from individual environment variables');
  }

  // Fallback: Try to load from local JSON file (development)
  if (!credentials) {
    const path = require('path');
    const fs = require('fs');
    const credPath = path.join(__dirname, '..', 'darb-61805-firebase-adminsdk-fbsvc-e4b77cf671.json');

    if (fs.existsSync(credPath)) {
      try {
        credentials = JSON.parse(fs.readFileSync(credPath, 'utf-8'));
        console.log('✅ Loaded Firebase credentials from local JSON file');
      } catch (error) {
        console.error('❌ Failed to load local Firebase JSON file:', error.message);
      }
    }
  }

  // If we still don't have credentials, throw an error
  if (!credentials) {
    throw new Error(
      '❌ Firebase credentials not found. Set one of:\n' +
      '1. FIREBASE_CREDENTIALS_BASE64 environment variable (Base64-encoded service account JSON)\n' +
      '2. FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY environment variables\n' +
      '3. Place darb-61805-firebase-adminsdk-fbsvc-e4b77cf671.json in backend/ directory (local development)\n'
    );
  }

  try {
    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.cert(credentials),
      projectId: credentials.projectId
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📱 Project: ${credentials.projectId}`);

    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    throw new Error(
      'Firebase initialization failed. Check your credentials configuration. ' +
      'Error: ' + error.message
    );
  }
}

/**
 * Get Firebase Auth instance
 * 
 * @returns {admin.auth.Auth} Firebase Auth instance
 */
function getAuth() {
  const app = initializeFirebase();
  return admin.auth(app);
}

/**
 * Verify a Firebase ID token
 * Called for every request that needs authentication
 * 
 * @param {string} token - Firebase ID token from Authorization header
 * @returns {Promise<Object>} Decoded token with { uid, email, emailVerified }
 * @throws {Error} If token is invalid or expired
 */
async function verifyIdToken(token) {
  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false
    };
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);

    // Provide helpful error messages
    if (error.code === 'auth/id-token-expired') {
      throw new Error('ID token expired. Please log in again.');
    } else if (error.code === 'auth/invalid-id-token') {
      throw new Error('Invalid ID token.');
    } else if (error.code === 'auth/argument-error') {
      throw new Error('No token provided or token format is invalid.');
    }

    throw error;
  }
}

/**
 * Create a user in Firebase
 * Used during import of existing users with password hashes
 * 
 * @param {Object} userRecord - User data including uid, email, emailVerified, passwordHash
 * @returns {Promise<string>} Firebase UID
 */
async function createUser(userRecord) {
  try {
    const auth = getAuth();
    const user = await auth.createUser(userRecord);
    return user.uid;
  } catch (error) {
    console.error('❌ Failed to create Firebase user:', error.message);
    throw error;
  }
}

/**
 * Import users with password hashes
 * Used to migrate existing users to Firebase while preserving their passwords
 * 
 * @param {Array<Object>} users - Array of user objects with uid, email, emailVerified, passwordHash
 * @param {Object} hashOptions - Hash algorithm and options (e.g., { algorithm: 'BCRYPT' })
 * @returns {Promise<Object>} Import result with { successCount, failureCount, errors }
 */
async function importUsers(users, hashOptions) {
  try {
    const auth = getAuth();
    const result = await auth.importUsers(users, hashOptions);

    console.log(`✅ Imported ${result.successCount} users to Firebase`);
    if (result.failureCount > 0) {
      console.warn(`⚠️  Failed to import ${result.failureCount} users`);
      result.errors.forEach((err, idx) => {
        console.warn(`  User ${idx}: ${err.error.message}`);
      });
    }

    return result;
  } catch (error) {
    console.error('❌ Failed to import users to Firebase:', error.message);
    throw error;
  }
}

/**
 * Get user by email
 * 
 * @param {string} email - User email
 * @returns {Promise<Object>} Firebase user object
 */
async function getUserByEmail(email) {
  try {
    const auth = getAuth();
    return await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    throw error;
  }
}

/**
 * Delete a user
 * 
 * @param {string} uid - Firebase UID
 * @returns {Promise<void>}
 */
async function deleteUser(uid) {
  try {
    const auth = getAuth();
    await auth.deleteUser(uid);
    console.log(`✅ Deleted Firebase user: ${uid}`);
  } catch (error) {
    console.error('❌ Failed to delete Firebase user:', error.message);
    throw error;
  }
}

/**
 * Set custom claims on a user (e.g., for admin role)
 * 
 * @param {string} uid - Firebase UID
 * @param {Object} claims - Custom claims object
 * @returns {Promise<void>}
 */
async function setCustomClaims(uid, claims) {
  try {
    const auth = getAuth();
    await auth.setCustomUserClaims(uid, claims);
    console.log(`✅ Set custom claims for user: ${uid}`);
  } catch (error) {
    console.error('❌ Failed to set custom claims:', error.message);
    throw error;
  }
}

// Export functions
module.exports = {
  initializeFirebase,
  getAuth,
  verifyIdToken,
  createUser,
  importUsers,
  getUserByEmail,
  deleteUser,
  setCustomClaims
};
