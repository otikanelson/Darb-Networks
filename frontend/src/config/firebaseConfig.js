import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

// Firebase configuration - using public/non-sensitive values only
// API keys are intentionally public for client-side Firebase SDKs
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC7E1W_T7vZ9kL2m9N3o5P6q8R9s0T1u2V',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'darb-61805.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'darb-61805',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'darb-61805.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abc123def456ghi789'
};

// Initialize Firebase
let app;
let auth;
let googleProvider;
let facebookProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Initialize social providers
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  facebookProvider = new FacebookAuthProvider();
  facebookProvider.addScope('email');
  facebookProvider.addScope('public_profile');

  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
}

export { app, auth, googleProvider, facebookProvider };
