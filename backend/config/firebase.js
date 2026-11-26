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

  // Validate required environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) {
    throw new Error(
      '❌ FIREBASE_PROJECT_ID environment variable is not set. ' +
      'Add it to your .env file. Example: FIREBASE_PROJECT_ID=your-project-id'
    );
  }

  if (!clientEmail) {
    throw new Error(
      '❌ FIREBASE_CLIENT_EMAIL environment variable is not set. ' +
      'Add it to your .env file. Example: FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com'
    );
  }

  if (!privateKey) {
    throw new Error(
      '❌ FIREBASE_PRIVATE_KEY environment variable is not set. ' +
      'Add it to your .env file. The key should start with "-----BEGIN PRIVATE KEY-----" ' +
      'and literal \\n should be converted to real newlines.'
    );
  }

  // Convert literal \n to real newlines in private key
  // Firebase keys from JSON files have literal \n that need to be converted
  const convertedPrivateKey = privateKey.replace(/\\n/g, '\n');

  try {
    // Initialize Firebase Admin SDK
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: convertedPrivateKey
      }),
      projectId: projectId
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`📱 Project: ${projectId}`);

    return firebaseApp;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
    throw new Error(
      'Firebase initialization failed. Check that FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, ' +
      'and FIREBASE_PRIVATE_KEY are correctly set in your .env file. ' +
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
